import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.teamelliot.app",
  appName: "team-elliot",
  webDir: "out",
  server: {
    errorPath: "/",
  },
  plugins: {
    StatusBar: {
      style: "default",
      backgroundColor: "#ffffff",
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
  // iOS 줌 비활성화
  ios: {
    contentInset: "never",
    webContentsDebuggingEnabled: false,
  },
  // Android 줌 비활성화
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
