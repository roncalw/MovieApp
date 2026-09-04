/**
 * Full-screen YouTube trailer player for Movie Detail.
 *
 * Imported by:
 * - src/movie/MovieDetail.tsx
 *
 * Code flow:
 * 1. MovieDetail chooses the preferred trailer and stores the active trailer key.
 * 2. MovieDetail passes that key into MovieTrailerModal.
 * 3. This component opens a full-screen modal, plays the YouTube video, and calls
 *    onClose when the user taps Back or the trailer ends.
 */
import React from 'react';
import {
  Modal,
  NativeModules,
  Platform,
  Pressable,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrailerModalProps } from '../../types/movie/movieDetailTypes';
import { colors } from '../../styles/colors';
import { scaleSize } from '../../styles/scale';
import { movieTrailerModalStyles as styles } from '../../styles/movie/movieTrailerModalStyles';
import {
  getTrailerPlayerSize,
  getTrailerWebViewProps,
} from '../trailerPlayback';

export function MovieTrailerModal({ trailerKey, onClose }: TrailerModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isVisible = trailerKey !== null;
  const playerSize = getTrailerPlayerSize(width, height);
  const backButtonTopOffset =
    Platform.OS === 'ios'
      ? Math.max(insets.top, scaleSize(50))
      : Math.max(insets.top, scaleSize(32));

  React.useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (Platform.OS === 'android') {
      return () => NativeModules.TrailerFullscreen?.setEnabled(false);
    }

    StatusBar.setHidden(true, 'fade');

    return () => StatusBar.setHidden(false, 'fade');
  }, [isVisible]);

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      presentationStyle="fullScreen"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      visible={isVisible}
      onShow={() => {
        if (Platform.OS === 'android') {
          NativeModules.TrailerFullscreen?.setEnabled(true);
        }
      }}
      onRequestClose={onClose}
    >
      <View style={styles.trailerModal}>
        <Pressable
          onPress={onClose}
          style={[
            styles.trailerModalBackButton,
            { marginTop: backButtonTopOffset },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close trailer"
        >
          <Ionicons
            name="chevron-back"
            size={scaleSize(40)}
            color={colors.actionOnPrimary}
          />
        </Pressable>

        <View style={styles.trailerPlayerFrame}>
          {trailerKey ? (
            <YoutubePlayer
              height={playerSize.height}
              width={playerSize.width}
              play
              videoId={trailerKey}
              forceAndroidAutoplay
              webViewProps={getTrailerWebViewProps(Platform.OS)}
              onChangeState={(state: string) => {
                if (state === 'ended') {
                  onClose();
                }
              }}
              initialPlayerParams={{
                controls: true,
                modestbranding: false,
                color: 'black',
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
