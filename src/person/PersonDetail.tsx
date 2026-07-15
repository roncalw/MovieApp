import React, { useCallback } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  usePersonDetailsQuery,
  usePersonFamilyQuery,
} from '../hooks/useMovieSearchQuery';
import { ExpandableText } from '../shared/ExpandableText';
import {
  DetailResourceError,
  DetailResourceLoading,
} from '../shared/DetailResourceState';
import { colors } from '../theme/colors';
import { scaleSize } from '../theme/scale';
import { typography } from '../theme/typography';
import type { PersonDetailProps } from '../types/movie/personTypes';
import { PersonFamilyDetails } from './components/PersonFamilyDetails';
import { PersonFilmographySection } from './components/PersonFilmographySection';
import { RefreshableScrollView } from '../shared/refresh/RefreshableScrollView';
import { usePageRefresh } from '../shared/refresh/usePageRefresh';
import { queryKeys } from '../query/queryKeys';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const IMAGE_PERSON_NOT_FOUND = require('../assets/images/MissingPersonPlaceholder.png');

export function PersonDetail({
  personId,
  initialPersonName,
  onBackPress,
  onCloseAllPress,
  onMoviePress,
}: PersonDetailProps) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const personQuery = usePersonDetailsQuery(personId);
  const person = personQuery.data;
  const wikidataId = person?.external_ids?.wikidata_id ?? null;
  const familyQuery = usePersonFamilyQuery(wikidataId);
  const title = person?.name ?? initialPersonName ?? 'Person Detail';
  const refetchPersonDetails = personQuery.refetch;
  const refetchPersonFamily = familyQuery.refetch;
  const refreshPersonDetail = useCallback(async () => {
    const refreshes: Promise<unknown>[] = [
      refetchPersonDetails(),
      queryClient.refetchQueries({
        queryKey: queryKeys.personMovieCredits(personId),
        exact: true,
      }),
    ];

    if (wikidataId) {
      refreshes.push(refetchPersonFamily());
    }

    await Promise.allSettled(refreshes);
  }, [
    personId,
    queryClient,
    refetchPersonDetails,
    refetchPersonFamily,
    wikidataId,
  ]);
  const pageRefresh = usePageRefresh(refreshPersonDetail);
  const personHeader = (
    <>
      <View style={[styles.topSpacer, { height: insets.top }]} />
      <View style={styles.header}>
        <Pressable
          onPress={onBackPress}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel="Back one page"
        >
          <Ionicons
            name="chevron-back"
            size={scaleSize(34)}
            color={colors.textPrimary}
          />
        </Pressable>
        <View style={styles.headerTitleBlock}>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={styles.headerTitle}
          >
            {title}
          </Text>
        </View>
        <Pressable
          onPress={onCloseAllPress}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel="Close all detail pages"
        >
          <Ionicons
            name="close"
            size={scaleSize(30)}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>
    </>
  );
  const isResourceState = personQuery.isLoading || personQuery.isError;
  const personContent = personQuery.isLoading ? (
    <View style={styles.centered}>
      <DetailResourceLoading message="Loading person..." />
    </View>
  ) : personQuery.isError ? (
    <View style={styles.centered}>
      <DetailResourceError
        error={personQuery.error}
        isRetrying={personQuery.isFetching}
        message="Person details could not be loaded."
        onRetry={personQuery.refetch}
        title="Person details are temporarily unavailable"
      />
    </View>
  ) : person ? (
    <>
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
          <DetailLine label="Born" value={formatDateText(person.birthday)} />
          {person.deathday ? (
            <DetailLine label="Died" value={formatDateText(person.deathday)} />
          ) : null}
          <DetailLine label="Birthplace" value={person.place_of_birth} />
          <PersonFamilyDetails
            family={familyQuery.data}
            hasWikidataId={wikidataId !== null}
            isError={familyQuery.isError}
            isLoading={familyQuery.isLoading}
          />
        </View>
      </View>

      <View style={styles.biographyBlock}>
        <DetailLine label="Known for" value={person.known_for_department} />
        {person.biography ? (
          <ExpandableText
            text={person.biography}
            collapsedLines={8}
            textStyle={styles.biography}
          />
        ) : null}
      </View>

      <PersonFilmographySection
        personId={personId}
        onMoviePress={onMoviePress}
      />
    </>
  ) : null;

  return (
    <View style={styles.screen}>
      <RefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={
          isResourceState ? styles.stateScrollContent : styles.scrollContent
        }
        {...pageRefresh}
      >
        {personHeader}
        {personContent}
      </RefreshableScrollView>
    </View>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
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

function getProfileSource(
  profilePath: string | null | undefined,
): ImageSourcePropType {
  return profilePath
    ? { uri: `${TMDB_IMAGE_BASE_URL}/w500${profilePath}` }
    : IMAGE_PERSON_NOT_FOUND;
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
  stateScrollContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(24),
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
  biographyBlock: {
    paddingHorizontal: scaleSize(18),
    paddingTop: scaleSize(16),
  },
  biography: {
    ...typography.summaryBody,
    color: colors.textPrimary,
  },
});
