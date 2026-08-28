import React from 'react';
import { Image, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { HomeMoviePosterRow } from '../src/home/HomeMoviePosterRow';
import { imageAssets } from '../src/styles/assets';
import type { movieType } from '../src/types/movie/MovieTypes';

jest.mock('@react-native-vector-icons/ionicons/static', () => () => null);

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

const posterUri = 'https://image.tmdb.org/t/p/w342/poster.jpg';
const posterMovie = {
  id: 1,
  title: 'Poster Movie',
  poster_path: '/poster.jpg',
} as movieType;

function renderRow(unavailableImageUris: ReadonlySet<string>) {
  return TestRenderer.create(
    <HomeMoviePosterRow
      title="Popular Movies"
      movies={[posterMovie]}
      isLoading={false}
      isError={false}
      unavailableImageUris={unavailableImageUris}
      onMoviePress={jest.fn()}
    />,
  );
}

describe('HomeMoviePosterRow prepared images', () => {
  test('uses the cached remote poster after successful preparation', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = renderRow(new Set());
    });

    expect(
      component.root
        .findAllByType(View)
        .filter(node => node.props.testID === 'remote-movie-image'),
    ).toHaveLength(1);
    expect(
      component.root.findByProps({ testID: 'remote-movie-image' }).props.uri,
    ).toBe(posterUri);
    expect(component.root.findAllByType(Image)).toHaveLength(0);

    act(() => component.unmount());
  });

  test('uses the local poster artwork immediately when preparation failed', () => {
    let component!: TestRenderer.ReactTestRenderer;

    act(() => {
      component = renderRow(new Set([posterUri]));
    });

    expect(
      component.root
        .findAllByType(View)
        .filter(node => node.props.testID === 'remote-movie-image'),
    ).toHaveLength(0);
    expect(component.root.findByType(Image).props.source).toBe(
      imageAssets.missingMovie,
    );
    expect(component.root.findAllByType(View).length).toBeGreaterThan(0);

    act(() => component.unmount());
  });
});
