import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { useStore } from "../../src/store/useStore";
import { Car, Gauge, Calendar, DollarSign, CloudOff, RefreshCw, Milestone, Sparkles } from "lucide-react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

export default function DriverDashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const activeVehicle = useStore((state) => state.activeVehicle);
  const activeContract = useStore((state) => state.activeContract);
  const syncStatus = useStore((state) => state.syncStatus);
  const loadDashboardData = useStore((state) => state.loadDashboardData);
  const updateMileageOffline = useStore((state) => state.updateMileageOffline);

  const [mileageInput, setMileageInput] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update input text if activeVehicle loads
  useEffect(() => {
    if (activeVehicle) {
      setMileageInput(String(activeVehicle.mileage));
    }
  }, [activeVehicle]);

  const handleUpdateMileage = async () => {
    if (!activeVehicle) return;
    const newKm = Number(mileageInput);
    
    if (isNaN(newKm) || newKm <= activeVehicle.mileage) {
      Alert.alert(
        "Erro de Validação", 
        `A quilometragem informada deve ser maior que a atual (${activeVehicle.mileage} km).`
      );
      return;
    }

    setUpdating(true);
    try {
      await updateMileageOffline(activeVehicle.id, newKm);
      Alert.alert(
        "Sucesso",
        syncStatus.isOnline 
          ? "Quilometragem atualizada e sincronizada com sucesso!" 
          : "Quilometragem atualizada localmente! Será sincronizada quando houver conexão."
      );
    } catch (e) {
      Alert.alert("Erro", "Não foi possível atualizar a quilometragem.");
    } finally {
      setUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-on-surface text-base font-semibold">Nenhum motorista logado</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      {/* Offline Status Warning Bar */}
      {!syncStatus.isOnline && (
        <View className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex-row items-center mb-4 space-x-3">
          <CloudOff size={22} className="text-amber-600" />
          <View className="flex-1">
            <Text className="text-amber-700 font-bold text-xs">Modo Offline Ativado</Text>
            <Text className="text-on-surface-variant text-[10px] mt-0.5 leading-4">
              Suas alterações de quilometragem e chamados serão gravadas localmente e enviadas assim que houver rede.
            </Text>
          </View>
        </View>
      )}

      {/* Welcome Header */}
      <View className="flex-row justify-between items-center mb-6 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60">
        <View className="flex-row items-center space-x-3">
          <View className="relative">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuANUpygk_VleHGqhEtgktE-FRmHi3DdAjExuuDX5JgCRDqjDeC1TNxyuhdoY5m0VEE5S8rwOMEDr13Gb6pgWxAykxuinaSxGOrw0OVbYh04awxf5ZfPw52HOc367xRMXW5gzdpnUxDWNDy9IAh1uAHG5naHbUODy9-zP3s86Uvj2PoeItYqVkSnqeBKz02QSbcjyJhyUwvnwV3-AptwuqgE2gFB7U5c8PXg9U7UbHNfarSOnXjFyrxGZvmcbhmQek1auNioJ6JXfQ" }}
              className="w-12 h-12 rounded-full object-cover"
            />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-container-lowest rounded-full" />
          </View>
          <View>
            <Text className="text-primary font-bold text-base">Olá, {currentUser.name.split(" ")[0]}</Text>
            <Text className="text-on-surface-variant text-[10px] font-semibold">Turno: 08:00 - 17:00</Text>
          </View>
        </View>
        
        <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <Text className="text-emerald-600 text-[10px] font-bold uppercase">Em Turno</Text>
        </View>
      </View>

      {/* Assigned Vehicle Section */}
      {activeVehicle ? (
        <View className="space-y-4">
          
          {/* Vehicle Visual Card */}
          <View className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <Image
              source={{ uri: activeVehicle.photoUrl || "https://images.unsplash.com/photo-1625217527288-93919c996509?w=300" }}
              className="w-full h-40 object-cover"
            />
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-primary text-base font-bold">{activeVehicle.brand} {activeVehicle.model}</Text>
                  <Text className="text-on-surface-variant text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded inline-block mt-1">
                    V-402 • {activeVehicle.plate}
                  </Text>
                </View>
                <View className="bg-white px-2.5 py-1 rounded border border-gray-300">
                  <Text className="text-black font-extrabold text-xs tracking-widest">{activeVehicle.plate}</Text>
                </View>
              </View>

              {/* Stats Section */}
              <View className="grid grid-cols-2 gap-4 border-t border-outline-variant/60 pt-4 mt-4 flex-row justify-between">
                <View className="flex-row items-center space-x-2">
                  <Gauge size={16} className="text-secondary" />
                  <View>
                    <Text className="text-on-surface-variant text-[9px] uppercase font-semibold">Odômetro</Text>
                    <Text className="text-primary text-xs font-bold">{activeVehicle.mileage.toLocaleString('pt-BR')} km</Text>
                  </View>
                </View>
                <View className="flex-row items-center space-x-2">
                  <Milestone size={16} className="text-secondary" />
                  <View>
                    <Text className="text-on-surface-variant text-[9px] uppercase font-semibold">Nível Comb.</Text>
                    <Text className="text-primary text-xs font-bold">84%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Mileage Updater Card */}
          <View className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl space-y-3 shadow-sm">
            <Text className="text-primary font-bold text-xs">Atualizar Quilometragem (Offline-First)</Text>
            <View className="flex-row items-center space-x-2">
              <TextInput
                value={mileageInput}
                onChangeText={setMileageInput}
                keyboardType="numeric"
                className="flex-1 bg-surface-container-low border border-outline-variant text-primary rounded-lg px-3 py-2 text-xs"
                placeholder="KM Atual"
              />
              <TouchableOpacity
                onPress={handleUpdateMileage}
                disabled={updating}
                className="bg-primary px-4 py-2.5 rounded-lg justify-center items-center shadow"
              >
                {updating ? (
                  <RefreshCw size={14} className="text-white animate-spin" />
                ) : (
                  <Text className="text-white font-bold text-xs">Atualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Earnings Card with SVG Sparkline */}
          <View className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Ganhos de Hoje</Text>
              <Sparkles size={16} className="text-emerald-600 animate-pulse" />
            </View>
            
            <View className="flex-row items-end justify-between">
              <Text className="text-primary font-bold text-2xl">R$ 142,50</Text>
              
              {/* Sparkline */}
              <View className="w-32 h-10 overflow-hidden">
                <Svg height="100%" width="100%" viewBox="0 0 100 40">
                  <Path
                    d="M0,35 Q10,32 20,28 T40,25 T60,15 T80,18 T100,5"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                  />
                </Svg>
              </View>
            </View>

            <View className="flex-row justify-between pt-2 border-t border-outline-variant/60 text-[10px] text-on-surface-variant font-semibold">
              <Text>6 corridas concluídas</Text>
              <Text>Média R$ 23,75/corrida</Text>
            </View>
          </View>

          {/* Active Contract Details */}
          {activeContract && (
            <View className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl space-y-2.5 shadow-sm">
              <Text className="text-primary font-bold text-xs">Resumo do Contrato</Text>
              
              <View className="flex-row justify-between items-center py-1 border-b border-outline-variant/30">
                <Text className="text-on-surface-variant text-[10px] flex-row items-center">
                  <Calendar size={12} className="text-outline mr-1" /> Início da Locação
                </Text>
                <Text className="text-primary text-[10px] font-bold">{activeContract.start_date}</Text>
              </View>

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-on-surface-variant text-[10px] flex-row items-center">
                  <DollarSign size={12} className="text-outline mr-1" /> Custo Mensal Acordado
                </Text>
                <Text className="text-primary text-[10px] font-bold">R$ {activeContract.monthly_rate}</Text>
              </View>
            </View>
          )}

        </View>
      ) : (
        <View className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl justify-center items-center text-center mt-12">
          <Car size={32} className="text-outline mb-3" />
          <Text className="text-primary font-bold text-sm">Sem veículo vinculado</Text>
          <Text className="text-on-surface-variant text-[11px] text-center mt-1 leading-4">
            Você não possui nenhum veículo ativo vinculado ao seu contrato no momento. Entre em contato com seu gestor de frota.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
