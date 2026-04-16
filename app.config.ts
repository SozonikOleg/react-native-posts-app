import 'dotenv/config';

import type { ExpoConfig } from 'expo/config';

function env(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && value.trim()) return value.trim();
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env var: ${name}`);
}

const config: ExpoConfig = {
  name: env('EXPO_PUBLIC_APP_NAME', 'react-native-posts-app'),
  slug: env('EXPO_PUBLIC_APP_SLUG', 'react-native-posts-app'),
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: env('EXPO_PUBLIC_APP_SCHEME', 'react-native-posts-app'),
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;

