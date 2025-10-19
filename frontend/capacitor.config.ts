import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.teamelliot.app",
  appName: "team-elliot",
  webDir: "out",
  server: {
    errorPath: "/",
  },
};

export default config;
