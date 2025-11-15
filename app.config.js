import "dotenv/config";
export default ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    ...config.extra,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    mistralApiKey: process.env.EXPO_PUBLIC_MISTRAL_API_KEY,
    deepseekApiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
    isProduction: process.env.NODE_ENV === 'production',
  },
  plugins: [...config.plugins],
});
