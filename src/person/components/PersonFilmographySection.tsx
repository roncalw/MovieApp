/**
 * Movie-history feature for Person Detail.
 *
 * The component owns the secondary movie-credits query because no other part
 * of Person Detail needs that response. Loading or retrying filmography now
 * redraws only this section instead of the person's profile and biography.
 */
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { mapPersonMovieCreditToMovie } from '../../api/tmdb/services/movieService';
import { usePersonMovieCreditsQuery } from '../../hooks/useMovieSearchQuery';
import {
  DetailResourceError,
  DetailResourceLoading,
} from '../../shared/DetailResourceState';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import type {
  movieType,
  personMovieCastCredit,
  personMovieCredits,
  personMovieCrewCredit,
} from '../../types/movie/MovieTypes';
import type {
  FilmographyGroup,
  FilmographyItem,
} from '../../types/movie/personTypes';
import { getMovieImagePath, getMovieImageUri } from '../../utils/movieImages';

const IMAGE_MOVIE_NOT_FOUND = require('../../assets/images/MissingMoviePlaceholder.png');

export function PersonFilmographySection({
  onMoviePress,
  personId,
}: {
  onMoviePress: (movie: movieType) => void;
  personId: number;
}) {
  const { width } = useWindowDimensions();
  const movieCreditsQuery = usePersonMovieCreditsQuery(personId);
  const filmography = useMemo(
    () => buildFilmography(movieCreditsQuery.data),
    [movieCreditsQuery.data],
  );
  const carouselItems = useMemo(
    () =>
      filmography.filter(item => getMovieImagePath(item.movie)).slice(0, 24),
    [filmography],
  );
  const carouselCardWidth = Math.min(width - scaleSize(40), scaleSize(360));
  const carouselCardGap = scaleSize(12);
  const carouselSnapInterval = carouselCardWidth + carouselCardGap;

  if (movieCreditsQuery.isLoading) {
    return <DetailResourceLoading compact message="Loading movie history..." />;
  }

  if (movieCreditsQuery.isError) {
    return (
      <DetailResourceError
        compact
        error={movieCreditsQuery.error}
        isRetrying={movieCreditsQuery.isFetching}
        message="Movie history could not be loaded."
        onRetry={movieCreditsQuery.refetch}
        title="Movie history is temporarily unavailable"
      />
    );
  }

  return (
    <>
      {carouselItems.length > 0 ? (
        <>
          <Text allowFontScaling={false} style={styles.sectionTitle}>
            Movie History
          </Text>
          <FlatList
            horizontal
            data={carouselItems}
            keyExtractor={item => `carousel-${item.key}`}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={carouselSnapInterval}
            disableIntervalMomentum
            contentContainerStyle={styles.carouselContent}
            getItemLayout={(_, index) => ({
              length: carouselSnapInterval,
              offset: carouselSnapInterval * index,
              index,
            })}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onMoviePress(item.movie)}
                style={[
                  styles.carouselCard,
                  {
                    width: carouselCardWidth,
                    marginRight: carouselCardGap,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}`}
              >
                <Image
                  source={getMoviePosterSource(item.movie)}
                  style={styles.carouselPoster}
                  resizeMode="cover"
                />
                <View style={styles.carouselTextBlock}>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={styles.carouselTitle}
                  >
                    {item.title}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={2}
                    style={styles.carouselRole}
                  >
                    {item.roleLabel}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </>
      ) : null}

      <Text allowFontScaling={false} style={styles.sectionTitle}>
        Filmography
      </Text>
      {filmography.length === 0 ? (
        <Text allowFontScaling={false} style={styles.emptyFilmography}>
          No movie history is available.
        </Text>
      ) : (
        filmography.map(item => (
          <Pressable
            key={item.key}
            onPress={() => onMoviePress(item.movie)}
            style={styles.filmographyRow}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Image
              source={getMoviePosterSource(item.movie)}
              style={styles.filmographyPoster}
              resizeMode="cover"
            />
            <View style={styles.filmographyTextBlock}>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={styles.filmographyTitle}
              >
                {item.title}
              </Text>
              <Text allowFontScaling={false} style={styles.filmographyMeta}>
                {item.year}
              </Text>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={styles.filmographyRole}
              >
                {item.roleLabel}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={scaleSize(22)}
              color={colors.textSecondary}
            />
          </Pressable>
        ))
      )}
    </>
  );
}

function buildFilmography(
  movieCredits: personMovieCredits | undefined,
): FilmographyItem[] {
  if (!movieCredits) {
    return [];
  }

  const groupedItems = new Map<number, FilmographyGroup>();

  movieCredits.cast.forEach(credit => {
    addCreditToFilmographyGroup(
      groupedItems,
      credit,
      credit.character || 'Character not listed',
    );
  });
  movieCredits.crew.forEach(credit => {
    addCreditToFilmographyGroup(groupedItems, credit, credit.job || 'Crew');
  });

  return Array.from(groupedItems.values())
    .map(group => ({ ...group, roleLabel: group.roles.join(', ') }))
    .sort((left, right) => {
      if (right.releaseDate !== left.releaseDate) {
        return right.releaseDate.localeCompare(left.releaseDate);
      }

      return right.popularity - left.popularity;
    });
}

function addCreditToFilmographyGroup(
  groupedItems: Map<number, FilmographyGroup>,
  credit: personMovieCastCredit | personMovieCrewCredit,
  roleLabel: string,
) {
  const existingGroup = groupedItems.get(credit.id);

  if (existingGroup) {
    addRoleLabel(existingGroup.roles, roleLabel);
    return;
  }

  const roles: string[] = [];
  addRoleLabel(roles, roleLabel);
  groupedItems.set(credit.id, {
    key: `movie-${credit.id}`,
    movie: mapPersonMovieCreditToMovie(credit),
    title: credit.title || credit.original_title || 'Untitled',
    year: getYear(credit.release_date),
    releaseDate: credit.release_date || '',
    popularity: credit.popularity,
    roles,
  });
}

function addRoleLabel(roles: string[], roleLabel: string) {
  if (!roles.includes(roleLabel)) {
    roles.push(roleLabel);
  }
}

function getMoviePosterSource(movie: movieType): ImageSourcePropType {
  const imageUri = getMovieImageUri(movie);

  return imageUri ? { uri: imageUri } : IMAGE_MOVIE_NOT_FOUND;
}

function getYear(releaseDate: string) {
  return releaseDate ? releaseDate.slice(0, 4) : 'Year not listed';
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.sectionLabel,
    color: colors.textPrimary,
    marginTop: scaleSize(20),
    marginBottom: scaleSize(10),
    marginLeft: scaleSize(18),
  },
  carouselContent: {
    paddingLeft: scaleSize(18),
    paddingRight: scaleSize(18),
  },
  carouselCard: {
    borderRadius: scaleSize(8),
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  carouselPoster: {
    width: '100%',
    height: scaleSize(430),
    backgroundColor: colors.surfaceMuted,
  },
  carouselTextBlock: {
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(10),
    backgroundColor: colors.textPrimary,
  },
  carouselTitle: {
    ...typography.summaryTitle,
    color: colors.actionOnPrimary,
  },
  carouselRole: {
    ...typography.summaryBody,
    color: colors.actionOnPrimary,
    marginTop: scaleSize(2),
  },
  filmographyRow: {
    minHeight: scaleSize(104),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(12),
    paddingHorizontal: scaleSize(18),
    paddingVertical: scaleSize(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  filmographyPoster: {
    width: scaleSize(58),
    height: scaleSize(86),
    borderRadius: scaleSize(5),
    backgroundColor: colors.surfaceMuted,
  },
  filmographyTextBlock: { flex: 1 },
  filmographyTitle: {
    ...typography.summaryTitle,
    color: colors.textPrimary,
  },
  filmographyMeta: {
    ...typography.summaryBody,
    color: colors.textSecondary,
    marginTop: scaleSize(2),
  },
  filmographyRole: {
    ...typography.summaryBody,
    color: colors.textPrimary,
    marginTop: scaleSize(2),
  },
  emptyFilmography: {
    ...typography.summaryBody,
    color: colors.textSecondary,
    marginHorizontal: scaleSize(18),
    marginBottom: scaleSize(20),
  },
});
