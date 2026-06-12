"use client";

import React from "react";
import { History, User, Clock, TableProperties } from "lucide-react";

interface VersioningTabProps {
  tableVersions: any[];
  tables: any[];
}

export const VersioningTab: React.FC<VersioningTabProps> = ({
  tableVersions,
  tables
}) => {
  // Sort versions descending by creation date
  const sortedVersions = [...tableVersions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-primary font-geist">Versionamento de Tabelas</h3>
        <p className="text-[11px] text-on-surface-variant">
          Histórico e auditoria de alterações nas tabelas tarifárias do motor de precificação.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
        {sortedVersions.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-xs italic">
            Nenhum registro de alteração de tarifas encontrado.
          </div>
        ) : (
          <div className="relative border-l border-outline-variant pl-6 ml-4 space-y-6">
            {sortedVersions.map((ver, idx) => {
              const tbl = tables.find(t => t.id === ver.tableId);
              return (
                <div key={ver.id || idx} className="relative">
                  {/* Timeline circle icon */}
                  <span className="absolute -left-[35px] mt-1 p-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
                    <History className="w-3.5 h-3.5" />
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono font-black text-[9px] rounded uppercase flex items-center gap-1">
                        <TableProperties className="w-3 h-3" />
                        {tbl?.name || `Tabela: ${ver.tableId}`}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-black text-[9px] rounded">
                        Versão {ver.version}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 pt-1 leading-relaxed">
                      {ver.changeDescription}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-on-surface-variant pt-1 font-semibold">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-outline" />
                        <span>Alterado por: <strong>{ver.changedBy}</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-outline" />
                        <span>{new Date(ver.createdAt).toLocaleString("pt-BR")}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
