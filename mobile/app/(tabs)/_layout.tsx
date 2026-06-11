import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { LayoutDashboard, Ticket, RefreshCw, DollarSign, Wrench } from "lucide-react-native";
import { useStore } from "../../src/store/useStore";

export default function TabsLayout() {
  const syncStatus = useStore((state) => state.syncStatus);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#e4e2e4", // surface-container-highest
          borderTopColor: "#c6c6cd", // outline-variant
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: "#000000", // primary
        tabBarInactiveTintColor: "#45464d", // on-surface-variant
        headerStyle: {
          backgroundColor: "#fcf8fa", // background
          borderBottomWidth: 1,
          borderBottomColor: "#c6c6cd", // outline-variant
        },
        headerTintColor: "#1b1b1d", // on-surface
        headerRight: () => (
          <View className="flex-row items-center space-x-3 px-4">
            {/* Sync Indicators */}
            {syncStatus.pendingCount > 0 ? (
              <View className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex-row items-center space-x-1.5">
                <RefreshCw size={12} className={`text-amber-600 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                <Text className="text-[10px] text-amber-600 font-bold">{syncStatus.pendingCount} pendente(s)</Text>
              </View>
            ) : null}

            {/* Connection Status Dot */}
            <View className={`w-2.5 h-2.5 rounded-full ${syncStatus.isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
            <Text className="text-xs font-semibold text-on-surface-variant">
              {syncStatus.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        )
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Painel",
          tabBarLabel: "Meu Carro",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          headerTitle: "FleetOS Driver"
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Financeiro",
          tabBarLabel: "Financeiro",
          tabBarIcon: ({ color, size }) => <DollarSign color={color} size={size} />,
          headerTitle: "Meu Financeiro"
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: "Manutenção",
          tabBarLabel: "Oficina",
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />,
          headerTitle: "Manutenção & Oficina"
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Chamados",
          tabBarLabel: "Mensagens",
          tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} />,
          headerTitle: "Avisos e Chamados"
        }}
      />
    </Tabs>
  );
}
