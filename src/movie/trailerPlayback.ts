/**
 * WebView behavior for starting a Movie Detail trailer.
 *
 * YouTube's iframe API can start playback, but it does not provide an
 * enter-fullscreen method. On iOS, WebKit enters its native fullscreen player
 * when inline playback is disabled. On Android, the browser fullscreen API is
 * the supported request path, so the script asks the YouTube iframe to expand
 * after playback has actually started.
 */
import type { PlatformOSType } from 'react-native';
import type { WebViewProps } from 'react-native-webview';

type TrailerWebViewProps = Pick<
  WebViewProps,
  'allowsInlineMediaPlayback' | 'injectedJavaScript'
>;

export function getTrailerPlayerSize(width: number, height: number) {
  const playerWidth = Math.min(width, (height * 16) / 9);

  return {
    width: playerWidth,
    height: (playerWidth * 9) / 16,
  };
}

export function getTrailerWebViewProps(
  platform: PlatformOSType,
): TrailerWebViewProps {
  const requestAndroidFullscreen = platform === 'android';

  return {
    allowsInlineMediaPlayback: platform !== 'ios',
    injectedJavaScript: `
      (function startTrailerWhenReady() {
        var attempts = 0;
        var maximumAttempts = 100;
        var started = false;
        var timer = setInterval(function () {
          attempts += 1;

          if (typeof player !== 'undefined' &&
              player &&
              typeof player.playVideo === 'function') {
            if (!started) {
              started = true;
              player.playVideo();
            }

            if (${requestAndroidFullscreen} &&
                typeof player.getPlayerState === 'function' &&
                player.getPlayerState() === 1) {
              clearInterval(timer);
              var iframe = player.getIframe();
              var requestFullscreen = iframe.requestFullscreen ||
                iframe.webkitRequestFullscreen ||
                iframe.mozRequestFullScreen ||
                iframe.msRequestFullscreen;

              if (requestFullscreen) {
                var result = requestFullscreen.call(iframe);
                if (result && typeof result.catch === 'function') {
                  result.catch(function () {});
                }
              }
            }
          }

          if (attempts >= maximumAttempts) {
            clearInterval(timer);
          }
        }, 100);
      })();
      true;
    `,
  };
}
