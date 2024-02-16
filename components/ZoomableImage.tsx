import React, { Component } from "react";
import { View, PanResponder, Image, ViewStyle } from "react-native";
import PropTypes from "prop-types";

interface ZoomableImageProps {
  imageWidth: number;
  imageHeight: number;
  source: any;
  style?: ViewStyle;
}

interface ZoomableImageState {
  zoom: number;
  top: number;
  left: number;
  initialDistance: number | null;
  initialX: number | null;
  initialY: number | null;
  offsetTop: number;
  offsetLeft: number;
}

class ZoomableImage extends Component<ZoomableImageProps, ZoomableImageState> {
  private _panResponder: any;

  constructor(props: ZoomableImageProps) {
    super(props);
    this.state = {
      zoom: 1,
      top: 0,
      left: 0,
      initialDistance: null,
      initialX: null,
      initialY: null,
      offsetTop: 0,
      offsetLeft: 0,
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          this.processPinch(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );
        } else if (touches.length === 1 && !this.state.initialDistance) {
          this.processTouch(touches[0].pageX, touches[0].pageY);
        }
      },
      onPanResponderRelease: () => {
        this.setState({
          initialDistance: null,
          initialX: null,
          initialY: null,
        });
      },
    });
  }

  processPinch(x1: number, y1: number, x2: number, y2: number) {
    const distance = this.calculateDistance(x1, y1, x2, y2);
    if (!this.state.initialDistance) {
      this.setState({
        initialDistance: distance,
      });
    } else {
      const zoomFactor = distance / this.state.initialDistance;
      const newZoom = Math.max(1, this.state.zoom * zoomFactor);
      this.setState({
        zoom: newZoom,
      });
    }
  }

  processTouch(x: number, y: number) {
    if (!this.state.initialX || !this.state.initialY) {
      this.setState({
        initialX: x,
        initialY: y,
      });
    } else {
      const deltaX = x - this.state.initialX;
      const deltaY = y - this.state.initialY;
      this.setState({
        left: this.state.left + deltaX,
        top: this.state.top + deltaY,
        initialX: x,
        initialY: y,
      });
    }
  }

  _onLayout = (event: any) => {
    const layout = event.nativeEvent.layout;
    const zoom = layout.width / this.props.imageWidth;
    const offsetTop =
      layout.height > this.props.imageHeight * zoom
        ? (layout.height - this.props.imageHeight * zoom) / 2
        : 0;
    this.setState({
      offsetTop,
    });
  };

  calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  render() {
    return (
      <View
        style={[this.props.style, { overflow: "hidden" }]}
        {...this._panResponder.panHandlers}
        onLayout={this._onLayout}
      >
        <Image
          style={{
            position: "relative",
            top: this.state.offsetTop + this.state.top,
            left: this.state.offsetLeft + this.state.left,
            width: this.props.imageWidth * this.state.zoom,
            height: this.props.imageHeight * this.state.zoom,
          }}
          source={this.props.source}
        />
      </View>
    );
  }
}

export default ZoomableImage;
