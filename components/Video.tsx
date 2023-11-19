import React, {useCallback, useEffect, useState} from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Alert, Platform, Text, View, useWindowDimensions } from 'react-native';

/*
type callBackFuntion = {
    onClose: () => void;
}
*/

type localProps = {
  onClose: () => void;
  keyId?: string | undefined;
}

export default function Video({keyId, onClose}: localProps) {

  const windowDimensions = useWindowDimensions();

  const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
          setPlaying(false);
          //Alert.alert("Video has finished playing!");
          onClose();
        }
      }, []);
    
    return (
      <View>
        <Text>{ 'Trailer' }</Text>

        { keyId != '0000' && (

          <YoutubePlayer
              height={windowDimensions.height}
              width={windowDimensions.width * .8}
              play={true}
              videoId={keyId}
              onChangeState={onStateChange}
          />
        )}

      </View>
    );
};