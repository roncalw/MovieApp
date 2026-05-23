/*
Step: 15
   * /MovieApp/src/screens/MovieDetail.tsx
Imported by:
   * /MovieApp/src/screens/HomeScreen.tsx
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Next step path:
   * /MovieApp/src/hooks/queries/useMovieSearchQuery.ts
Purpose:
   * Shows the selected movie detail view inside the existing Home/Search overlay, using the legacy Movie Detail layout as the
     visual reference while keeping unfinished actions such as favorites, trailers, IMDb refresh, and star-rating math inactive.
*/
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View,
  type ImageSourcePropType,
  type ListRenderItem,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMovieDetailsQuery } from '../hooks/queries/useMovieSearchQuery';
import type {
  movieCastProfile,
  movieCrewProfile,
  movieGenres,
  movieWatchProviderType,
  movieType,
  production_company,
  production_country,
  streamTypes,
} from '../types/MovieTypes';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const CINEMA_MENU_BACKGROUND = require('../assets/images/cinema_menu.jpg');
const IMAGE_NOT_FOUND = require('../assets/images/PicNotFoundV6.png');
const IMAGE_IMDB = require('../assets/images/imdb.png');
const IMAGE_TMDB_LOGO = require('../assets/images/TMDB_Logo.png');
const IMAGE_JUSTWATCH_LOGO = require('../assets/images/JustWatch_Logo.png');

type MovieDetailProps = {
  movieId: number;
  initialMovie?: movieType | null;
  onBackPress?: () => void;
};

type CreditPerson = movieCastProfile | movieCrewProfile;

type CreditRailProps = {
  title: string;
  people: CreditPerson[];
};

