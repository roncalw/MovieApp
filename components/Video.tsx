import React, { useCallback, useEffect, useState } from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Alert, Platform, Text, TouchableOpacity, View, useWindowDimensions, Dimensions } from 'react-native';
import Orientation from 'react-native-orientation-locker';

type localProps = {
  onClose: () => void;
  keyId?: string | undefined;
}

export default function Video({ keyId, onClose }: localProps) {

  const [playing, setPlaying] = useState(true);
  const windowDimensions = useWindowDimensions();
  const [landscape, setLandscape] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      onClose();
    }
    if (state === "playing") {
      setPlaying(true);
    }
    if (state === "paused") {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const onChange = (orientation: string) => {
      if (orientation === 'LANDSCAPE-RIGHT') {
        setPlaying(true); // Start playing
        console.log('LANDSCAPE-RIGHT');
        setLandscape(true);
      }
      else {
        setLandscape(false);
      }
    };
    Orientation.addOrientationListener(onChange);
    return () => Orientation.removeOrientationListener(onChange);
  }, []);


  return (
    <View style={{width: landscape ? 500 : windowDimensions.width,  height: 1000, backgroundColor: playing ? 'black' : 'transparent', marginTop: landscape ? 0 : 0, }}>
      {keyId != '0000' && (
        <YoutubePlayer
          height={300}
          play={playing}
          videoId={keyId}
          onChangeState={onStateChange}
          initialPlayerParams={{
            controls: true,
            modestbranding: false,
            color: 'black'
          }}
        />
      )}
    </View>
  );
};
