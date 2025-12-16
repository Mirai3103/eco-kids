import { deepSeek } from "@genkit-ai/compat-oai/deepseek";
import Constants from "expo-constants";
import { genkit } from "genkit";
export const AI_GENKIT = genkit({
  plugins: [
    deepSeek({
      apiKey: Constants.expoConfig?.extra?.deepseekApiKey,
    }),
  ],
  model: deepSeek.model('deepseek-chat'),
});
