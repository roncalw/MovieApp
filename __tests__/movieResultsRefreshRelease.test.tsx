import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';
import { MovieResults } from '../src/search/results/MovieResults';
import { FlatList, Platform, View } from 'react-native';

const initialMetrics: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

function renderResults(onRefresh: jest.Mock) {
  let component!: TestRenderer.ReactTestRenderer;

  act(() => {
    component = TestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <MovieResults
          movies={[]}
          onRefresh={onRefresh}
          refreshing={false}
        />
      </SafeAreaProvider>,
    );
  });

  return component;
}

describe('MovieResults native refresh wiring', () => {
  test('starts refresh immediately when no drag is being held', () => {
    const onRefresh = jest.fn();
    const component = renderResults(onRefresh);
    const list = component.root.findByType(FlatList);

    act(() => list.props.onRefresh());

    expect(onRefresh).toHaveBeenCalledTimes(1);
    act(() => component.unmount());
  });

  test('does not run the search until the active pull is released', () => {
    const onRefresh = jest.fn();
    const component = renderResults(onRefresh);
    const list = component.root.findByType(FlatList);

    act(() => list.props.onScrollBeginDrag());
    act(() => list.props.onRefresh());

    expect(onRefresh).not.toHaveBeenCalled();
    expect(component.root.findByType(FlatList).props.refreshing).toBe(true);
    expect(
      component.root.findByProps({
        accessibilityLabel: 'Refreshing search results',
      }),
    ).toBeDefined();

    act(() => list.props.onScrollEndDrag());

    expect(onRefresh).toHaveBeenCalledTimes(1);
    act(() => component.unmount());
  });

  test('uses Android native onRefresh as its post-release signal', () => {
    const originalPlatform = Platform.OS;
    const onRefresh = jest.fn();

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });

    try {
      const component = renderResults(onRefresh);
      const list = component.root.findByType(FlatList);

      act(() => list.props.onScrollBeginDrag());
      act(() => list.props.onRefresh());

      expect(onRefresh).toHaveBeenCalledTimes(1);
      act(() => component.unmount());
    } finally {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalPlatform,
      });
    }
  });

  test('passes the parent refreshing state to the native control', () => {
    const onRefresh = jest.fn();
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <MovieResults movies={[]} onRefresh={onRefresh} refreshing />
        </SafeAreaProvider>,
      );
    });

    expect(component.root.findByType(FlatList).props.refreshing).toBe(true);
    expect(
      component.root.findByProps({
        accessibilityLabel: 'Refreshing search results',
      }),
    ).toBeDefined();
    act(() => component.unmount());
  });

  test('does not attach a refresh control when the page has no refresh action', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <MovieResults movies={[]} />
        </SafeAreaProvider>,
      );
    });

    const list = component.root.findByType(FlatList);

    expect(list.props.onRefresh).toBeUndefined();
    expect(list.props.refreshing).toBeUndefined();
    act(() => component.unmount());
  });

  test('forwards page touch tracking without replacing refresh drag handlers', () => {
    const onRefresh = jest.fn();
    const onStartShouldSetResponderCapture = jest.fn(() => false);
    const onTouchMove = jest.fn();
    const onTouchEnd = jest.fn();
    const onScroll = jest.fn();
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <MovieResults
            movies={[]}
            onRefresh={onRefresh}
            refreshing={false}
            onStartShouldSetResponderCapture={
              onStartShouldSetResponderCapture
            }
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onScroll={onScroll}
          />
        </SafeAreaProvider>,
      );
    });

    const list = component.root.findByType(FlatList);

    expect(
      component.root
        .findAllByType(View)
        .some(
          node =>
            node.props.onStartShouldSetResponderCapture ===
            onStartShouldSetResponderCapture,
        ),
    ).toBe(true);
    expect(list.props.onTouchMove).toBe(onTouchMove);
    expect(list.props.onTouchEnd).toBe(onTouchEnd);
    expect(list.props.onScroll).toBe(onScroll);
    expect(list.props.onScrollBeginDrag).toEqual(expect.any(Function));
    expect(list.props.onScrollEndDrag).toEqual(expect.any(Function));
    expect(list.props.onRefresh).toEqual(expect.any(Function));
    act(() => component.unmount());
  });

});
