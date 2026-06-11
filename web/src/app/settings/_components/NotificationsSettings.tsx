"use client";

import React from "react";
import { Bell, Save } from "lucide-react";

interface NotificationsSettingsProps {
  notificationsConfig: {
    whatsappCnh: boolean;
    whatsappOverdue: boolean;
    emailDailyReport: boolean;
  };
  setNotificationsConfig: React.Dispatch<React.SetStateAction<{
    whatsappCnh: boolean;
    whatsappOverdue: boolean;
    emailDailyReport: boolean;
  }>>;
}

export function NotificationsSettings({
  notificationsConfig,
  setNotificationsConfig
}: NotificationsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Definições de Avisos & WhatsApp</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Ative alertas automáticos disparados aos motoristas e gerência.</p>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm max-w-xl">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-primary" />
          <span>Configurações de Gatilho</span>
        </h4>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 bg-slate-50 border border-outline-variant/50 rounded-xl hover:bg-slate-100/50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notificationsConfig.whatsappCnh}
              onChange={(e) => setNotificationsConfig({ ...notificationsConfig, whatsappCnh: e.target.checked })}
              className="w-4 h-4 accent-primary rounded mt-0.5"
            />
            <div className="text-[11px]">
              <p className="font-bold text-primary">Disparo de WhatsApp para Renovação de CNH</p>
              <p className="text-[9px] text-outline mt-0.5">Envia lembrete ao motorista 30 dias antes e semanalmente após o vencimento.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 border border-outline-variant/50 rounded-xl hover:bg-slate-100/50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notificationsConfig.whatsappOverdue}
              onChange={(e) => setNotificationsConfig({ ...notificationsConfig, whatsappOverdue: e.target.checked })}
              className="w-4 h-4 accent-primary rounded mt-0.5"
            />
            <div className="text-[11px]">
              <p className="font-bold text-primary">Cobrança Automática de Diária em Atraso</p>
              <p className="text-[9px] text-outline mt-0.5">Gera cobrança no WhatsApp se o saldo acumulado for inferior a R$ -250,00.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 border border-outline-variant/50 rounded-xl hover:bg-slate-100/50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notificationsConfig.emailDailyReport}
              onChange={(e) => setNotificationsConfig({ ...notificationsConfig, emailDailyReport: e.target.checked })}
              className="w-4 h-4 accent-primary rounded mt-0.5"
            />
            <div className="text-[11px]">
              <p className="font-bold text-primary">Relatório Fechamento Diário por E-mail</p>
              <p className="text-[9px] text-outline mt-0.5">Envia um resumo executivo de faturamento e carros parados no e-mail comercial.</p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-3 border-t border-outline-variant/60">
          <button
            onClick={() => alert("Configurações de notificações atualizadas!")}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
}
