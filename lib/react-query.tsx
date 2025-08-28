import { Topic } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Image } from "expo-image";
import * as Network from "expo-network";
import {
  getAllTopicsQueryOptions,
  getTopicByIdQueryOptions,
} from "./queries/topic.query";

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(state.isConnected ?? false);
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
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: Infinity,
        buster: "v1",
      }}
      onSuccess={() => {
        async function prepare() {
          const topics = (await queryClient.ensureQueryData(
            getAllTopicsQueryOptions()
          )) as Topic[];
          await Image.prefetch(topics.map((topic) => topic.meta_data.icon||""),'memory-disk')
          await Promise.all(
            topics.map((topic) => {
              queryClient.prefetchQuery({
                ...getTopicByIdQueryOptions(topic.id),
                queryFn: async () => topic,
              });
            })
          );
        }
        prepare()
          .catch((err) => {
            console.log(err);
          })
          
      }}
      onError={() => {
        console.log("onError");
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
