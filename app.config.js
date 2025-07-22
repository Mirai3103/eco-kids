import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    ...config.extra,
  },
  plugins: [
    'expo-font',
    ...config.plugins,
  ]
});
