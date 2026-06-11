import React from "react";
import {
  Clock,
  Hammer,
  CheckCircle,
  TrendingUp,
  Search,
  ShieldAlert,
  History
} from "lucide-react";
import { Claim } from "../_lib/types";

interface ClaimsTableProps {
  claims: Claim[];
  filteredClaims: Claim[];
  activeClaimsCount: number;
  repairingClaimsCount: number;
  closedClaimsCount: number;
  totalDamageCost: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  severityFilter: string;
  setSeverityFilter: (s: string) => void;
  getDriverName: (id: string) => string;
  getVehiclePlate: (id: string) => string;
  onSelectClaim: (claim: Claim) => void;
}

// Status badge style helper
export function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    under_review: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    awaiting_budget: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    awaiting_approval: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    repairing: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    charged: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    closed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  };
  const labels: Record<string, string> = {
    open: "Aberto",
    under_review: "Em Investigação",
    awaiting_budget: "Aguardando Orçamento",
    awaiting_approval: "Aguardando Aprovação",
    repairing: "Em Reparo",
    charged: "Cobrado do Motorista",
    closed: "Encerrado"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

// Severity badge style helper
export function getSeverityBadge(severity: string) {
  const styles: Record<string, string> = {
    light: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    severe: "bg-red-500/10 text-red-500 border-red-500/20",
    total_loss: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  };
  const labels: Record<string, string> = {
    light: "Leve",
    medium: "Média",
    severe: "Grave",
    total_loss: "Perda Total"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[severity] || ""}`}>
      {labels[severity] || severity}
    </span>
  );
}

export function ClaimsTable({
  claims,
  filteredClaims,
  activeClaimsCount,
  repairingClaimsCount,
  closedClaimsCount,
  totalDamageCost,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  getDriverName,
  getVehiclePlate,
  onSelectClaim
}: ClaimsTableProps) {
  return (
    <div className="space-y-6">
      {/* Dashboard Metrics (Bento Box) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Sinistros Ativos</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-primary font-geist">{activeClaimsCount}</span>
            <span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span>Pendentes</span>
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Veículos em Oficina</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-primary font-geist">{repairingClaimsCount}</span>
            <span className="text-[9px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Hammer className="w-2.5 h-2.5 animate-pulse" />
              <span>Parados</span>
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Processos Concluídos</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-primary font-geist">{closedClaimsCount}</span>
            <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <CheckCircle className="w-2.5 h-2.5" />
              <span>Arquivados</span>
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Custo Total de Danos</p>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-black text-primary font-geist">R$ {totalDamageCost.toLocaleString("pt-BR")}</span>
            <span className="text-[9px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>Estimado</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Buscar por placa, motorista ou nº sinistro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Aberto</option>
              <option value="under_review">Em Investigação</option>
              <option value="awaiting_budget">Aguardando Orçamento</option>
              <option value="awaiting_approval">Aguardando Aprovação</option>
              <option value="repairing">Em Oficina</option>
              <option value="charged">Cobrado</option>
              <option value="closed">Encerrado</option>
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
            >
              <option value="all">Todas as Gravidades</option>
              <option value="light">Leve</option>
              <option value="medium">Média</option>
              <option value="severe">Grave</option>
              <option value="total_loss">Perda Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claim List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-outline-variant bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-primary text-xs uppercase tracking-wider">Histórico Geral de Sinistros Ativos</h3>
          </div>
          <span className="text-[10px] text-outline font-semibold">Mostrando {filteredClaims.length} registros</span>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-xs">
            <ShieldAlert className="w-12 h-12 text-outline mx-auto mb-4" />
            <p className="text-base font-semibold text-primary font-geist">Nenhum sinistro encontrado</p>
            <p className="text-sm mt-1">Abra uma nova ocorrência clicando no botão no topo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-outline-variant font-semibold text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Nº Sinistro</th>
                  <th className="px-6 py-4">Data Ocorrência</th>
                  <th className="px-6 py-4">Veículo / Motorista</th>
                  <th className="px-6 py-4">Severidade</th>
                  <th className="px-6 py-4">Local</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-on-surface">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      {claim.claimNumber}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(claim.occurrenceDate).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary">{getVehiclePlate(claim.vehicleId)}</p>
                      <p className="text-on-surface-variant text-[10px] mt-0.5">Condutor: {getDriverName(claim.driverId)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(claim.severity)}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">
                      {claim.location}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectClaim(claim)}
                        className="px-3 py-1.5 rounded font-bold text-xs bg-primary text-on-primary hover:opacity-90 transition-all"
                      >
                        Gerenciar Processo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
