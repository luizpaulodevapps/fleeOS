"use client";

import React, { useState } from "react";
import { Share2, Save, Receipt, Radio, ShieldCheck, HelpCircle } from "lucide-react";

interface IntegrationsSettingsProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
}

export function IntegrationsSettings({
  webhookUrl,
  setWebhookUrl
}: IntegrationsSettingsProps) {
  // Telemetry states
  const [telemetryProvider, setTelemetryProvider] = useState("cobli");
  const [telemetryApiKey, setTelemetryApiKey] = useState("cb_tok_prod_4492a831ef77");
  const [isTestingTelemetry, setIsTestingTelemetry] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");

  const handleTestTelemetry = () => {
    setIsTestingTelemetry(true);
    setTestResult("idle");
    setTimeout(() => {
      setIsTestingTelemetry(false);
      setTestResult("success");
    }, 1200);
  };

  return (
    <div className="space-y-6 text-xs text-slate-800">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Integrações de API</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Conecte o FleetOS a sistemas externos de telemetria, webhooks e faturamentos Pix.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telemetry Integration Card (NEW Tool/Opportunity) */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Radio className="w-4 h-4 text-primary" />
              <span>Rastreamento & Telemetria</span>
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">Conecte rastreadores veiculares para sincronizar hodômetro, GPS e alertas de ignição automaticamente.</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Provedor de Telemetria</label>
                <select
                  value={telemetryProvider}
                  onChange={(e) => setTelemetryProvider(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-slate-700 font-semibold focus:border-primary"
                >
                  <option value="cobli">Cobli API (Recomendado)</option>
                  <option value="mobi">Mobi Rastreamento</option>
                  <option value="carcell">Carcell GPS</option>
                  <option value="custom">Custom API (JSON / Webhook)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Token de API / Autenticação</label>
                <input
                  type="password"
                  value={telemetryApiKey}
                  onChange={(e) => setTelemetryApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Configurações de telemetria salvas com sucesso!")}
              className="flex items-center space-x-1.5 px-4 py-2 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar API</span>
            </button>
            
            <button
              type="button"
              disabled={isTestingTelemetry}
              onClick={handleTestTelemetry}
              className="px-3 py-2 bg-slate-150 border border-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-40"
            >
              {isTestingTelemetry ? "Conectando..." : "Testar Conexão"}
            </button>

            {testResult === "success" && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Online!
              </span>
            )}
          </div>
        </div>

        {/* Webhooks config */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span>Webhook de Eventos</span>
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">Dispare alertas automáticos no formato JSON para sua API a cada movimentação financeira ou sinistro.</p>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-outline">Target URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface focus:border-primary"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => alert("URL do Webhook atualizada com sucesso!")}
              className="flex items-center space-x-1.5 px-4 py-2 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Webhook</span>
            </button>
          </div>
        </div>

        {/* Pix Gateway config */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm lg:col-span-2">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-primary" />
            <span>Gateway de Pagamentos Pix (Iugu)</span>
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl gap-3">
            <div className="text-[11px]">
              <p className="font-bold text-emerald-600">Serviço de Faturamento Pix Ativo</p>
              <p className="text-[9px] text-outline mt-0.5">As diárias geram QR Codes Pix automaticamente.</p>
            </div>
            <span className="text-emerald-600 font-bold text-xs bg-emerald-100 border border-emerald-200 rounded px-2.5 py-1 w-fit">CONECTADO</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
            <div className="flex justify-between py-1.5 border-b border-outline-variant/40">
              <span className="text-outline">Client ID:</span>
              <span className="font-mono text-primary">cli_fleetos_prod_9948a</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-outline-variant/40">
              <span className="text-outline">Ambiente:</span>
              <span className="font-bold text-emerald-600">Produção</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
