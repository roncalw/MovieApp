/**
 * Horizontal Cast/Crew rail for Movie Detail.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx
 *
 * Code flow:
 * 1. LoadedMovieDetail passes cast or crew people into MovieCreditsRail.
 * 2. This component groups duplicate people, combines their role labels, and
 *    renders one card per person.
 * 3. Tapping a card calls the parent-provided onPersonPress navigation callback.
 */
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { ScrollFriendlyTapTarget } from '../../shared/ScrollFriendlyTapTarget';
import type {
  CreditPerson,
  CreditRailProps,
  GroupedCreditPerson,
} from '../../types/movie/movieDetailTypes';
import { imageAssets } from '../../styles/assets';
import { movieCreditsRailStyles as styles } from '../../styles/movie/movieCreditsRailStyles';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function MovieCreditsRail({
  title,
  people,
  onPersonPress,
}: CreditRailProps) {
  const groupedPeople = useMemo(() => groupCreditPeople(people), [people]);

  if (groupedPeople.length === 0) {
    return null;
  }

  const renderItem: ListRenderItem<GroupedCreditPerson> = ({ item }) => (
    <CreditCard person={item} onPersonPress={onPersonPress} />
  );

  return (
    <>
      <Text allowFontScaling={false} style={styles.creditSectionLabel}>
        {title}
      </Text>
      <FlatList
        data={groupedPeople}
        horizontal
        keyExtractor={item => `${title}-${item.id}`}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.creditListContent}
      />
    </>
  );
}

function CreditCard({
  person,
  onPersonPress,
}: {
  person: GroupedCreditPerson;
  onPersonPress?: (personId: number, initialPersonName?: string) => void;
}) {
  const subtitle = getCreditSubtitleText(person.roleLabels);

  return (
    <ScrollFriendlyTapTarget
      accessibilityLabel={`Open ${person.name}`}
      onPress={() => onPersonPress?.(person.id, person.name)}
      style={styles.creditCard}
    >
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
    </ScrollFriendlyTapTarget>
  );
}

function getProfileSource(profilePath: string | null | undefined) {
  return profilePath
    ? { uri: buildImageUrl('w500', profilePath) }
    : imageAssets.missingPerson;
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

function groupCreditPeople(people: CreditPerson[]) {
  const groupedPeople = new Map<number, GroupedCreditPerson>();

  people.forEach(person => {
    const roleLabel = getCreditSubtitle(person);
    const existingPerson = groupedPeople.get(person.id);

    if (existingPerson) {
      addCreditRoleLabel(existingPerson.roleLabels, roleLabel);
      return;
    }

    const roleLabels: string[] = [];
    addCreditRoleLabel(roleLabels, roleLabel);
    groupedPeople.set(person.id, {
      id: person.id,
      name: person.name,
      profile_path: person.profile_path,
      roleLabels,
    });
  });

  return Array.from(groupedPeople.values());
}

function addCreditRoleLabel(roleLabels: string[], roleLabel: string) {
  if (!roleLabels.includes(roleLabel)) {
    roleLabels.push(roleLabel);
  }
}

function getCreditSubtitleText(roleLabels: string[]) {
  const visibleRoles = roleLabels.slice(0, 2);
  const suffix = roleLabels.length > 2 ? ' ...' : '';

  return `${visibleRoles.join(', ')}${suffix}`;
}
