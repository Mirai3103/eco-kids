import { Topic } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as Network from "expo-network";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  getAllTopicsQueryOptions,
  getTopicByIdQueryOptions,
} from "./queries/topic.query";
SplashScreen.preventAutoHideAsync();
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
  useEffect(() => {
    async function prepare() {
      const topics = (await queryClient.ensureQueryData(
        getAllTopicsQueryOptions(),
      )) as Topic[];
      await Promise.all(topics.map((topic) => {
        queryClient.prefetchQuery({
          ...getTopicByIdQueryOptions(topic.id),
          queryFn: async () => topic,
        });
      }));
    }
    prepare()
    .catch(err=>{
      console.log(err)
    })
    .finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);
  useEffect(() => {
    AsyncStorage.getAllKeys().then((keys) => {
      console.log('Stored keys:', keys);
      if (keys.includes('REACT_QUERY_OFFLINE_CACHE')) {
        AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE').then((value) => {
          console.log('Persisted QueryClient data:', value?.slice(0, 500)); // giới hạn ký tự cho log
        });
      } else {
        console.log('❌ No persisted cache found.');
      }
    });
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('test-key', '1234').then(() => {
      AsyncStorage.getItem('test-key').then((val) => {
        console.log('Test AsyncStorage write:', val); // Should be "1234"
      });
    });
  }, []);
  
  
 
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister,maxAge:Infinity, buster:'v1' }}
     
      onSuccess={()=>{
        console.log('onSuccess')
      }}
      onError={()=>{
        console.log('onError')
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
