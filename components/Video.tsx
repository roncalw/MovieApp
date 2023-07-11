import React, {useState} from 'react';
import VideoPlayer from 'react-native-video-controls';

type callBackFuntion = {
    onClose: () => void;
}

export default function Video({onClose}: callBackFuntion) {
    
    return (
            <VideoPlayer
                onBack={() => onClose()}
                fullscreenOrientation="all"
                source={{uri: 'https://vjs.zencdn.net/v/oceans.mp4'}}
            />
    );
};