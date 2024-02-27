import React from 'react';
import { View, Animated, Image, StyleSheet } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

interface PinchableImageProps {
  source: { uri: string };
  height: number;
  width: number;
}

export default class PinchableImage extends React.Component<PinchableImageProps> {
  private scale = new Animated.Value(1);

  private onPinchEvent = Animated.event([{ nativeEvent: { scale: this.scale } }], {
    useNativeDriver: true,
  });

  private onPinchStateChange = (event: { nativeEvent: { oldState: State } }) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 1,
      }).start();
    }
  };

  render() {
    const { source, height, width } = this.props;

    return (
      <View style={styles.container}>
        <PinchGestureHandler
          onGestureEvent={this.onPinchEvent}
          onHandlerStateChange={this.onPinchStateChange}
        >
          <Animated.Image
            source={source}
            style={[
              styles.image,
              {
                width,
                height,
                transform: [{ scale: this.scale }],
              },
            ]}
            resizeMode="contain"
          />
        </PinchGestureHandler>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
    // alignSelf: 'center' 
  },
  image: {
    // You can customize additional styles here if needed
  },
});
