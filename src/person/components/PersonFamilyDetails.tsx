/**
 * Formats and displays Wikidata family relationships on Person Detail.
 *
 * Missing source data is deliberately different from a failed lookup:
 * - "Not listed" means Wikidata responded but has no matching statements.
 * - "Not available" means MovieApp could not obtain a Wikidata answer.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import type {
  PersonFamilyDate,
  PersonFamilyDisplayRow,
  PersonFamilyResponse,
  PersonFamilySpouse,
} from '../../types/movie/personTypes';

type PersonFamilyDetailsProps = {
  family?: PersonFamilyResponse;
  hasWikidataId: boolean;
  isError: boolean;
  isLoading: boolean;
};

export function PersonFamilyDetails({
  family,
  hasWikidataId,
  isError,
  isLoading,
}: PersonFamilyDetailsProps) {
  const rows = getPersonFamilyDisplayRows({
    family,
    hasWikidataId,
    isError,
    isLoading,
  });

  return (
    <View>
      {rows.map(row => (
        <Text
          allowFontScaling={false}
          key={row.label}
          style={styles.detailLine}
        >
          <Text style={styles.detailLineLabel}>{row.label}: </Text>
          {row.value}
        </Text>
      ))}
    </View>
  );
}

export function getPersonFamilyDisplayRows({
  family,
  hasWikidataId,
  isError,
  isLoading,
}: PersonFamilyDetailsProps): PersonFamilyDisplayRow[] {
  if (!hasWikidataId || isError) {
    return unavailableRows('Not available');
  }

  if (isLoading || !family) {
    return unavailableRows('Loading...');
  }

  const currentSpouses = family.spouses.filter(
    spouse => spouse.status === 'current',
  );
  const formerSpouses = family.spouses.filter(
    spouse => spouse.status === 'former',
  );
  const rows: PersonFamilyDisplayRow[] = [];

  if (currentSpouses.length > 0) {
    rows.push({
      label: currentSpouses.length === 1 ? 'Spouse' : 'Spouses',
      value: currentSpouses.map(formatSpouse).join('; '),
    });
  }

  if (formerSpouses.length > 0) {
    rows.push({
      label: formerSpouses.length === 1 ? 'Former spouse' : 'Former spouses',
      value: formerSpouses.map(formatSpouse).join('; '),
    });
  }

  if (family.spouses.length === 0) {
    rows.push({ label: 'Spouse(s)', value: 'Not listed' });
  }

  rows.push({
    label: 'Children',
    value: formatChildren(family),
  });

  return rows;
}

function unavailableRows(value: string): PersonFamilyDisplayRow[] {
  return [
    { label: 'Spouse(s)', value },
    { label: 'Children', value },
  ];
}

function formatSpouse(spouse: PersonFamilySpouse) {
  const start = formatFamilyDate(spouse.startDate);
  const end = formatFamilyDate(spouse.endDate);

  if (spouse.status === 'current') {
    const status = start ? `${start}-present` : 'current';
    return `${spouse.name} (${status})`;
  }

  if (start && end) {
    return `${spouse.name} (${start}-${end})`;
  }

  if (end) {
    return `${spouse.name} (until ${end})`;
  }

  if (start) {
    return `${spouse.name} (from ${start})`;
  }

  return spouse.name;
}

function formatChildren(family: PersonFamilyResponse) {
  const names = family.children
    .map(child => child.name)
    .filter((name): name is string => Boolean(name));

  if (names.length > 0) {
    return names.join('; ');
  }

  if (family.numberOfChildren !== null) {
    return String(family.numberOfChildren);
  }

  if (family.children.length > 0) {
    return String(family.children.length);
  }

  return 'Not listed';
}

function formatFamilyDate(date: PersonFamilyDate | null) {
  if (!date) {
    return null;
  }

  if (date.precision === 'year') {
    return date.value;
  }

  const isoDate = date.precision === 'month' ? `${date.value}-01` : date.value;
  const parsedDate = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date.value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    ...(date.precision === 'day' ? { day: 'numeric' as const } : {}),
    year: 'numeric',
  }).format(parsedDate);
}

const styles = StyleSheet.create({
  detailLine: {
    ...typography.summaryBody,
    color: colors.textPrimary,
    marginBottom: scaleSize(5),
  },
  detailLineLabel: {
    fontWeight: '700',
  },
});
