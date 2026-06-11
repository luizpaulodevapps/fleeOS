"use client";

import React from "react";
import { Sparkles, Car, RotateCcw, RefreshCw, ClipboardCheck, ArrowRight, AlertTriangle } from "lucide-react";

interface OperationsOverviewProps {
  openCashier: any;
  recentActivities: any[];
  onStartDelivery: () => void;
  onStartReturn: () => void;
  onStartSwap: () => void;
}

export const OperationsOverview: React.FC<OperationsOverviewProps> = ({
  openCashier,
  recentActivities,
  onStartDelivery,
  onStartReturn,
  onStartSwap
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Active Cashier Alert */}
      {!openCashier && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-800">Atenção: Caixa do Operador Fechado</h4>
            <p className="text-[11px] text-amber-700 mt-1">
              Não há sessões de caixa aberto sob seu usuário. Você poderá realizar entregas e devoluções, mas transações de recebimento financeiro físico (Dinheiro/Pix no ato) estarão restritas para assegurar o fluxo de caixa.
            </p>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-primary font-geist">🚗 Entrega de Veículo</h3>
            <p className="text-on-surface-variant text-xs mt-2 leading-relaxed">
              Fluxo integrado para vistoria de saída, aprovação técnica/documental de condutor, diárias, caução contratual e assinatura digital do termo.
            </p>
          </div>
          <button
            onClick={onStartDelivery}
            className="mt-6 flex items-center justify-between w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <span>Iniciar Entrega</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Return Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-primary font-geist">🔄 Devolução de Veículo</h3>
            <p className="text-on-surface-variant text-xs mt-2 leading-relaxed">
              Encerre locações aferindo odômetro final, combustível, novas avarias, cálculo automático de saldos e amortização ou release de caução de segurança.
            </p>
          </div>
          <button
            onClick={onStartReturn}
            className="mt-6 flex items-center justify-between w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <span>Iniciar Devolução</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Swap Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-primary font-geist">🔁 Troca de Veículo</h3>
            <p className="text-on-surface-variant text-xs mt-2 leading-relaxed">
              Substituição integrada de veículo locado por um ativo livre. Realiza a vistoria do veículo que sai, a entrega do veículo que entra e o termo aditivo de forma direta.
            </p>
          </div>
          <button
            onClick={onStartSwap}
            className="mt-6 flex items-center justify-between w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <span>Substituir Veículo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline & Actions History */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-extrabold text-primary font-geist flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-4 h-4 text-outline" />
          <span>Linha do Tempo de Operações Recentes</span>
        </h3>
        <div className="space-y-4">
          {recentActivities.slice().reverse().map((act) => (
            <div key={act.id} className="flex gap-4 items-start border-l-2 border-outline-variant pl-4 pb-3 last:pb-0 relative">
              <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary-fixed border border-white" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-primary">{act.title}</p>
                  <span className="text-[10px] text-outline font-mono">{new Date(act.createdAt || Date.now()).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{act.description}</p>
                <p className="text-[9px] text-outline mt-1">Realizado por: {act.createdBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
