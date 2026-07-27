import React from 'react';
import { Image } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { MovieRemoteImage } from '../src/shared/images/MovieRemoteImage';

const fallbackSource = { uri: 'local-fallback' };

describe('MovieRemoteImage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('does not show the missing-poster artwork while a real image is loading', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <MovieRemoteImage
          uri="https://image.tmdb.org/t/p/w500/loading.jpg"
          fallbackSource={fallbackSource}
          diagnosticContext="Test"
        />,
      );
    });

    const image = component.root.findByType(Image);

    expect(image.props.source).toEqual({
      uri: 'https://image.tmdb.org/t/p/w500/loading.jpg',
    });
    expect(image.props.defaultSource).toBeUndefined();

    act(() => component.unmount());
  });

  test('shows the fallback after its bounded automatic retries fail', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <MovieRemoteImage
          uri="https://image.tmdb.org/t/p/w500/poster.jpg"
          fallbackSource={fallbackSource}
          diagnosticContext="Test"
        />,
      );
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const image = component.root.findByType(Image);

      act(() => {
        image.props.onError({ nativeEvent: { error: 'network failure' } });
      });

      if (attempt < 2) {
        act(() => {
          jest.advanceTimersByTime(350);
        });
      }
    }

    expect(component.root.findByType(Image).props.source).toBe(fallbackSource);

    act(() => component.unmount());
  });

  test('allows a page refresh to retry an image that exhausted its retries', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <MovieRemoteImage
          uri="https://image.tmdb.org/t/p/w500/retry.jpg"
          fallbackSource={fallbackSource}
          diagnosticContext="Test"
          refreshGeneration={0}
        />,
      );
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      act(() => {
        component.root.findByType(Image).props.onError({
          nativeEvent: { error: 'network failure' },
        });
      });

      if (attempt < 2) {
        act(() => {
          jest.advanceTimersByTime(350);
        });
      }
    }

    expect(component.root.findByType(Image).props.source).toBe(fallbackSource);

    act(() => {
      component.update(
        <MovieRemoteImage
          uri="https://image.tmdb.org/t/p/w500/retry.jpg"
          fallbackSource={fallbackSource}
          diagnosticContext="Test"
          refreshGeneration={1}
        />,
      );
    });

    expect(component.root.findByType(Image).props.source).toEqual({
      uri: 'https://image.tmdb.org/t/p/w500/retry.jpg',
    });

    act(() => component.unmount());
  });
});
