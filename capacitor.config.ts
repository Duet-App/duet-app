import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.aharish.duet.app',
  appName: 'Duet',
  webDir: 'dist',
  android: {
    flavor: 'dev'
  }
};

export default config;
