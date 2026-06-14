"use client";

import React, { useMemo } from "react";
import { Claim } from "../_lib/types";
import { 
  Shield, ShieldAlert, CheckCircle, Hammer, DollarSign, 
  Car, ChevronRight, TrendingUp, Calendar, Clock, Landmark, 
  Scale, Ban, BarChart3, AlertOctagon 
} from "lucide-react";

interface ClaimDashboardProps {
  claims: Claim[];
  activeClaimsCount: number;
  repairingClaimsCount: number;
  closedClaimsCount: number;
  totalDamageCost: number;
  getDriverName: (id: string) => string;
  getVehiclePlate: (id: string) => string;
  onSelectClaim: (claim: Claim) => void;
}

export function ClaimDashboard({
  claims,
  activeClaimsCount,
  repairingClaimsCount,
  closedClaimsCount,
  totalDamageCost,
  getDriverName,
  getVehiclePlate,
  onSelectClaim
}: ClaimDashboardProps) {
  
  // Calculate 7 Corporate KPIs
  const openClaimsCount = claims.filter(c => c.status !== "closed").length;
  
  // Mean Time to Repair (MTTR) simulation
  const mttrDays = useMemo(() => {
    return claims.length > 0 ? (4.8).toFixed(1) : "0.0";
  }, [claims]);

  // Financial Metrics Sum simulation
  const totalRecovered = useMemo(() => {
    return claims.length * 1800; // Mock recovered values from insurance/third parties
  }, [claims]);

  const totalDeductibles = useMemo(() => {
    return claims.length * 500; // Driver franchises received
  }, [claims]);

  const netLoss = useMemo(() => {
    return Math.max(0, totalDamageCost - totalRecovered - totalDeductibles);
  }, [totalDamageCost, totalRecovered, totalDeductibles]);

  const recoveryROI = useMemo(() => {
    if (totalDamageCost === 0) return "0%";
    return `${Math.round(((totalRecovered + totalDeductibles) / totalDamageCost) * 100)}%`;
  }, [totalDamageCost, totalRecovered, totalDeductibles]);

  const severityColor: Record<string, string> = {
    light: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    medium: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    severe: "bg-red-500/10 text-red-600 border-red-500/20",
    total_loss: "bg-rose-500/10 text-rose-600 border border-rose-500/20"
  };

  const severityLabel: Record<string, string> = {
    light: "Leve",
    medium: "Médio",
    severe: "Grave",
    total_loss: "P.T."
  };

  const statusMap: Record<string, string> = {
    open: "Aberto / Em Análise",
    repairing: "Em Oficina",
    charged: "Faturado / Cobrado",
    closed: "Encerrado / Assinado",
    under_review: "Aguardando Parecer",
    awaiting_approval: "Aguardando Diretoria"
  };

  return (
    <div className="space-y-6">
      {/* Premium Dashboard Headline Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Desempenho Geral e Controle de Risco</span>
          </p>
          <h2 className="text-lg font-bold text-primary font-geist">Resumo da Operação de Sinistros</h2>
          <p className="text-[11px] text-on-surface-variant max-w-xl">
            Acompanhe o ROI de recuperação, tempo médio de oficina (MTTR) e índice de sinistralidade de frotas ativas.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border font-bold text-xs shrink-0 text-slate-800">
          <span>ROI Geral de Recuperação:</span>
          <span className="text-emerald-600 font-extrabold text-sm font-mono">{recoveryROI}</span>
        </div>
      </div>

      {/* KPI Stats cards Grid (7 KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        
        {/* 1. Sinistros Abertos */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">Sinistros Abertos</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-primary font-mono">{openClaimsCount}</p>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Em andamento</span>
        </div>

        {/* 2. Sinistros Fechados */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">Concluídos</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-primary font-mono">{closedClaimsCount}</p>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Arquivados</span>
        </div>

        {/* 3. Tempo Médio Oficina (MTTR) */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">MTTR (Dias)</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-primary font-mono">{mttrDays}d</p>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Média de oficina</span>
        </div>

        {/* 4. Valor Recuperado */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">Valor Recuperado</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-sm font-black text-emerald-600 font-mono">
              R$ {totalRecovered.toLocaleString("pt-BR")}
            </p>
            <Landmark className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Seguradoras/Terceiros</span>
        </div>

        {/* 5. Franquias Recebidas */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">Franquias Cobradas</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-sm font-black text-primary font-mono">
              R$ {totalDeductibles.toLocaleString("pt-BR")}
            </p>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Conta Motorista</span>
        </div>

        {/* 6. Prejuízo Total Líquido */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">Prejuízo Líquido</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-sm font-black text-red-500 font-mono">
              R$ {netLoss.toLocaleString("pt-BR")}
            </p>
            <Scale className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Custo real locadora</span>
        </div>

        {/* 7. ROI de Recuperação */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-outline uppercase font-bold block">Eficiência ROI</span>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-emerald-600 font-mono">{recoveryROI}</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[8px] text-outline block mt-0.5">Retorno / Perdas</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Recent Active Claims List */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4.5 h-4.5 text-primary" />
              <span>Dossiês Digitais Recentes</span>
            </h3>
            <span className="text-[10px] text-outline font-semibold">Total: {claims.length}</span>
          </div>

          <div className="divide-y divide-outline-variant/60">
            {claims.length === 0 ? (
              <div className="text-center text-outline py-8 text-xs italic">Nenhum sinistro registrado no sistema.</div>
            ) : (
              claims.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectClaim(c)}
                  className="py-3 hover:bg-slate-50/50 cursor-pointer flex items-center justify-between group transition-colors px-2 rounded-lg"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary text-xs">{c.claimNumber}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${severityColor[c.severity]}`}>
                        {severityLabel[c.severity]}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-mono truncate max-w-[280px]">
                      {getVehiclePlate(c.vehicleId)}
                    </p>
                    <p className="text-[9px] text-outline truncate max-w-[280px]">
                      Condutor: {getDriverName(c.driverId)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[9px] text-on-surface-variant font-semibold">
                      {statusMap[c.status] || c.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Premium SVG chart and alerts */}
        <div className="space-y-6">
          
          {/* Hardware-accelerated SVG occurrence chart */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
            <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Gráfico Histórico de Sinistros</span>
            </p>

            <div className="w-full flex items-center justify-center py-2 bg-slate-50 border rounded-xl shadow-inner">
              <svg viewBox="0 0 280 120" className="w-full h-auto">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--md-sys-color-primary, #0f172a)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--md-sys-color-primary, #0f172a)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="20" y1="10" x2="260" y2="10" stroke="#e2e8f0" strokeDasharray="3" />
                <line x1="20" y1="50" x2="260" y2="50" stroke="#e2e8f0" strokeDasharray="3" />
                <line x1="20" y1="90" x2="260" y2="90" stroke="#e2e8f0" strokeDasharray="3" />

                {/* Filled Area */}
                <path
                  d="M 20 90 L 50 70 L 90 85 L 130 40 L 170 55 L 210 30 L 260 25 L 260 90 Z"
                  fill="url(#chartGrad)"
                />

                {/* Main Line */}
                <path
                  d="M 20 90 L 50 70 L 90 85 L 130 40 L 170 55 L 210 30 L 260 25"
                  fill="none"
                  stroke="var(--md-sys-color-primary, #0f172a)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dots on line */}
                <circle cx="20" cy="90" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />
                <circle cx="50" cy="70" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />
                <circle cx="90" cy="85" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />
                <circle cx="130" cy="40" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />
                <circle cx="170" cy="55" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />
                <circle cx="210" cy="30" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />
                <circle cx="260" cy="25" r="3.5" fill="#ffffff" stroke="var(--md-sys-color-primary, #0f172a)" strokeWidth="1.5" />

                {/* Labels */}
                <text x="20" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">JAN</text>
                <text x="50" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">FEV</text>
                <text x="90" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">MAR</text>
                <text x="130" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">ABR</text>
                <text x="170" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">MAI</text>
                <text x="210" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">JUN</text>
                <text x="260" y="105" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">JUL</text>
              </svg>
            </div>
          </div>

          {/* Quick Tips & Compliance alerts */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
            <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1">
              <AlertOctagon className="w-4 h-4 text-primary" />
              <span>Regras de Negócio & Compliance</span>
            </p>
            
            <div className="space-y-3 text-xs">
              <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl space-y-1 text-amber-800">
                <span className="font-bold block">Assinatura de Fechamento</span>
                <p className="text-[10px] leading-relaxed">
                  Quando o sinistro muda para status **Encerrado**, o dossiê congela e gera uma hash SHA-256 no log imutável de auditoria.
                </p>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-3.5 rounded-xl space-y-1 text-blue-800">
                <span className="font-bold block">Integração SSP SP</span>
                <p className="text-[10px] leading-relaxed">
                  Consulte os BOs pelo protocolo e CPF para liberação de cobertura securitária.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
