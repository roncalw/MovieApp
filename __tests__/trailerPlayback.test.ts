import {
  getTrailerPlayerSize,
  getTrailerWebViewProps,
} from '../src/movie/trailerPlayback';

test('fits a 16:9 trailer inside a taller landscape phone without cropping', () => {
  expect(getTrailerPlayerSize(2340, 1080)).toEqual({
    width: 1920,
    height: 1080,
  });
});

test('starts trailers automatically and delegates fullscreen to native iOS playback', () => {
  const props = getTrailerWebViewProps('ios');

  expect(props.allowsInlineMediaPlayback).toBe(false);
  expect(props.injectedJavaScript).toContain('player.playVideo()');
  expect(props.injectedJavaScript).toContain('if (false &&');
});

test('starts trailers and requests iframe fullscreen on Android', () => {
  const props = getTrailerWebViewProps('android');

  expect(props.allowsInlineMediaPlayback).toBe(true);
  expect(props.injectedJavaScript).toContain('player.playVideo()');
  expect(props.injectedJavaScript).toContain('if (true &&');
  expect(props.injectedJavaScript).toContain('requestFullscreen.call(iframe)');
});
