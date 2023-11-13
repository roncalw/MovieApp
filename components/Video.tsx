import React, {useCallback, useState} from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Alert, Platform, Text, View } from 'react-native';

/*
type callBackFuntion = {
    onClose: () => void;
}
*/

type localProps = {

  keyId?: string | undefined;
}

export default function Video({keyId}: localProps) {

  //console.log(keyId);
/*
  const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
          setPlaying(false);
          Alert.alert("video has finished playing!");
        }
      }, []);
      */
    
    return (
      <View>
        <Text>{ 'Trailer' }</Text>

        { keyId != '0000' && (

          <YoutubePlayer
              height={300}
              width={300}
              play={false}
              videoId={keyId}
          />
        )}

      </View>
    );
};