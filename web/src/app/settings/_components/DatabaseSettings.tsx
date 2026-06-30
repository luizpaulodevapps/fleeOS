"use client";

import React, { useRef } from "react";
import { AlertTriangle, Trash2, Download, Upload } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backup: Record<string, any> = {};
    const tables = [
      "vehicles", 
      "drivers", 
      "contracts", 
      "payments", 
      "maintenance", 
      "vehicle_assignments", 
      "regulatory_processes", 
      "permits", 
      "taxi_points", 
      "regulatory_dispatchers"
    ];
    tables.forEach(table => {
      const data = localStorage.getItem(`db_seed_${table}`) || localStorage.getItem(table);
      if (data) {
        try {
          backup[table] = JSON.parse(data);
        } catch (e) {
          console.error("Erro ao ler tabela para backup:", table, e);
        }
      }
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleetos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        Object.keys(backup).forEach(key => {
          localStorage.setItem(`db_seed_${key}`, JSON.stringify(backup[key]));
          localStorage.setItem(key, JSON.stringify(backup[key]));
        });
        alert("Backup restaurado com sucesso! O sistema irá atualizar.");
        window.location.reload();
      } catch (err) {
        alert("Erro: Arquivo JSON de backup inválido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Banco de Dados e Sincronização</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Estatísticas físicas do banco de dados offline e controle de simulação.</p>
      </div>

      {/* Db statistics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60 shadow-xs">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.vehicles}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Veículos</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60 shadow-xs">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.drivers}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Motoristas</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60 shadow-xs">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.contracts}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Contratos</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60 shadow-xs">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.payments}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Faturas</p>
        </div>
        <div className="text-center bg-white p-3 rounded-lg border border-outline-variant/60 shadow-xs">
          <p className="text-2xl font-black text-primary font-geist">{dbStats.maintenance}</p>
          <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Oficina</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-outline-variant">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-xs text-amber-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Modo de Simulação Ativo</p>
            <p className="mt-0.5 leading-relaxed text-[11px]">Esta aplicação está rodando em modo Mock Local (armazenando dados inteiramente no navegador via LocalStorage). Modificações não afetam o banco de dados remoto enquanto as chaves de API não forem configuradas.</p>
          </div>
        </div>

        {/* JSON Backup & Restore Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col justify-between p-4 border border-outline-variant rounded-xl bg-white shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-primary">Exportar Backup Local</h4>
              <p className="text-[11px] text-on-surface-variant mt-1 mb-3">Baixe um snapshot completo de todas as tabelas em um único arquivo JSON para segurança.</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-750 text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95 w-full sm:w-fit"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          <div className="flex flex-col justify-between p-4 border border-outline-variant rounded-xl bg-white shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-primary">Restaurar do Arquivo</h4>
              <p className="text-[11px] text-on-surface-variant mt-1 mb-3">Importe um arquivo JSON de backup previamente exportado para sobrescrever o estado atual.</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all active:scale-95 w-full sm:w-fit"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Backup JSON</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-outline-variant rounded-xl bg-white shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-primary">Redefinir Dados Locais</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Apague todas as mudanças, novos veículos/motoristas e restaure os seeds padrão.</p>
          </div>
          <button
            type="button"
            onClick={handleResetDatabase}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-650 transition-all active:scale-95 flex-shrink-0 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Resetar LocalStorage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
