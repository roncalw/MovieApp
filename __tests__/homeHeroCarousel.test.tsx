import React from 'react';
import { FlatList, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { HomeHeroCarousel } from '../src/home/HomeHeroCarousel';
import type { movieType } from '../src/types/movie/MovieTypes';

jest.mock('../src/shared/images/MovieRemoteImage', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  return {
    MovieRemoteImage: (props: any) =>
      MockReact.createElement(MockView, {
        ...props,
        testID: 'remote-movie-image',
      }),
  };
});

const heroMovies = [
  { id: 1, title: 'First Movie', poster_path: '/first.jpg' },
  { id: 2, title: 'Second Movie', poster_path: '/second.jpg' },
] as movieType[];

describe('HomeHeroCarousel auto-play', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('stops auto-play for the current Home visit after a manual swipe begins', () => {
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = TestRenderer.create(
        <HomeHeroCarousel
          movies={heroMovies}
          isLoading={false}
          isError={false}
          error={undefined}
          onMoviePress={jest.fn()}
        />,
      );
    });

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    const carousel = component.root.findByType(FlatList);
    act(() => carousel.props.onScrollBeginDrag());

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(component.root.findAllByType(View).length).toBeGreaterThan(0);

    act(() => component.unmount());
  });
});
