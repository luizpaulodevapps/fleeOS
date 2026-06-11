import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useStore } from "../../src/store/useStore";
import { useRouter } from "expo-router";
import { Shield, KeyRound, Mail } from "lucide-react-native";

export default function MobileLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginDriver = useStore((state) => state.loginDriver);
  const loading = useStore((state) => state.loading);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Por favor preencha todos os campos.");
      return;
    }

    const success = await loginDriver(email);
    if (success && password === "123456") {
      router.replace("/(tabs)/dashboard");
    } else {
      setError("Motorista não cadastrado localmente ou senha incorreta. Use o email 'driver@fleetsos.com' e senha '123456'.");
    }
  };

  const fillMockData = () => {
    setEmail("driver@fleetsos.com");
    setPassword("123456");
  };

  return (
    <View className="flex-1 bg-obsidian-950 justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-16 h-16 rounded-3xl bg-brand-500 justify-center items-center mb-4 shadow-lg">
          <Text className="text-obsidian-950 font-black text-3xl">F</Text>
        </View>
        <Text className="text-white text-2xl font-bold tracking-tight">FleetOS Driver</Text>
        <Text className="text-obsidian-400 text-xs mt-1">Gestão de Frotas Offline-First</Text>
      </View>

      {error ? (
        <View className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center space-x-2">
          <Text className="text-red-400 text-xs flex-1">{error}</Text>
        </View>
      ) : null}

      <View className="space-y-4">
        {/* Email Input */}
        <View>
          <Text className="text-obsidian-400 text-[10px] uppercase font-bold tracking-wider mb-2">E-mail Corporativo</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="driver@fleetsos.com"
            placeholderTextColor="#627081"
            autoCapitalize="none"
            keyboardType="email-address"
            className="w-full bg-obsidian-900 border border-obsidian-800 text-white rounded-xl px-4 py-3.5 text-sm"
          />
        </View>

        {/* Password Input */}
        <View className="mt-4">
          <Text className="text-obsidian-400 text-[10px] uppercase font-bold tracking-wider mb-2">Senha de Acesso</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#627081"
            secureTextEntry
            className="w-full bg-obsidian-900 border border-obsidian-800 text-white rounded-xl px-4 py-3.5 text-sm"
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="w-full bg-brand-500 rounded-xl py-4 items-center justify-center mt-6 shadow-md"
        >
          {loading ? (
            <ActivityIndicator color="#050a0e" />
          ) : (
            <Text className="text-obsidian-950 font-bold text-sm">Entrar no Aplicativo</Text>
          )}
        </TouchableOpacity>

        {/* Quick Access Helper */}
        <TouchableOpacity
          onPress={fillMockData}
          className="border border-dashed border-brand-500/30 rounded-xl p-4 mt-8 items-center bg-brand-500/5"
        >
          <Text className="text-brand-400 text-xs font-semibold">Preencher Dados de Teste</Text>
          <Text className="text-obsidian-400 text-[10px] mt-1">driver@fleetsos.com | 123456</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
