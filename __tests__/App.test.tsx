/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/navigation/AppNavigator', () => ({
  AppNavigator: () => null,
}));

jest.mock('../src/providers/AppProvider', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-onesignal', () => ({
  LogLevel: { Verbose: 6 },
  OneSignal: {
    Debug: { setLogLevel: jest.fn() },
    Notifications: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    initialize: jest.fn(),
  },
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
