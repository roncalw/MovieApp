/**
 * Shared loading and retry panels for movie and actor detail resources.
 *
 * Why this exists:
 * - Detail pages now load independent TMDB resources instead of one large
 *   response. Each resource needs a consistent way to communicate loading and
 *   temporary failure without exposing Axios implementation messages.
 * - A section-level failure should not replace movie, actor, cast, or provider
 *   information that loaded successfully.
 *
 * Technical errors remain available in development logs. This component owns
 * only the customer-facing explanation and retry action.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import { colors } from '../styles/colors';
import { scaleSize } from '../styles/scale';
import { typography } from '../styles/typography';

type DetailResourceStateProps = {
  message: string;
  compact?: boolean;
};

type DetailResourceErrorProps = DetailResourceStateProps & {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
  title: string;
};

export function DetailResourceLoading({
  message,
  compact = false,
}: DetailResourceStateProps) {
  return (
    <View
      style={[styles.panel, compact ? styles.compactPanel : styles.fullPanel]}
    >
      <ActivityIndicator size={compact ? 'small' : 'large'} />
      <Text allowFontScaling={false} style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

export function DetailResourceError({
  compact = false,
  error,
  isRetrying,
  message,
  onRetry,
  title,
}: DetailResourceErrorProps) {
  return (
    <View
      style={[styles.panel, compact ? styles.compactPanel : styles.fullPanel]}
    >
      <Text allowFontScaling={false} style={styles.title}>
        {title}
      </Text>
      <Text allowFontScaling={false} style={styles.message}>
        {getDetailErrorMessage(error, message)}
      </Text>
      <Pressable
        disabled={isRetrying}
        onPress={onRetry}
        style={[
          styles.retryButton,
          isRetrying ? styles.retryButtonDisabled : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Try loading ${message.toLowerCase()} again`}
      >
        {isRetrying ? (
          <ActivityIndicator color={colors.actionOnPrimary} />
        ) : null}
        <Text allowFontScaling={false} style={styles.retryButtonText}>
          {isRetrying ? 'Trying Again...' : 'Try Again'}
        </Text>
      </Pressable>
    </View>
  );
}

export function getDetailErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  if (error.code === 'ECONNABORTED') {
    return 'The movie information service took too long to respond.';
  }

  if (!error.response) {
    return 'Check your internet connection and try again.';
  }

  const status = error.response.status;

  if (status === 404) {
    return 'TMDB no longer has this information available.';
  }

  if (status >= 500) {
    return 'The movie information service is temporarily unavailable.';
  }

  return fallbackMessage;
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPanel: {
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleSize(28),
  },
  compactPanel: {
    marginHorizontal: scaleSize(5),
    marginBottom: scaleSize(10),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(10),
    backgroundColor: colors.surfaceLight,
  },
  title: {
    ...typography.feedbackTitle,
    color: colors.brandText,
    textAlign: 'center',
  },
  message: {
    ...typography.feedbackBody,
    marginTop: scaleSize(8),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: scaleSize(116),
    minHeight: scaleSize(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    marginTop: scaleSize(14),
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(8),
    backgroundColor: colors.brandText,
  },
  retryButtonDisabled: {
    opacity: 0.65,
  },
  retryButtonText: {
    ...typography.buttonLabel,
    color: colors.actionOnPrimary,
  },
});
