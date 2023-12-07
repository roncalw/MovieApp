import React, {useCallback, useEffect, useState} from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Alert, Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

type localProps = {
  onClose: () => void;
  keyId?: string | undefined;
}

export default function Video({keyId, onClose}: localProps) {

  const windowDimensions = useWindowDimensions();

  const [playing, setPlaying] = useState(true);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
          setPlaying(false);
          //Alert.alert("Video has finished playing!");
          onClose();
        }
        if (state === "playing") {
          setPlaying(true);
        }
        if (state === "paused") {
          setPlaying(false);
        }
      }, []);
    
    return (
      <View style={{backgroundColor: playing ? 'black' : 'transparent'}}>

        { keyId != '0000' && (

          <YoutubePlayer
              height={windowDimensions.height}
              width={windowDimensions.width}
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