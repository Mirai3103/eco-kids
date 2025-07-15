import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as Network from "expo-network";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  getAllTopicsQueryOptions,
  getTopicByIdQueryOptions,
} from "./queries/topic.query";
import { Topic } from "@/types";
SplashScreen.preventAutoHideAsync();
onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });
  return eventSubscription.remove;
});
const queryClient = new QueryClient({
  defaultOptions: {
    // for react native offline first
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    async function prepare() {
      const topics = (await queryClient.ensureQueryData(
        getAllTopicsQueryOptions(),
      )) as Topic[];
      topics.forEach((topic) => {
        queryClient.prefetchQuery({
          ...getTopicByIdQueryOptions(topic.id),
          queryFn: async () => topic,
        });
      });
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
