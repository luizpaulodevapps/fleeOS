"use client";

import React, { useState } from "react";
import { Bell, Save, MessageSquare, ShieldCheck } from "lucide-react";

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
  // SMS/WhatsApp Gateway states
  const [gatewayType, setGatewayType] = useState("evolution");
  const [gatewayUrl, setGatewayUrl] = useState("https://api.whatsapp.fleetos.com.br");
  const [gatewayToken, setGatewayToken] = useState("evt_tok_9918a773bcde44");
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [gatewayTestResult, setGatewayTestResult] = useState<"idle" | "success" | "error">("idle");

  const handleTestGateway = () => {
    setIsTestingGateway(true);
    setGatewayTestResult("idle");
    setTimeout(() => {
      setIsTestingGateway(false);
      setGatewayTestResult("success");
    }, 1100);
  };

  return (
    <div className="space-y-6 text-xs text-slate-800">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Definições de Avisos & WhatsApp</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Ative alertas automáticos disparados aos motoristas e gerência.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Toggle notifications triggers */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm">
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

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => alert("Gatilhos de notificação atualizados!")}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Gatilhos</span>
            </button>
          </div>
        </div>

        {/* WhatsApp SMS Gateway Config (NEW Tool/Opportunity) */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Gateway de WhatsApp (WhatsApp API)</span>
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">Conecte sua instância da API do WhatsApp para enviar cobranças, avisos de vencimento e alertas de CNH de forma automatizada.</p>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1">Tipo de API</label>
                  <select
                    value={gatewayType}
                    onChange={(e) => setGatewayType(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-slate-700 font-semibold focus:border-primary"
                  >
                    <option value="evolution">Evolution API (Node)</option>
                    <option value="zapi">Z-API Gateway</option>
                    <option value="twilio">Twilio WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome Instância</label>
                  <input
                    type="text"
                    defaultValue="fleetos_production"
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">API Endpoint URL</label>
                <input
                  type="text"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Token de Autenticação / Key</label>
                <input
                  type="password"
                  value={gatewayToken}
                  onChange={(e) => setGatewayToken(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => alert("Configurações do WhatsApp Gateway salvas!")}
              className="flex items-center space-x-1.5 px-4 py-2 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Canal</span>
            </button>
            <button
              type="button"
              disabled={isTestingGateway}
              onClick={handleTestGateway}
              className="px-3 py-2 bg-slate-150 border border-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-40"
            >
              {isTestingGateway ? "Enviando teste..." : "Enviar Teste"}
            </button>

            {gatewayTestResult === "success" && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Ativo!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
