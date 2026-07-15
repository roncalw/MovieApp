import React from 'react';
import { RefreshControl, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { AppRefreshControl } from '../src/shared/refresh/AppRefreshControl';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 0, left: 0 }),
}));

describe('AppRefreshControl', () => {
  test('forwards the child and style injected by Android ScrollView', async () => {
    const injectedStyle = { flex: 1 };
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <AppRefreshControl
          onRefresh={() => undefined}
          refreshing={false}
          style={injectedStyle}
        >
          <View testID="android-scroll-view" />
        </AppRefreshControl>,
      );
    });

    const nativeRefreshControl = renderer!.root.findByType(RefreshControl);
    const forwardedChild = React.Children.only(
      nativeRefreshControl.props.children,
    ) as React.ReactElement<{ testID: string }>;

    expect(nativeRefreshControl.props.style).toBe(injectedStyle);
    expect(forwardedChild.props.testID).toBe('android-scroll-view');

    await act(async () => {
      renderer!.unmount();
    });
  });
});
