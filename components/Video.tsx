import React, {useCallback, useState} from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Alert, Platform, Text, View } from 'react-native';


type callBackFuntion = {
    onClose: () => void;
}

export default function Video({onClose}: callBackFuntion) {

  const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
          setPlaying(false);
          Alert.alert("video has finished playing!");
        }
      }, []);
    
    return (
      <View>
        <Text>{ 'Trailer' }</Text>
        
        <YoutubePlayer
            height={300}
            width={300}
            play={false}
            videoId='dfeUzm6KF4g'
            onChangeState={onStateChange}
        />
      </View>
    );
};