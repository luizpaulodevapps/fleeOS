"use client";

import React from "react";
import { Share2, Save, Receipt } from "lucide-react";

interface IntegrationsSettingsProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
}

export function IntegrationsSettings({
  webhookUrl,
  setWebhookUrl
}: IntegrationsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Integrações de API</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Conecte o FleetOS a sistemas externos de telemetria, webhooks e faturamentos Pix.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Webhooks config */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-primary" />
            <span>Webhook de Eventos</span>
          </h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">Dispare alertas automáticos no formato JSON para sua API a cada movimentação financeira ou sinistro.</p>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-outline">Target URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface focus:border-primary"
            />
          </div>
          <button
            onClick={() => alert("URL do Webhook atualizada com sucesso!")}
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Webhook</span>
          </button>
        </div>

        {/* Pix Gateway config */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-primary" />
            <span>Gateway de Pagamentos Pix (Iugu)</span>
          </h4>
          <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <div className="text-[11px]">
              <p className="font-bold text-emerald-600">Serviço de Faturamento Pix Ativo</p>
              <p className="text-[9px] text-outline mt-0.5">As diárias geram QR Codes Pix automaticamente.</p>
            </div>
            <span className="text-emerald-600 font-bold text-sm">ATIVO</span>
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between py-1 border-b border-outline-variant/40">
              <span className="text-outline">Client ID:</span>
              <span className="font-mono text-primary">cli_fleetos_prod_9948a</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/40">
              <span className="text-outline">Ambiente:</span>
              <span className="font-bold text-emerald-600">Produção</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
