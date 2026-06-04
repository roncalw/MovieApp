import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mapPersonMovieCreditToMovie } from '../api/tmdb/services/movieService';
import { usePersonDetailsQuery } from '../hooks/useMovieSearchQuery';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import { getMovieImagePath, getMovieImageUri } from '../utils/movieImages';
import type {
  movieType,
  personDetailType,
  personMovieCastCredit,
  personMovieCrewCredit,
} from '../types/movie/MovieTypes';
import type {
  FilmographyGroup,
  FilmographyItem,
  PersonDetailProps,
} from '../types/movie/personTypes';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const IMAGE_PERSON_NOT_FOUND = require('../assets/images/MissingPersonPlaceholder.png');
const IMAGE_MOVIE_NOT_FOUND = require('../assets/images/MissingMoviePlaceholder.png');

export function PersonDetail({
  personId,
  initialPersonName,
  onBackPress,
  onCloseAllPress,
  onMoviePress,
}: PersonDetailProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: person, isLoading, isError, error } =
    usePersonDetailsQuery(personId);
  const filmography = useMemo(
    () => buildFilmography(person),
    [person]
  );
  const carouselItems = useMemo(
    () => filmography.filter(item => getMovieImagePath(item.movie)).slice(0, 24),
    [filmography]
  );
  const carouselCardWidth = Math.min(width - scaleSize(40), scaleSize(360));
  const carouselCardGap = scaleSize(12);
  const carouselSnapInterval = carouselCardWidth + carouselCardGap;
  const title = person?.name ?? initialPersonName ?? 'Person Detail';

  return (
    <View style={styles.screen}>
      <View style={[styles.topSpacer, { height: insets.top }]} />
      <View style={styles.header}>
        <Pressable
          onPress={onBackPress}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel="Back one page"
        >
          <Ionicons name="chevron-back" size={scaleSize(34)} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleBlock}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.headerTitle}>
            {title}
          </Text>
        </View>
        <Pressable
          onPress={onCloseAllPress}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel="Close all detail pages"
        >
          <Ionicons name="close" size={scaleSize(30)} color={colors.textPrimary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text allowFontScaling={false} style={styles.message}>
            Loading person...
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text allowFontScaling={false} style={styles.errorTitle}>
            Error loading person
          </Text>
          <Text allowFontScaling={false} style={styles.message}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </View>
      ) : person ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profilePanel}>
            <Image
              source={getProfileSource(person.profile_path)}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <View style={styles.profileTextBlock}>
              <Text allowFontScaling={false} style={styles.personName}>
                {person.name}
              </Text>
              <DetailLine label="Known For" value={person.known_for_department} />
              <DetailLine label="Born" value={formatDateText(person.birthday)} />
              {person.deathday ? (
                <DetailLine label="Died" value={formatDateText(person.deathday)} />
              ) : null}
              <DetailLine label="Birthplace" value={person.place_of_birth} />
            </View>
          </View>

          {person.biography ? (
            <Text allowFontScaling={false} numberOfLines={8} style={styles.biography}>
              {person.biography}
            </Text>
          ) : null}

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
                      <Text allowFontScaling={false} numberOfLines={1} style={styles.carouselTitle}>
                        {item.title}
                      </Text>
                      <Text allowFontScaling={false} numberOfLines={2} style={styles.carouselRole}>
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
          {filmography.map(item => (
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
                <Text allowFontScaling={false} numberOfLines={2} style={styles.filmographyTitle}>
                  {item.title}
                </Text>
                <Text allowFontScaling={false} style={styles.filmographyMeta}>
                  {item.year}
                </Text>
                <Text allowFontScaling={false} numberOfLines={2} style={styles.filmographyRole}>
                  {item.roleLabel}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={scaleSize(22)} color={colors.textSecondary} />
            </Pressable>
          ))}

        </ScrollView>
      ) : null}
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <Text allowFontScaling={false} style={styles.detailLine}>
      <Text style={styles.detailLineLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function buildFilmography(person: personDetailType | undefined): FilmographyItem[] {
  if (!person?.movie_credits) {
    return [];
  }

  const groupedItems = new Map<number, FilmographyGroup>();

  person.movie_credits.cast.forEach(credit => {
    addCreditToFilmographyGroup(
      groupedItems,
      credit,
      credit.character || 'Character not listed'
    );
  });

  person.movie_credits.crew.forEach(credit => {
    addCreditToFilmographyGroup(groupedItems, credit, credit.job || 'Crew');
  });

  return Array.from(groupedItems.values()).map(group => ({
    ...group,
    roleLabel: group.roles.join(', '),
  })).sort((left, right) => {
    if (right.releaseDate !== left.releaseDate) {
      return right.releaseDate.localeCompare(left.releaseDate);
    }

    return right.popularity - left.popularity;
  });
}

function addCreditToFilmographyGroup(
  groupedItems: Map<number, FilmographyGroup>,
  credit: personMovieCastCredit | personMovieCrewCredit,
  roleLabel: string
): void {
  const existingGroup = groupedItems.get(credit.id);

  if (existingGroup) {
    addRoleLabel(existingGroup.roles, roleLabel);
    return;
  }

  const movie = mapPersonMovieCreditToMovie(credit);
  const roles: string[] = [];
  addRoleLabel(roles, roleLabel);

  groupedItems.set(credit.id, {
    key: `movie-${credit.id}`,
    movie,
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

function getProfileSource(profilePath: string | null | undefined): ImageSourcePropType {
  return profilePath
    ? { uri: `${TMDB_IMAGE_BASE_URL}/w500${profilePath}` }
    : IMAGE_PERSON_NOT_FOUND;
}

function getMoviePosterSource(movie: movieType): ImageSourcePropType {
  const imageUri = getMovieImageUri(movie);

  return imageUri
    ? { uri: imageUri }
    : IMAGE_MOVIE_NOT_FOUND;
}

function getYear(releaseDate: string) {
  return releaseDate ? releaseDate.slice(0, 4) : 'Year not listed';
}

function formatDateText(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSpacer: {
    backgroundColor: colors.background,
  },
  header: {
    minHeight: scaleSize(64),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  headerIconButton: {
    width: scaleSize(48),
    height: scaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.pageTitle,
    color: colors.brandText,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleSize(28),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
  profilePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(14),
    paddingHorizontal: scaleSize(18),
    paddingTop: scaleSize(18),
  },
  profileImage: {
    width: scaleSize(124),
    height: scaleSize(180),
    borderRadius: scaleSize(8),
    backgroundColor: colors.surfaceMuted,
  },
  profileTextBlock: {
    flex: 1,
  },
  personName: {
    ...typography.detailTitle,
    color: colors.textPrimary,
    marginBottom: scaleSize(8),
  },
  detailLine: {
    ...typography.summaryBody,
    color: colors.textPrimary,
    marginBottom: scaleSize(5),
  },
  detailLineLabel: {
    fontWeight: '700',
  },
  biography: {
    ...typography.detailBody,
    color: colors.textPrimary,
    paddingHorizontal: scaleSize(18),
    paddingTop: scaleSize(16),
  },
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
  filmographyTextBlock: {
    flex: 1,
  },
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
});
