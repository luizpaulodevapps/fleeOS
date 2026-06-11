import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useStore } from "../../src/store/useStore";
import { Wrench, Calendar, ClipboardList, Plus, ChevronRight, Gauge, ShieldAlert } from "lucide-react-native";

export default function DriverMaintenance() {
  const maintenanceHistory = useStore((state) => state.maintenanceHistory);
  const activeVehicle = useStore((state) => state.activeVehicle);
  const submitTicket = useStore((state) => state.submitTicket);

  const handleSchedule = () => {
    Alert.alert(
      "Agendar Manutenção",
      "Deseja solicitar o agendamento de uma revisão preventiva?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Solicitar",
          onPress: async () => {
            await submitTicket("[Agendamento] Manutenção Preventiva", "Solicito agendamento de revisão para o veículo.");
            Alert.alert("Sucesso", "Sua solicitação foi enviada para a frota. Entraremos em contato com a data e local.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>

      {/* Maintenance Status Overview */}
      <View className="flex-row space-x-4 mb-6">
        <View className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl shadow-sm">
          <View className="bg-blue-100 w-8 h-8 rounded-lg items-center justify-center mb-3">
            <Gauge size={16} className="text-blue-600" />
          </View>
          <Text className="text-on-surface-variant text-[10px] font-bold uppercase mb-1">Próxima Revisão</Text>
          <Text className="text-primary font-bold text-sm">Em 10.000 km</Text>
        </View>
        <View className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl shadow-sm">
          <View className="bg-amber-100 w-8 h-8 rounded-lg items-center justify-center mb-3">
            <ShieldAlert size={16} className="text-amber-600" />
          </View>
          <Text className="text-on-surface-variant text-[10px] font-bold uppercase mb-1">Status Geral</Text>
          <Text className="text-emerald-600 font-bold text-sm">Regular</Text>
        </View>
      </View>

      {/* Schedule Action */}
      <TouchableOpacity
        onPress={handleSchedule}
        className="bg-primary flex-row items-center justify-between p-4 rounded-xl mb-8 shadow-md"
      >
        <View className="flex-row items-center space-x-3">
          <View className="bg-white/20 p-2 rounded-lg">
            <Calendar size={20} className="text-white" />
          </View>
          <View>
            <Text className="text-white font-bold text-sm">Agendar Manutenção</Text>
            <Text className="text-white/70 text-[10px]">Solicite data e hora na oficina</Text>
          </View>
        </View>
        <Plus size={20} className="text-white" />
      </TouchableOpacity>

      {/* Maintenance History */}
      <View className="space-y-4">
        <View className="flex-row items-center space-x-2 px-1">
          <ClipboardList size={18} className="text-primary" />
          <Text className="text-primary font-bold text-sm">Histórico de Serviços</Text>
        </View>

        <View className="space-y-3">
          {maintenanceHistory.length > 0 ? maintenanceHistory.map((m: any) => (
            <View
              key={m.id}
              className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center space-x-2">
                  <View className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                    <Wrench size={14} className="text-on-secondary-container" />
                  </View>
                  <View>
                    <Text className="text-primary font-bold text-xs">{m.type}</Text>
                    <Text className="text-on-surface-variant text-[10px]">{m.date}</Text>
                  </View>
                </View>
                <View className="bg-surface-container px-2 py-0.5 rounded">
                  <Text className="text-primary font-bold text-[9px]">{m.mileage} KM</Text>
                </View>
              </View>
              <Text className="text-on-surface-variant text-[11px] leading-4 mb-3">
                {m.description}
              </Text>
              <View className="pt-2 border-t border-outline-variant/30 flex-row justify-between items-center">
                <Text className="text-on-surface-variant text-[9px] font-bold uppercase">Custo Frota</Text>
                <Text className="text-primary font-bold text-xs">R$ {m.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          )) : (
            <View className="bg-surface-container-lowest border border-dashed border-outline-variant p-8 rounded-xl items-center">
              <Text className="text-on-surface-variant text-[11px]">Nenhum histórico registrado</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
