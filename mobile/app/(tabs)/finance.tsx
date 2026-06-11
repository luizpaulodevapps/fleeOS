import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useStore } from "../../src/store/useStore";
import { DollarSign, TrendingUp, History, Calendar, CheckCircle2, Clock } from "lucide-react-native";

export default function DriverFinance() {
  const payments = useStore((state) => state.payments);
  const activeContract = useStore((state) => state.activeContract);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalPending = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      {/* Saldo de Diárias Card */}
      <View className="bg-surface-container-lowest border border-outline-variant p-5 rounded-3xl mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Saldo de Diárias</Text>
            <Text className="text-primary text-2xl font-black mt-1">R$ 450,00</Text>
          </View>
          <View className="bg-emerald-500/10 p-2 rounded-full">
            <TrendingUp size={20} className="text-emerald-600" />
          </View>
        </View>
        <View className="flex-row justify-between items-center pt-3 border-t border-outline-variant/30">
          <Text className="text-on-surface-variant text-[10px]">Referente a 3 diárias (R$ 150,00/dia)</Text>
          <TouchableOpacity className="bg-primary px-3 py-1.5 rounded-lg">
            <Text className="text-white text-[10px] font-bold">Pagar Agora</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Financial Summary */}
      <View className="bg-primary p-6 rounded-3xl mb-6 shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-primary-container/80 text-xs font-bold uppercase tracking-widest">Saldo Pendente</Text>
          <DollarSign size={20} className="text-primary-container" />
        </View>
        <Text className="text-white text-4xl font-extrabold mb-2">
          R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
        <View className="flex-row items-center space-x-2 bg-white/10 self-start px-3 py-1.5 rounded-full">
          <TrendingUp size={14} className="text-emerald-400" />
          <Text className="text-white text-[10px] font-bold">Vence em 2 dias</Text>
        </View>
      </View>

      {/* Contract Rates Card */}
      {activeContract && (
        <View className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl mb-6 shadow-sm">
          <Text className="text-primary font-bold text-sm mb-4">Valores do Contrato</Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1 border-r border-outline-variant/30">
              <Text className="text-on-surface-variant text-[10px] uppercase font-bold mb-1">Diária</Text>
              <Text className="text-primary font-bold text-base">R$ {activeContract.daily_rate}</Text>
            </View>
            <View className="items-center flex-1 border-r border-outline-variant/30">
              <Text className="text-on-surface-variant text-[10px] uppercase font-bold mb-1">Semanal</Text>
              <Text className="text-primary font-bold text-base">R$ {activeContract.weekly_rate}</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-on-surface-variant text-[10px] uppercase font-bold mb-1">Mensal</Text>
              <Text className="text-primary font-bold text-base">R$ {activeContract.monthly_rate}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Payment History */}
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1">
          <View className="flex-row items-center space-x-2">
            <History size={18} className="text-primary" />
            <Text className="text-primary font-bold text-sm">Histórico de Pagamentos</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-primary text-[10px] font-bold uppercase">Ver Tudo</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {payments.map((payment: any) => (
            <View
              key={payment.id}
              className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-row items-center space-x-3">
                <View className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {payment.status === 'paid' ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : (
                    <Clock size={18} className="text-amber-600" />
                  )}
                </View>
                <View>
                  <Text className="text-primary font-bold text-xs">
                    {payment.status === 'paid' ? 'Pagamento Realizado' : 'Pagamento Pendente'}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Calendar size={10} className="text-on-surface-variant mr-1" />
                    <Text className="text-on-surface-variant text-[10px]">
                      Vencimento: {payment.due_date}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="items-end">
                <Text className={`font-bold text-sm ${payment.status === 'paid' ? 'text-emerald-600' : 'text-primary'}`}>
                  R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
                {payment.payment_method && (
                  <Text className="text-on-surface-variant text-[8px] uppercase font-bold mt-0.5">
                    via {payment.payment_method}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
