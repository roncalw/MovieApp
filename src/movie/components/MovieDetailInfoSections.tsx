/**
 * Movie Detail information sections.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx
 *
 * Code flow:
 * 1. LoadedMovieDetail passes the fully loaded TMDB movie object here.
 * 2. This component formats budget, revenue, runtime, streaming providers,
 *    production companies, production countries, and attribution logos.
 * 3. Streaming providers come from their own TMDB request, so this component
 *    distinguishes loading, temporary failure, and a successful empty result.
 */
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Text,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import {
  useMovieWatchProvidersQuery,
  useStreamingProviderCatalogQuery,
} from '../../hooks/useMovieSearchQuery';
import type {
  movieType,
  movieWatchProviderType,
  production_company,
  production_country,
  streamTypes,
} from '../../types/movie/MovieTypes';
import type { DetailInfoRowProps } from '../../types/movie/movieDetailTypes';
import {
  DetailResourceError,
  DetailResourceLoading,
} from '../../shared/DetailResourceState';
import { imageAssets } from '../../styles/assets';
import { movieDetailInfoSectionStyles as styles } from '../../styles/movie/movieDetailInfoSectionStyles';
import { ScrollFriendlyTapTarget } from '../../shared/ScrollFriendlyTapTarget';
import { useStreamingProviderLaunch } from '../streaming/useStreamingProviderLaunch';
import { colors } from '../../styles/colors';
import { scaleSize } from '../../styles/scale';
import {
  groupSubscriptionProviders,
  type RoutedWatchProvider,
} from '../streaming/groupSubscriptionProviders';
import {
  subscriptionRouteForProviderId,
  subscriptionRouteLabel,
  unconfiguredSubscriptionRoute,
  type SubscriptionRoute,
  type WatchMonetizationType,
} from '../../api/cloudflare/subscriptionRoutes';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function MovieDetailInfoSections({
  movieId,
  movie,
}: {
  movieId: number;
  movie: movieType;
}) {
  const watchProvidersQuery = useMovieWatchProvidersQuery(movieId);
  const productionCompanies = movie.production_companies ?? [];
  const productionCountries = movie.production_countries ?? [];
  const usWatchProviders = watchProvidersQuery.data?.results?.US;

  return (
    <>
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

      <StreamingSection
        movieId={movieId}
        error={watchProvidersQuery.error}
        failed={watchProvidersQuery.isError}
        isLoading={watchProvidersQuery.isLoading}
        isRetrying={watchProvidersQuery.isFetching}
        onRetry={watchProvidersQuery.refetch}
        providers={usWatchProviders}
      />

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

function StreamingSection({
  movieId,
  error,
  failed,
  isLoading,
  isRetrying,
  onRetry,
  providers,
}: {
  movieId: number;
  error: unknown;
  failed: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  providers?: streamTypes;
}) {
  // The existing provider list is US-only. Send that same country to the
  // resolver; cached destinations never add providers to this TMDB list.
  const streamingLaunch = useStreamingProviderLaunch(movieId, 'US');
  const providerCatalog = useStreamingProviderCatalogQuery('US').data ?? [];
  return (
    <>
      <Text allowFontScaling={false} style={styles.sectionLabel}>
        Streaming on ...
      </Text>

      {failed ? (
        <DetailResourceError
          compact
          error={error}
          isRetrying={isRetrying}
          message="Streaming information could not be loaded."
          onRetry={onRetry}
          title="Streaming information is temporarily unavailable"
        />
      ) : isLoading ? (
        <DetailResourceLoading
          compact
          message="Loading streaming information..."
        />
      ) : (
        <>
          <WatchProviderCategory
            catalog={providerCatalog}
            label="Free (With Ads):"
            monetizationType="ads"
            providers={providers?.ads}
            streamingLaunch={streamingLaunch}
          />
          <WatchProviderCategory
            catalog={providerCatalog}
            groupSubscriptions
            label="Direct Subscriptions"
            monetizationType="flatrate"
            providers={providers?.flatrate}
            streamingLaunch={streamingLaunch}
          />
          <WatchProviderCategory
            catalog={providerCatalog}
            label="Rent:"
            monetizationType="rent"
            providers={providers?.rent}
            streamingLaunch={streamingLaunch}
          />
          {streamingLaunch.message ? (
            <Text
              accessibilityLiveRegion="polite"
              allowFontScaling={false}
              style={styles.streamingMessage}
            >
              {streamingLaunch.message}
            </Text>
          ) : null}
        </>
      )}
    </>
  );
}

function WatchProviderCategory({
  catalog,
  groupSubscriptions = false,
  label,
  monetizationType,
  providers,
  streamingLaunch,
}: {
  catalog: readonly SubscriptionRoute[];
  groupSubscriptions?: boolean;
  label: string;
  monetizationType: WatchMonetizationType;
  providers?: movieWatchProviderType[];
  streamingLaunch: ReturnType<typeof useStreamingProviderLaunch>;
}) {
  const hasProviders = providers && providers.length > 0;
  const groups = groupSubscriptions
    ? groupSubscriptionProviders(providers, catalog)
    : [];
  const routedProviders = groupSubscriptions
    ? []
    : routeWatchProviders(providers, catalog);

  return (
    <View style={styles.watchProviderPanel}>
      <Text allowFontScaling={false} style={styles.watchProviderLabel}>
        {label}
      </Text>

      {hasProviders ? (
        groupSubscriptions ? (
          groups.map(group => (
            <View
              key={group.key}
              style={
                group.key === 'direct' ? undefined : styles.subscriptionGroup
              }
            >
              {group.key !== 'direct' ? (
                <Text
                  allowFontScaling={false}
                  accessibilityRole="header"
                  style={styles.subscriptionGroupLabel}
                >
                  {group.label}
                </Text>
              ) : null}
              <View
                style={
                  group.key === 'direct'
                    ? undefined
                    : styles.subscriptionGroupRows
                }
              >
                <WatchProviderRows
                  monetizationType={monetizationType}
                  providers={group.providers}
                  streamingLaunch={streamingLaunch}
                />
              </View>
            </View>
          ))
        ) : (
          <WatchProviderRows
            monetizationType={monetizationType}
            providers={routedProviders}
            streamingLaunch={streamingLaunch}
          />
        )
      ) : (
        <Text allowFontScaling={false} style={styles.watchProviderUnavailable}>
          (Not available)
        </Text>
      )}
    </View>
  );
}

function WatchProviderRows({
  monetizationType,
  providers,
  streamingLaunch,
}: {
  monetizationType: WatchMonetizationType;
  providers: RoutedWatchProvider[];
  streamingLaunch: ReturnType<typeof useStreamingProviderLaunch>;
}) {
  return (
    <>
      {providers.map(provider => {
        const routeLabel = subscriptionRouteLabel(provider.route);
        const canOpen = provider.route.launchAvailable;
        const isOpening =
          streamingLaunch.openingProviderId === provider.provider_id;
        const content = (
          <>
            <Image
              source={getLogoSource(provider.logo_path)}
              style={styles.watchProviderLogo}
              resizeMode="contain"
            />
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={2}
              style={styles.watchProviderName}
            >
              {provider.route.displayServiceName}
            </Text>
            <View style={styles.providerOpenAction}>
              {isOpening ? (
                <ActivityIndicator color={colors.brandText} size="small" />
              ) : canOpen ? (
                <View style={styles.providerOpenButton}>
                  <Ionicons
                    color={colors.brandText}
                    name="play"
                    size={scaleSize(11)}
                    style={styles.providerOpenIcon}
                  />
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={styles.providerOpenLabel}
                  >
                    Watch Now
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        );
        return canOpen ? (
          <ScrollFriendlyTapTarget
            key={provider.provider_id}
            accessibilityLabel={
              isOpening
                ? `Opening ${routeLabel}`
                : `Open movie on ${routeLabel}`
            }
            accessibilityRole="link"
            accessibilityState={{ busy: isOpening }}
            disabled={streamingLaunch.openingProviderId !== null}
            onPress={() => {
              void streamingLaunch.openProvider(
                provider.provider_id,
                monetizationType,
                provider.route,
              );
            }}
            style={styles.watchProviderRow}
          >
            {content}
          </ScrollFriendlyTapTarget>
        ) : (
          <View key={provider.provider_id} style={styles.watchProviderRow}>
            {content}
          </View>
        );
      })}
    </>
  );
}

function routeWatchProviders(
  providers: readonly movieWatchProviderType[] = [],
  catalog: readonly SubscriptionRoute[],
): RoutedWatchProvider[] {
  const unique = new Map<number, RoutedWatchProvider>();
  for (const provider of providers) {
    if (unique.has(provider.provider_id)) continue;
    unique.set(provider.provider_id, {
      ...provider,
      route:
        subscriptionRouteForProviderId(provider.provider_id, catalog) ??
        unconfiguredSubscriptionRoute(
          provider.provider_id,
          provider.provider_name,
        ),
    });
  }
  return [...unique.values()];
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

function ProductionCountries({
  countries,
}: {
  countries: production_country[];
}) {
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
          source={imageAssets.tmdbLogo}
          style={styles.tmdbLogo}
          resizeMode="contain"
        />
        <Image
          source={imageAssets.justWatchLogo}
          style={styles.justWatchLogo}
          resizeMode="contain"
        />
        <ScrollFriendlyTapTarget
          accessibilityLabel="Movie of the Night streaming availability credits"
          onPress={() => {
            Alert.alert(
              'Movie of the Night',
              'Streaming availability information provided by Streaming Availability API by Movie of the Night.',
              [
                { text: 'Close', style: 'cancel' },
                {
                  text: 'Visit Website',
                  onPress: () => {
                    void Linking.openURL(
                      'https://www.movieofthenight.com/about/api',
                    ).catch(() => {});
                  },
                },
              ],
            );
          }}
          style={styles.movieOfTheNightLink}
        >
          <Image
            source={imageAssets.movieOfTheNightLogo}
            style={styles.movieOfTheNightLogo}
            resizeMode="contain"
            accessible={false}
          />
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={styles.movieOfTheNightName}
          >
            Movie of the Night
          </Text>
        </ScrollFriendlyTapTarget>
      </View>

      <Text allowFontScaling={false} style={styles.footerText}>
        -Reviews By-
      </Text>

      <Image
        source={imageAssets.imdbLogo}
        style={styles.footerImdbLogo}
        resizeMode="contain"
        accessibilityLabel="IMDb Reviews"
      />
    </View>
  );
}

function getLogoSource(logoPath: string | null | undefined) {
  return logoPath
    ? { uri: buildImageUrl('w500', logoPath) }
    : imageAssets.missingMovie;
}

function buildImageUrl(size: 'w500', path: string) {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function formatCurrency(value: number | undefined) {
  return value && value > 0
    ? currencyFormatter.format(value)
    : 'Data not available.';
}

function formatRuntime(runtime: number | undefined) {
  return runtime && runtime > 0 ? `${runtime} minutes` : 'Data not available.';
}
