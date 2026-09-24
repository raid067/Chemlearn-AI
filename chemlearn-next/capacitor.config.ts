import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration for ChemLearn AI Native Mobile Apps (iOS & Android).
 *
 * Architecture:
 * - Dynamic Remote Origin with Native Plugins Bridge:
 *   ChemLearn AI is an advanced Next.js App Router educational platform relying on
 *   serverless API endpoints (Firebase Admin SDK, Gemini LLM AI Tutor, Spaced Repetition engine).
 *   The native mobile shell connects securely over HTTPS to the authoritative deployment
 *   (or custom configured CAPACITOR_SERVER_URL) while exposing hardware bridges
 *   (Native Status Bar, App Lifecycle, Splash Screen, Secure Preferences).
 * - Full web and PWA parity is strictly preserved.
 */
const config: CapacitorConfig = {
  appId: 'my.chemlearn.app',
  appName: 'ChemLearn AI',
  webDir: 'public',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://chemlearn-67.web.app',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#faf8ff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
