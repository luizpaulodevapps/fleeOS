import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useStore } from "../../src/store/useStore";
import { Bell, Send, MessageSquare, ClipboardList, Clock, ShieldAlert, Wrench, ChevronRight } from "lucide-react-native";

export default function DriverTickets() {
  const notifications = useStore((state) => state.notifications);
  const submitTicket = useStore((state) => state.submitTicket);
  const syncStatus = useStore((state) => state.syncStatus);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Erro de Validação", "Preencha o título e a descrição do chamado.");
      return;
    }

    setSubmitting(true);
    try {
      await submitTicket(`[Chamado] ${title}`, description);
      setTitle("");
      setDescription("");
      Alert.alert(
        "Chamado Aberto",
        syncStatus.isOnline
          ? "Seu chamado foi registrado e enviado para a administração."
          : "Chamado registrado no celular! Será enviado automaticamente quando recuperar conexão de internet."
      );
    } catch (e) {
      Alert.alert("Erro", "Ocorreu uma falha ao registrar o chamado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      
      {/* Support Ticket Section */}
      <View className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl space-y-3 mb-6 shadow-sm">
        <View className="flex-row items-center space-x-2">
          <MessageSquare size={18} className="text-primary" />
          <Text className="text-primary font-bold text-sm">Abrir Chamado / Ocorrência</Text>
        </View>
        <Text className="text-on-surface-variant text-[11px] leading-4">
          Reporte problemas com o carro, envie recibos ou solicite ajuda operacional.
        </Text>

        <View className="space-y-3">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setTitle("Reportar Sinistro")}
              className={`flex-1 p-2 rounded-lg border items-center justify-center ${title === 'Reportar Sinistro' ? 'bg-red-50 border-red-200' : 'bg-surface-container border-outline-variant'}`}
            >
              <ShieldAlert size={16} className={title === 'Reportar Sinistro' ? "text-red-600" : "text-on-surface-variant"} />
              <Text className={`text-[10px] font-bold mt-1 ${title === 'Reportar Sinistro' ? 'text-red-600' : 'text-on-surface-variant'}`}>Sinistro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTitle("Problema Mecânico")}
              className={`flex-1 p-2 rounded-lg border items-center justify-center ${title === 'Problema Mecânico' ? 'bg-amber-50 border-amber-200' : 'bg-surface-container border-outline-variant'}`}
            >
              <Wrench size={16} className={title === 'Problema Mecânico' ? "text-amber-600" : "text-on-surface-variant"} />
              <Text className={`text-[10px] font-bold mt-1 ${title === 'Problema Mecânico' ? 'text-amber-600' : 'text-on-surface-variant'}`}>Mecânico</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTitle("Dúvida Financeira")}
              className={`flex-1 p-2 rounded-lg border items-center justify-center ${title === 'Dúvida Financeira' ? 'bg-blue-50 border-blue-200' : 'bg-surface-container border-outline-variant'}`}
            >
              <MessageSquare size={16} className={title === 'Dúvida Financeira' ? "text-blue-600" : "text-on-surface-variant"} />
              <Text className={`text-[10px] font-bold mt-1 ${title === 'Dúvida Financeira' ? 'text-blue-600' : 'text-on-surface-variant'}`}>Financeiro</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-2">Assunto / Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Barulho na suspensão dianteira"
              placeholderTextColor="#76777d"
              className="w-full bg-surface-container-low border border-outline-variant text-primary rounded-lg px-3 py-2 text-xs"
            />
          </View>

          <View>
            <Text className="text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-2">Descrição do Problema</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva em detalhes o ocorrido..."
              placeholderTextColor="#76777d"
              multiline
              numberOfLines={3}
              className="w-full bg-surface-container-low border border-outline-variant text-primary rounded-lg px-3 py-2 text-xs h-20 text-left"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="w-full bg-primary rounded-lg py-3 flex-row items-center justify-center space-x-2 mt-2 shadow-sm"
          >
            <Send size={14} className="text-white" />
            <Text className="text-white font-bold text-xs">
              {submitting ? "Enviando..." : "Enviar Chamado"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stitch-style Core Tasks & Notifications Feed */}
      <View className="space-y-4">
        <View className="flex-row items-center space-x-2">
          <Bell size={18} className="text-primary" />
          <Text className="text-primary font-bold text-sm">Tarefas & Avisos Críticos</Text>
        </View>

        {/* Stitch Screen Tasks Mock list */}
        <View className="space-y-2.5">
          {/* Card 1 */}
          <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center space-x-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <Clock size={16} className="text-on-secondary-container" />
              </View>
              <View className="flex-1">
                <Text className="text-primary font-bold text-xs">Início de Turno</Text>
                <Text className="text-on-surface-variant text-[10px] mt-0.5">Seu turno se inicia em 15 minutos</Text>
              </View>
            </View>
            <ChevronRight size={16} className="text-outline" />
          </View>

          {/* Card 2 */}
          <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center space-x-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center">
                <ShieldAlert size={16} className="text-error" />
              </View>
              <View className="flex-1">
                <Text className="text-primary font-bold text-xs">Renovação de CNH</Text>
                <Text className="text-on-surface-variant text-[10px] mt-0.5">Sua CNH vence em 5 dias. Envie a foto.</Text>
              </View>
            </View>
            <ChevronRight size={16} className="text-outline" />
          </View>

          {/* Card 3 */}
          <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center space-x-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <Wrench size={16} className="text-on-tertiary-fixed" />
              </View>
              <View className="flex-1">
                <Text className="text-primary font-bold text-xs">Revisão do Veículo</Text>
                <Text className="text-on-surface-variant text-[10px] mt-0.5">Troca de óleo programada para amanhã</Text>
              </View>
            </View>
            <ChevronRight size={16} className="text-outline" />
          </View>
        </View>

        {/* Live SQLite Notifications Feed */}
        <View className="pt-2">
          <Text className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider mb-3 px-1">Chamados & Mensagens Recentes</Text>
          <View className="space-y-2.5">
            {notifications.filter(n => n.id !== "not-1").map((notif: any) => {
              const isTkt = notif.title.startsWith("[Chamado]");
              return (
                <View
                  key={notif.id}
                  className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex-row items-start space-x-3 shadow-sm"
                >
                  <View className={`p-2 rounded-lg mt-0.5 ${isTkt ? 'bg-blue-500/10' : 'bg-brand-500/10'}`}>
                    <MessageSquare size={14} className={isTkt ? "text-blue-500" : "text-brand-500"} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-primary font-bold text-xs flex-1 truncate">{notif.title}</Text>
                      <Text className="text-on-surface-variant text-[8px]">
                        {new Date(notif.created_at || notif.createdAt).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    <Text className="text-on-surface-variant text-[10px] mt-1 leading-4">{notif.message}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
