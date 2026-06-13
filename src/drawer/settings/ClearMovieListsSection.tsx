import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  clearStoredMovieList,
  MOVIE_FAVORITES_STORAGE_KEY,
  MOVIE_SEEN_STORAGE_KEY,
} from '../../utils/storage/movieUserListsStorage';
import { settingsStyles } from '../../styles/drawer/settingsStyles';
import { useStoredMovieListCount } from './useStoredMovieListCount';

const favoriteClearTitle = 'Your Movie Favorites are Cleared!';
const favoriteClearMessage =
  'To start saving your favorite movies again, simply click on the heart from the Movie Detail screen!';
const seenClearTitle = 'Your Movies I Have Seen are Cleared!';
const seenClearMessage =
  'To start saving movies you have seen again, simply click on Seen from the Movie Detail screen!';

export function ClearMovieListsSection() {
  return (
    <>
      <ClearListButton
        countLabel="Favorites I have saved"
        label="Clear Movie Favorites"
        confirmTitle="Clear Movie Favorites?"
        confirmMessage={`Selecting Yes will clear your movie favorites. ${favoriteClearMessage}`}
        successTitle={favoriteClearTitle}
        successMessage={favoriteClearMessage}
        failureTitle="Unable to Clear Favorites"
        failureMessage="Movie favorites could not be cleared right now."
        logMessage="Error clearing movie favorites:"
        storageKey={MOVIE_FAVORITES_STORAGE_KEY}
      />

      <ClearListButton
        countLabel="Movies I have seen"
        label="Clear Movies I Have Seen"
        confirmTitle="Clear Movies I Have Seen?"
        confirmMessage={`Selecting Yes will clear your movies you have seen. ${seenClearMessage}`}
        successTitle={seenClearTitle}
        successMessage={seenClearMessage}
        failureTitle="Unable to Clear Movies I Have Seen"
        failureMessage="Movies I Have Seen could not be cleared right now."
        logMessage="Error clearing movies I have seen:"
        storageKey={MOVIE_SEEN_STORAGE_KEY}
      />
    </>
  );
}

function ClearListButton({
  confirmMessage,
  confirmTitle,
  countLabel,
  failureMessage,
  failureTitle,
  label,
  logMessage,
  storageKey,
  successMessage,
  successTitle,
}: {
  confirmMessage: string;
  confirmTitle: string;
  countLabel: string;
  failureMessage: string;
  failureTitle: string;
  label: string;
  logMessage: string;
  storageKey: typeof MOVIE_FAVORITES_STORAGE_KEY | typeof MOVIE_SEEN_STORAGE_KEY;
  successMessage: string;
  successTitle: string;
}) {
  const { count, refreshCount } = useStoredMovieListCount(storageKey);

  function handleClearList() {
    Alert.alert(confirmTitle, confirmMessage, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearStoredMovieList(storageKey);
            await refreshCount();
            Alert.alert(successTitle, successMessage);
          } catch (error) {
            console.error(logMessage, error);
            Alert.alert(failureTitle, failureMessage);
          }
        },
      },
    ]);
  }

  return (
    <View style={settingsStyles.settingBlock}>
      <Pressable
        onPress={handleClearList}
        accessibilityRole="button"
        style={({ pressed }) => [pressed ? settingsStyles.pressed : null]}
      >
        <Text allowFontScaling={false} style={settingsStyles.linkText}>
          {label}
        </Text>
      </Pressable>
      {count !== null ? (
        <Text allowFontScaling={false} style={settingsStyles.listCountText}>
          {countLabel}: {count}
        </Text>
      ) : null}
    </View>
  );
}
