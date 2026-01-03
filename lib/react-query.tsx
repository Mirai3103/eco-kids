import { Topic } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager ,QueryClientProvider} from "@tanstack/react-query";
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
export const queryClient = new QueryClient({
  defaultOptions: {
    // for react native offline first
    // queries: {
    //   staleTime: Infinity,
    //   gcTime: Infinity,
    // },
  },
});

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider
      client={queryClient}
    >
      {children}
    </QueryClientProvider>
  );
}
