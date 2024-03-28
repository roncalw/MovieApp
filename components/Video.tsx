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
      if (orientation === 'LANDSCAPE-RIGHT' || orientation === 'LANDSCAPE-LEFT') {
        setPlaying(true); // Start playing
        //console.log(orientation);
        setLandscape(true);
      }
      else {
        setLandscape(false);
      }
    };
    Orientation.addOrientationListener(onChange);
    return () => Orientation.removeOrientationListener(onChange);
  }, []);

//...Platform.select({ios: {marginTop: 50}, android: {marginTop: -15}})

  return (
    <View style={{width: '100%', height: '100%', borderWidth: 0, borderColor: 'red', backgroundColor: landscape ? 'black' : 'transparent', alignItems: 'center'}}>
    <View style={{borderColor: 'red', borderWidth: 0, width: landscape ? windowDimensions.width / 1.75 : windowDimensions.width,  height: windowDimensions.height, backgroundColor: playing ? 'black' : 'transparent', marginTop: landscape ? 0 : 0, }}>
      {keyId != '0000' && (
        <YoutubePlayer
          height={windowDimensions.height / 1.45}
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
    </View>
  );
};
