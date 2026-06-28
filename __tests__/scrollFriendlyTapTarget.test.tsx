import React from 'react';
import { Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ScrollFriendlyTapTarget } from '../src/shared/ScrollFriendlyTapTarget';

function touchEvent(pageX: number, pageY: number) {
  return {
    nativeEvent: {
      pageX,
      pageY,
      touches: [{ pageX, pageY }],
    },
  };
}

describe('ScrollFriendlyTapTarget', () => {
  test('activates a stationary touch', () => {
    const onPress = jest.fn();
    let component!: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ScrollFriendlyTapTarget
          accessibilityLabel="Test action"
          onPress={onPress}
        >
          <Text>Tap target</Text>
        </ScrollFriendlyTapTarget>,
      );
    });

    const target = component.root.findByType(View);

    act(() => {
      target.props.onTouchStart(touchEvent(100, 200));
      target.props.onTouchEnd(touchEvent(103, 204));
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not activate a vertical drag', () => {
    const onPress = jest.fn();
    let component!: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ScrollFriendlyTapTarget
          accessibilityLabel="Test action"
          onPress={onPress}
        >
          <Text>Tap target</Text>
        </ScrollFriendlyTapTarget>,
      );
    });

    const target = component.root.findByType(View);

    act(() => {
      target.props.onTouchStart(touchEvent(100, 200));
      target.props.onTouchMove(touchEvent(100, 230));
      target.props.onTouchEnd(touchEvent(100, 260));
    });

    expect(onPress).not.toHaveBeenCalled();
  });
});
