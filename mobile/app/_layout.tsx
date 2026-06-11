import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initializeDatabase } from "../src/lib/sqlite";
import { syncEngine } from "../src/lib/sync";
import { useStore } from "../src/store/useStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const initializeSession = useStore(state => state.initializeSession);
  const updateSyncStatus = useStore(state => state.updateSyncStatus);

  useEffect(() => {
    // 1. Initialize local SQLite Database schema and mocks
    try {
      initializeDatabase();
      console.log("SQLite inicializado com sucesso.");
    } catch (e) {
      console.error("Erro fatal ao inicializar SQLite", e);
    }

    // 2. Load active driver session from database if exists
    initializeSession();

    // 3. Connect the Sync Engine state listeners directly to Zustand
    const unsubscribeSync = syncEngine.subscribe((status) => {
      updateSyncStatus(status);
    });

    return () => {
      unsubscribeSync();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fcf8fa", // background
          },
          headerTintColor: "#1b1b1d", // on-background
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#fcf8fa", // background
          }
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