type DetailInfoRowProps = {
  label: string;
  value: string;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function MovieDetail({
  movieId,
  initialMovie,
  onBackPress,
}: MovieDetailProps) {
  const insets = useSafeAreaInsets();
  const nativeTopSpacerHeight = getNativeTopSpacerHeight(insets.top);
  const {
    data: movieDetails,
    isLoading,
    isError,
    error,
  } = useMovieDetailsQuery(movieId);

  const displayMovie = movieDetails ?? initialMovie ?? null;

  return (
    <View style={styles.screen}>
      <View style={[styles.nativeTopSpacer, { height: nativeTopSpacerHeight }]} />

      <ScrollView
        style={styles.detailScroll}
        contentContainerStyle={styles.detailContent}
      >
        <MovieHero movie={displayMovie} onBackPress={onBackPress} />

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState error={error} />
        ) : movieDetails ? (
          <LoadedMovieDetail movie={movieDetails} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function LoadedMovieDetail({ movie }: { movie: movieType }) {
  const movieRating = getUsCertification(movie);
  const releaseDate = formatReleaseDate(movie.release_date);
  const cast = movie.credits?.cast ?? [];
  const crew = movie.credits?.crew ?? [];
  const productionCompanies = movie.production_companies ?? [];
  const productionCountries = movie.production_countries ?? [];
  const usWatchProviders = movie['watch/providers']?.results?.US;

  return (
    <>
      <View style={styles.summaryCard}>
        <View style={styles.actionIconRow}>
          <View style={styles.staticHeartIcon}>
            <Ionicons name="heart-outline" size={scaleSize(48)} color="red" />
          </View>

          <View style={styles.staticPlayButton}>
            <Ionicons
              name="caret-forward-outline"
              size={scaleSize(30)}
              color={colors.actionOnPrimary}
            />
          </View>
        </View>

        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={2}
          style={styles.movieTitle}
        >
          {movie.title}
        </Text>

        <GenreList genres={movie.genres ?? []} />
        <StaticStarRating />

        <Text
          allowFontScaling={false}
          numberOfLines={20}
          style={styles.overview}
        >
          {movie.overview || 'Overview is not available.'}
        </Text>

        {movieRating ? (
          <Text allowFontScaling={false} style={styles.boldMetaText}>
            Rated: {movieRating}
          </Text>
        ) : null}

        <Text allowFontScaling={false} style={styles.boldMetaText}>
          Release Date: {releaseDate}
        </Text>
      </View>

      <CreditRail title="Cast" people={cast} />
      <CreditRail title="Crew" people={crew} />

      <Text allowFontScaling={false} style={styles.sectionLabel}>
        Details
      </Text>
      <View style={styles.infoPanel}>
        <DetailInfoRow label="Budget" value={formatCurrency(movie.budget)} />
        <DetailInfoRow label="Revenue" value={formatCurrency(movie.revenue)} />
        <DetailInfoRow
          label="Total Runtime"
          value={formatRuntime(movie.runtime)}
        />
      </View>

      <StreamingSection providers={usWatchProviders} />

      {productionCompanies.length > 0 ? (
        <>
          <Text allowFontScaling={false} style={styles.sectionLabel}>
            Produced by ...
          </Text>
          <View style={styles.infoPanel}>
            {productionCompanies.map(company => (
              <CompanyRow key={company.id} company={company} />
            ))}
          </View>
        </>
      ) : null}

      {productionCountries.length > 0 ? (
        <>
          <Text allowFontScaling={false} style={styles.sectionLabel}>
            Production Locations
          </Text>
          <ProductionCountries countries={productionCountries} />
        </>
      ) : null}

      <LegacyFooter />
    </>
  );
}

function MovieHero({
  movie,
  onBackPress,
}: {
  movie: movieType | null;
  onBackPress?: () => void;
}) {
  const posterSource = getPosterSource(movie);

  return (
    <ImageBackground
      source={CINEMA_MENU_BACKGROUND}
      style={styles.heroBackground}
      imageStyle={styles.heroBackgroundImage}
      resizeMode="repeat"
    >
      <View style={styles.heroScrim}>
        {onBackPress ? (
          <Pressable
            onPress={onBackPress}
            style={styles.heroBackButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={scaleSize(44)} color="#800000" />
          </Pressable>
        ) : null}

        <Image
          source={posterSource}
          style={styles.heroPoster}
          resizeMode="cover"
        />

        <View style={styles.imdbBadge}>
          <Image
            source={IMAGE_IMDB}
            style={styles.imdbLogo}
            resizeMode="contain"
            accessibilityLabel="IMDb"
          />
          <Text allowFontScaling={false} style={styles.imdbRatingText}>
            No Data
          </Text>
          <Text allowFontScaling={false} style={styles.imdbVotesText}>
            Tap to Refresh
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

function StreamingSection({ providers }: { providers?: streamTypes }) {
  return (
    <>
      <Text allowFontScaling={false} style={styles.sectionLabel}>
        Streaming on ...
      </Text>

      <WatchProviderCategory
        label="Free (With Ads):"
        providers={providers?.ads}
      />
      <WatchProviderCategory
        label="Subscription:"
        providers={providers?.flatrate}
      />
      <WatchProviderCategory label="Rent:" providers={providers?.rent} />
    </>
  );
}

function WatchProviderCategory({
  label,
  providers,
}: {
  label: string;
  providers?: movieWatchProviderType[];
}) {
  const hasProviders = providers && providers.length > 0;

  return (
    <View style={styles.watchProviderPanel}>
      <Text allowFontScaling={false} style={styles.watchProviderLabel}>
        {label}
      </Text>

      {hasProviders ? (
        providers.map(provider => (
          <View key={provider.provider_id} style={styles.watchProviderRow}>
            <Image
              source={getLogoSource(provider.logo_path)}
              style={styles.watchProviderLogo}
              resizeMode="contain"
            />
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.watchProviderName}
            >
              {provider.provider_name}
            </Text>
          </View>
        ))
      ) : (
        <Text allowFontScaling={false} style={styles.watchProviderUnavailable}>
          (Not available)
        </Text>
      )}
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.feedbackPanel}>
      <ActivityIndicator size="large" />
      <Text allowFontScaling={false} style={styles.message}>
        Loading movie details...
      </Text>
    </View>
  );
}

function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error';

  return (
    <View style={styles.feedbackPanel}>
      <Text allowFontScaling={false} style={styles.errorText}>
        Error loading movie details
      </Text>
      <Text allowFontScaling={false} style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

function GenreList({ genres }: { genres: movieGenres[] }) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.genresContainer}>
      {genres.map(genre => (
        <Text allowFontScaling={false} style={styles.genre} key={genre.id}>
          {genre.name}
        </Text>
      ))}
    </View>
  );
}

function StaticStarRating() {
  // Static visual placeholder only. The rating formula will be wired after the detail layout is complete.
  return (
    <View style={styles.starRow} accessibilityLabel="Movie rating placeholder">
      {[0, 1, 2, 3].map(starIndex => (
        <Ionicons
          key={starIndex}
          name="star"
          size={scaleSize(28)}
          color="gold"
        />
      ))}
      <Ionicons
        name="star"
        size={scaleSize(28)}
        color="#FFFFFF"
        style={styles.emptyStar}
      />
    </View>
  );
}

function CreditRail({ title, people }: CreditRailProps) {
  if (people.length === 0) {
    return null;
  }

  const renderItem: ListRenderItem<CreditPerson> = ({ item }) => (
    <CreditCard person={item} />
  );

  return (
    <>
      <Text allowFontScaling={false} style={styles.sectionLabel}>
        {title}
      </Text>
      <FlatList
        data={people}
        horizontal
        keyExtractor={(item, index) => `${title}-${item.id}-${index}`}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.creditListContent}
      />
    </>
  );
}

function CreditCard({ person }: { person: CreditPerson }) {
  const subtitle = getCreditSubtitle(person);

  return (
    <View style={styles.creditCard}>
      <Image
        source={getProfileSource(person.profile_path)}
        style={styles.profileImage}
        resizeMode="cover"
      />
      <View style={styles.creditTextBlock}>
        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={2}
          style={styles.creditName}
        >
          {person.name}
        </Text>
        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={2}
          style={styles.creditSubtitle}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function DetailInfoRow({ label, value }: DetailInfoRowProps) {
  return (
    <Text allowFontScaling={false} style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function CompanyRow({ company }: { company: production_company }) {
  return (
    <View style={styles.companyRow}>
      <Image
        source={getLogoSource(company.logo_path)}
        style={styles.companyLogo}
        resizeMode="contain"
      />
      <Text
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.companyName}
      >
        {company.name}
      </Text>
    </View>
  );
}

function ProductionCountries({ countries }: { countries: production_country[] }) {
  return (
    <View style={styles.productionCountriesPanel}>
      {countries.map(country => (
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          key={country.iso_3166_1}
          style={styles.productionCountry}
        >
          -{country.name}-
        </Text>
      ))}
    </View>
  );
}

function LegacyFooter() {
  return (
    <View style={styles.footer}>
      <Text allowFontScaling={false} style={styles.footerStrong}>
        --Licensed By CodeFest--
      </Text>

      <Text allowFontScaling={false} style={styles.footerText}>
        -Powered By-
      </Text>

      <View style={styles.footerLogoRow}>
        <Image
          source={IMAGE_TMDB_LOGO}
          style={styles.tmdbLogo}
          resizeMode="contain"
        />
        <Image
          source={IMAGE_JUSTWATCH_LOGO}
          style={styles.justWatchLogo}
          resizeMode="contain"
        />
      </View>

      <Text allowFontScaling={false} style={styles.footerText}>
        -Reviews By-
      </Text>

      <Image
        source={IMAGE_IMDB}
        style={styles.footerImdbLogo}
        resizeMode="contain"
        accessibilityLabel="IMDb Reviews"
      />
    </View>
  );
}

function getPosterSource(movie: movieType | null): ImageSourcePropType {
  const imagePath = movie?.poster_path ?? movie?.backdrop_path;

  return imagePath ? { uri: buildImageUrl('w500', imagePath) } : IMAGE_NOT_FOUND;
}

function getProfileSource(profilePath: string | null | undefined) {
  return profilePath
    ? { uri: buildImageUrl('w500', profilePath) }
    : IMAGE_NOT_FOUND;
}

function getLogoSource(logoPath: string | null | undefined) {
  return logoPath ? { uri: buildImageUrl('w500', logoPath) } : IMAGE_NOT_FOUND;
}

function buildImageUrl(size: 'w500', path: string) {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function getCreditSubtitle(person: CreditPerson) {
  if ('character' in person) {
    return person.character || 'Character not listed';
  }

  return person.job || 'Crew';
}

function getUsCertification(movie: movieType) {
  const usRelease = movie.release_dates?.results?.find(
    releaseCountry => releaseCountry.iso_3166_1 === 'US'
  );
  const releaseDetailWithCertification = usRelease?.release_dates?.find(
    releaseDetail => releaseDetail.certification
  );

  return releaseDetailWithCertification?.certification ?? '';
}

function formatReleaseDate(releaseDate: string | undefined) {
  if (!releaseDate) {
    return 'Data not available.';
  }

  const date = new Date(`${releaseDate}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return releaseDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(value: number | undefined) {
  return value && value > 0 ? currencyFormatter.format(value) : 'Data not available.';
}

function formatRuntime(runtime: number | undefined) {
  return runtime && runtime > 0 ? `${runtime} minutes` : 'Data not available.';
}

/*
  Movie Detail intentionally owns its top native spacer.

  The app-level SafeAreaView protects only the left and right edges because the
  Home screen hero is designed to draw behind the top status area. The legacy
  Movie Detail screen is different: it starts below the phone time, Wi-Fi, and
  battery icons. This helper keeps that rule local to Movie Detail and prevents
  the spacer from collapsing if a simulator or Android device reports a zero
  top safe-area inset.
*/
function getNativeTopSpacerHeight(topInset: number) {
  const fallbackTopSpacer =
    Platform.OS === 'android'
      ? StatusBar.currentHeight ?? scaleSize(24)
      : scaleSize(54);

  return Math.max(topInset, fallbackTopSpacer);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nativeTopSpacer: {
    width: '100%',
    backgroundColor: colors.background,
  },
  detailScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContent: {
    paddingBottom: scaleSize(28),
    backgroundColor: colors.background,
  },
  heroBackground: {
    width: '100%',
    minHeight: scaleSize(326),
  },
  heroBackgroundImage: {
    opacity: 1,
  },
  heroScrim: {
    minHeight: scaleSize(326),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: scaleSize(14),
  },
  heroBackButton: {
    position: 'absolute',
    top: scaleSize(8),
    left: scaleSize(8),
    zIndex: 3,
    width: scaleSize(58),
    height: scaleSize(58),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPoster: {
    width: scaleSize(185),
    height: scaleSize(278),
    borderRadius: scaleSize(20),
    backgroundColor: '#eeeeee',
  },
  imdbBadge: {
    position: 'absolute',
    top: scaleSize(12),
    right: scaleSize(14),
    width: scaleSize(88),
    minHeight: scaleSize(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imdbLogo: {
    width: scaleSize(42),
    height: scaleSize(20),
  },
  imdbRatingText: {
    marginTop: scaleSize(1),
    color: colors.brandText,
    fontSize: scaleSize(13),
    lineHeight: scaleSize(16),
    fontWeight: '700',
    letterSpacing: 0,
  },
  imdbVotesText: {
    color: colors.brandText,
    fontSize: scaleSize(10),
    lineHeight: scaleSize(12),
    fontWeight: '400',
    letterSpacing: 0,
  },
  summaryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  actionIconRow: {
    position: 'absolute',
    top: scaleSize(-25),
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: scaleSize(20),
    paddingRight: scaleSize(25),
  },
  staticHeartIcon: {
    width: scaleSize(50),
    height: scaleSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticPlayButton: {
    width: scaleSize(50),
    height: scaleSize(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(25),
    backgroundColor: '#4481FC',
  },
  movieTitle: {
    color: colors.textPrimary,
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: scaleSize(23),
    marginBottom: scaleSize(10),
    paddingHorizontal: scaleSize(16),
    textAlign: 'center',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: scaleSize(2),
    marginBottom: scaleSize(18),
    paddingHorizontal: scaleSize(16),
  },
  genre: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginHorizontal: scaleSize(5),
    marginBottom: scaleSize(4),
  },
  starRow: {
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStar: {
    textShadowColor: '#BDBDBD',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  overview: {
    ...typography.detailBody,
    color: colors.textPrimary,
    padding: scaleSize(15),
    textAlign: 'left',
  },
  boldMetaText: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: scaleSize(4),
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: scaleSize(20),
    marginBottom: scaleSize(10),
    marginLeft: scaleSize(5),
  },
  creditListContent: {
    paddingLeft: scaleSize(5),
    paddingRight: scaleSize(5),
  },
  creditCard: {
    alignItems: 'center',
    paddingRight: scaleSize(10),
  },
  profileImage: {
    width: scaleSize(125),
    height: scaleSize(200),
    borderRadius: scaleSize(20),
    backgroundColor: '#eeeeee',
  },
  creditTextBlock: {
    alignItems: 'center',
    width: scaleSize(115),
    marginTop: scaleSize(4),
  },
  creditName: {
    color: colors.textPrimary,
    fontSize: scaleSize(13),
    lineHeight: scaleSize(17),
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
  },
  creditSubtitle: {
    color: colors.textPrimary,
    fontSize: scaleSize(13),
    lineHeight: scaleSize(17),
    fontWeight: '400',
    letterSpacing: 0,
    textAlign: 'center',
  },
  infoPanel: {
    marginLeft: scaleSize(5),
    marginRight: scaleSize(5),
    padding: scaleSize(7),
    borderRadius: scaleSize(10),
    backgroundColor: '#eeeeee',
  },
  infoRow: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginBottom: scaleSize(2),
  },
  infoLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  watchProviderPanel: {
    marginLeft: scaleSize(5),
    marginRight: scaleSize(5),
    marginBottom: scaleSize(10),
    padding: scaleSize(7),
    borderRadius: scaleSize(10),
    backgroundColor: '#eeeeee',
  },
  watchProviderLabel: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginBottom: scaleSize(2),
  },
  watchProviderRow: {
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(7),
  },
  watchProviderLogo: {
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(5),
    backgroundColor: '#ffffff',
  },
  watchProviderName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginLeft: scaleSize(10),
  },
  watchProviderUnavailable: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
  },
  companyRow: {
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  },
  companyLogo: {
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(5),
    backgroundColor: '#ffffff',
  },
  companyName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginLeft: scaleSize(10),
  },
  productionCountriesPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: scaleSize(5),
    marginRight: scaleSize(5),
    paddingVertical: scaleSize(7),
    paddingRight: scaleSize(10),
    backgroundColor: '#eeeeee',
  },
  productionCountry: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginLeft: scaleSize(10),
  },
  footer: {
    alignItems: 'center',
    marginTop: scaleSize(40),
    marginBottom: scaleSize(50),
  },
  footerStrong: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
  },
  footerText: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    fontWeight: '400',
    letterSpacing: 0,
    marginTop: scaleSize(10),
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eeeeee',
    paddingTop: scaleSize(10),
    paddingHorizontal: scaleSize(14),
  },
  tmdbLogo: {
    width: scaleSize(48),
    height: scaleSize(35),
  },
  justWatchLogo: {
    width: scaleSize(48),
    height: scaleSize(48),
    marginLeft: scaleSize(35),
  },
  footerImdbLogo: {
    width: scaleSize(70),
    height: scaleSize(35),
    marginTop: scaleSize(10),
  },
  feedbackPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleSize(24),
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(10),
    textAlign: 'center',
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.feedbackTitle,
    color: colors.brandText,
  },
});
