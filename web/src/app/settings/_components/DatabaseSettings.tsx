"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DatabaseSettingsProps {
  dbStats: {
    vehicles: number;
    drivers: number;
    contracts: number;
    payments: number;
    maintenance: number;
  };
  handleResetDatabase: () => void;
}

export function DatabaseSettings({
  dbStats,
  handleResetDatabase
}: DatabaseSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Banco de Dados e Sincronização</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Estatísticas físicas do banco de dados offline e controle de simulação.</p>
      </div>

      {/* Db statistics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.vehicles}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Veículos</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.drivers}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Motoristas</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.contracts}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Contratos</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.payments}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Faturas</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.maintenance}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Oficina</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-outline-variant">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-xs text-amber-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Modo de Simulação Ativo</p>
            <p className="mt-0.5 leading-relaxed text-[11px]">Esta aplicação está rodando em modo Mock Local (armazenando dados inteiramente no navegador via LocalStorage). Modificações não afetam o Firestore real enquanto as chaves de API não forem configuradas.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-outline-variant rounded-xl">
          <div>
            <h4 className="text-xs font-bold text-primary">Redefinir Dados Locais</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Apague todas as mudanças, novos veículos/motoristas e restaure os seeds padrão.</p>
          </div>
          <button
            type="button"
            onClick={handleResetDatabase}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-650 transition-all active:scale-95 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Resetar LocalStorage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
