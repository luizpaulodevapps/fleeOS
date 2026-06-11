"use client";

import {
  FileText, Plus, Search, History, User, Car, Calendar,
  CheckCircle, DollarSign, CreditCard, AlertTriangle, Edit2,
  PauseCircle, RotateCcw, Ban, ChevronRight,
} from "lucide-react";
import { STATUS_STYLES } from "../_lib/constants";
import { formatDate } from "../_lib/utils";
import { getDriverName, getVehicleInfo } from "../_lib/helpers";
import type { ContractMetrics } from "../_lib/types";

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filteredContracts: any[];
  loading: boolean;
  metrics: ContractMetrics;
  receipts: any[];
  promissories: any[];
  checklists: any[];
  drivers: any[];
  vehicles: any[];
  can: (action: string, resource?: any) => boolean;
  onOpenDetail: (contract: any) => void;
  onEdit: (contract: any) => void;
  onSuspend: (contract: any) => void;
  onClose: (contract: any) => void;
  onReactivate: (contract: any) => void;
  onRescind: (contract: any) => void;
  onNewContract: () => void;
};

export function ContractsListSection({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filteredContracts,
  loading,
  metrics,
  receipts,
  promissories,
  checklists,
  drivers,
  vehicles,
  can,
  onOpenDetail,
  onEdit,
  onSuspend,
  onClose,
  onReactivate,
  onRescind,
  onNewContract,
}: Props) {
  return (
    <>
{/* Breadcrumbs */}
<nav className="flex items-center gap-2 text-on-surface-variant text-xs">
  <span>Operações</span>
  <ChevronRight className="w-3 h-3" />
  <span className="text-primary font-bold">Contratos & Documentos</span>
</nav>

{/* Header */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
  <div>
    <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
      <FileText className="w-8 h-8 text-primary" />
      <span>ERP Contratos & Assinaturas</span>
    </h1>
    <p className="text-on-surface-variant text-xs mt-1">
      CRUD completo de contratos, recibos, promissórias, checklists formais e aditivos.
    </p>
  </div>
  {can("contracts.create") && (
    <button
      onClick={() => { onNewContract(); }}
      className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
    >
      <Plus className="w-4 h-4" />
      <span>Novo Contrato</span>
    </button>
  )}
</div>

{/* Metrics Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {[
    { label: "Contratos Ativos", value: metrics.active, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/8" },
    { label: "Receita Mensal Prev.", value: `R$ ${metrics.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/8" },
    { label: "Promissórias Pend.", value: metrics.pendingProm, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-500/8" },
    { label: "Contratos a Vencer (30d)", value: metrics.expiring, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-500/8" },
  ].map((m, i) => (
    <div key={i} className={`${m.bg} border border-outline-variant rounded-xl p-4 flex items-center gap-3`}>
      <m.icon className={`w-7 h-7 ${m.color}`} />
      <div>
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">{m.label}</p>
        <p className={`text-xl font-black font-mono ${m.color}`}>{m.value}</p>
      </div>
    </div>
  ))}
</div>

{/* Filters + Search */}
<div className="flex flex-wrap gap-3 items-center">
  <div className="relative flex-1 min-w-[200px] max-w-sm">
    <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
    <input type="text" placeholder="Motorista ou placa..." value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
    />
  </div>
  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
    className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface appearance-none">
    {["Todos","Ativo","Suspenso","Encerrado","Rescindido","Rascunho"].map(s => <option key={s} value={s}>{s}</option>)}
  </select>
  <select value={filterType} onChange={e => setFilterType(e.target.value)}
    className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface appearance-none">
    {["Todos","Locação","Comodato","Substituição","Temporário"].map(t => <option key={t} value={t}>{t}</option>)}
  </select>
  <span className="text-xs text-on-surface-variant">{filteredContracts.length} resultado(s)</span>
</div>

{/* Contracts Table */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
  <div className="p-4 border-b border-outline-variant bg-slate-50 flex items-center space-x-2">
    <History className="w-4 h-4 text-primary" />
    <h3 className="font-bold text-primary text-xs uppercase tracking-wider">Histórico de Contratos</h3>
  </div>

  {loading ? (
    <div className="p-12 text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-on-surface-variant text-xs">Carregando...</p>
    </div>
  ) : filteredContracts.length === 0 ? (
    <div className="p-12 text-center text-on-surface-variant">
      <FileText className="w-12 h-12 text-outline mx-auto mb-3" />
      <p className="font-semibold text-primary">Nenhum contrato encontrado</p>
      <p className="text-xs mt-1">Crie um contrato ou ajuste os filtros.</p>
    </div>
  ) : (
    <div className="overflow-x-auto text-xs">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-outline-variant font-semibold text-on-surface-variant">
          <tr>
            <th className="px-5 py-3">Contrato</th>
            <th className="px-5 py-3">Partes</th>
            <th className="px-5 py-3">Vigência</th>
            <th className="px-5 py-3">Valores</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Docs</th>
            <th className="px-5 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/50 text-on-surface">
          {filteredContracts.slice().reverse().map((contract) => {
            const cReceipts    = receipts.filter(r => r.contractId === contract.id);
            const cPromissories = promissories.filter(p => p.contractId === contract.id);
            const cChecklists  = checklists.filter(c => c.contractId === contract.id);
            return (
              <tr key={contract.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-mono font-bold text-primary">#{contract.id.substring(0, 8)}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-slate-100 border border-slate-200 font-bold mt-1 uppercase">
                    {contract.type || "Locação"}
                  </span>
                  {contract.signatureToken && (
                    <p className="text-[9px] font-mono text-emerald-600 mt-0.5">✓ {contract.signatureToken}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <User className="w-3.5 h-3.5 text-outline" />
                    {getDriverName(drivers, contract.driverId)}
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant mt-0.5">
                    <Car className="w-3.5 h-3.5 text-outline" />
                    {getVehicleInfo(vehicles, contract.vehicleId)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <Calendar className="w-3.5 h-3.5 text-outline" />
                    <div>
                      <p>Início: {formatDate(contract.startDate)}</p>
                      <p className="mt-0.5">{contract.endDate ? `Fim: ${formatDate(contract.endDate)}` : "Sem término"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-primary">Dia: R$ {contract.dailyRate}</p>
                  <p className="text-on-surface-variant">Mês: R$ {contract.monthlyRate?.toFixed(0)}</p>
                  {contract.dailyProfileNameSnapshot && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-primary/8 text-primary font-semibold">{contract.dailyProfileNameSnapshot}</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[contract.status] || ""}`}>
                    {contract.status}
                  </span>
                  {contract.suspendReason && <p className="text-[9px] text-amber-600 mt-0.5 italic">{contract.suspendReason}</p>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5 text-[9px] font-semibold">
                    <span className={`px-1.5 py-0.5 rounded ${cReceipts.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                      📄 {cReceipts.length} recibo(s)
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${cPromissories.length > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}>
                      💳 {cPromissories.length} promissória(s)
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${cChecklists.length > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
                      ✅ {cChecklists.length} vistoria(s)
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => onOpenDetail(contract)}
                      className="px-2.5 py-1.5 rounded bg-surface-container border border-outline-variant text-primary font-bold hover:bg-surface-container-high transition-all">
                      Abrir
                    </button>
                    {can("contracts.edit", contract) && (
                      <button onClick={() => onEdit(contract)}
                        className="p-1.5 rounded border border-outline-variant text-primary hover:bg-slate-100" title="Editar contrato">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {contract.status === "Ativo" && can("contracts.edit") && (
                      <>
                        <button onClick={() => onSuspend(contract)}
                          className="p-1.5 rounded border border-amber-400/30 text-amber-600 hover:bg-amber-50" title="Suspender">
                          <PauseCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => { onClose(contract); }}
                          className="px-2.5 py-1.5 rounded text-white bg-red-500 font-bold text-[10px]">
                          Encerrar
                        </button>
                      </>
                    )}
                    {contract.status === "Suspenso" && can("contracts.edit") && (
                      <>
                        <button onClick={() => onReactivate(contract)}
                          className="p-1.5 rounded border border-emerald-400/30 text-emerald-600 hover:bg-emerald-50" title="Reativar">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRescind(contract)}
                          className="p-1.5 rounded border border-red-400/30 text-red-600 hover:bg-red-50" title="Rescindir">
                          <Ban className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>
    </>
  );
}
