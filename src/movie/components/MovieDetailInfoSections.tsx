/**
 * Non-interactive Movie Detail information sections.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx
 *
 * Code flow:
 * 1. LoadedMovieDetail passes the fully loaded TMDB movie object here.
 * 2. This component formats budget, revenue, runtime, streaming providers,
 *    production companies, production countries, and attribution logos.
 * 3. It does not navigate or update state; it only renders detail-page facts.
 */
import React from 'react';
import { Image, Text, View } from 'react-native';
import type {
  movieType,
  movieWatchProviderType,
  production_company,
  production_country,
  streamTypes,
} from '../../types/movie/MovieTypes';
import type { DetailInfoRowProps } from '../../types/movie/movieDetailTypes';
import { imageAssets } from '../../styles/assets';
import { movieDetailInfoSectionStyles as styles } from '../../styles/movie/movieDetailInfoSectionStyles';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function MovieDetailInfoSections({ movie }: { movie: movieType }) {
  const productionCompanies = movie.production_companies ?? [];
  const productionCountries = movie.production_countries ?? [];
  const usWatchProviders = movie['watch/providers']?.results?.US;

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
          source={imageAssets.tmdbLogo}
          style={styles.tmdbLogo}
          resizeMode="contain"
        />
        <Image
          source={imageAssets.justWatchLogo}
          style={styles.justWatchLogo}
          resizeMode="contain"
        />
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
  return logoPath ? { uri: buildImageUrl('w500', logoPath) } : imageAssets.missingMovie;
}

function buildImageUrl(size: 'w500', path: string) {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function formatCurrency(value: number | undefined) {
  return value && value > 0 ? currencyFormatter.format(value) : 'Data not available.';
}

function formatRuntime(runtime: number | undefined) {
  return runtime && runtime > 0 ? `${runtime} minutes` : 'Data not available.';
}
