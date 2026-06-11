"use client";

import React from "react";

interface AuditLogsSettingsProps {
  filteredAuditLogs: any[];
  auditSearchTerm: string;
  setAuditSearchTerm: (term: string) => void;
  setSelectedAuditLog: (log: any) => void;
}

export function AuditLogsSettings({
  filteredAuditLogs,
  auditSearchTerm,
  setAuditSearchTerm,
  setSelectedAuditLog
}: AuditLogsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-primary font-geist">Trilha de Auditoria</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Histórico completo de alterações realizadas na aplicação por data e hora.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Filtrar por operador, ação..."
            value={auditSearchTerm}
            onChange={(e) => setAuditSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface focus:border-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-outline-variant rounded-xl max-h-[50vh] bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold text-outline">Data/Hora</th>
              <th className="px-4 py-3 font-semibold text-outline">Operador</th>
              <th className="px-4 py-3 font-semibold text-outline">Ação Realizada</th>
              <th className="px-4 py-3 font-semibold text-outline">Coleção</th>
              <th className="px-4 py-3 font-semibold text-outline text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {filteredAuditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-outline italic">Nenhum log encontrado.</td>
              </tr>
            ) : (
              filteredAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-on-surface-variant font-mono text-[10px]">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">{log.userName}</td>
                  <td className="px-4 py-3 text-primary max-w-xs truncate" title={log.action}>
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant font-mono text-[10px]">{log.entityType}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedAuditLog(log)}
                      className="px-2.5 py-1.5 rounded bg-surface-container border border-outline-variant font-bold hover:bg-surface-container-high transition-all text-[10px]"
                    >
                      Inspecionar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
