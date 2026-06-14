"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDashboardData } from "./_hooks/useDashboardData";
import { AttentionSection } from "./_components/AttentionSection";
import { ExecutiveBlock } from "./_components/ExecutiveBlock";
import { FinancialBlock } from "./_components/FinancialBlock";
import { OperationalBlock } from "./_components/OperationalBlock";
import { WorkshopBlock } from "./_components/WorkshopBlock";
import { ComplianceWidget } from "./_components/ComplianceWidget";
import { Clock, CheckCircle, AlertCircle, AlertOctagon, HelpCircle, X } from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const {
    vehicles,
    timeline,
    inventory,
    workOrders,
    cashierMovements,
    loading,
    calculations,
    groupedAlerts
  } = useDashboardData();

  // Simulated profile state for visualization
  const [simulatedProfile, setSimulatedProfile] = useState<string>("role-owner");

  // Push notifications state
  const [toasts, setToasts] = useState<{ id: string; title: string; desc: string; type: "info" | "warning" | "error" | "success" }[]>([]);

  // Initialize profile once user is loaded
  useEffect(() => {
    if (currentUser) {
      setSimulatedProfile(currentUser.roleId || "role-owner");
    }
  }, [currentUser]);

  // Calculate total fleet mileage for cost-per-km metrics
  const totalFleetMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);

  // Trigger toast notifications on profile change or load
  useEffect(() => {
    if (loading) return;

    setToasts([]);

    const newToasts: any[] = [];

    if (simulatedProfile === "role-owner") {
      newToasts.push({
        id: "owner-1",
        title: "Balanço Patrimonial",
        desc: `Patrimônio Líquido atual consolidado em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.patrimonioLiquido)}.`,
        type: "success"
      });
      if (calculations.inadimplencia > 0) {
        newToasts.push({
          id: "owner-2",
          title: "Aviso de Cobrança",
          desc: `Há faturas vencidas acumulando ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.inadimplencia)} em inadimplência.`,
          type: "error"
        });
      }
      newToasts.push({
        id: "owner-3",
        title: "Desempenho de Frota",
        desc: `Custo médio operacional por KM da frota calculado em R$ ${(calculations.totalMaintCosts / Math.max(1, totalFleetMileage)).toFixed(2)}.`,
        type: "info"
      });
    } else if (simulatedProfile === "role-financial") {
      if (!calculations.openCashier) {
        newToasts.push({
          id: "fin-1",
          title: "Caixa Fechado",
          desc: "Atenção: Não há nenhuma sessão de caixa operacional aberta no momento.",
          type: "warning"
        });
      } else {
        newToasts.push({
          id: "fin-1-open",
          title: "Caixa Operacional Ativo",
          desc: `Sessão aberta. Saldo atual do dia: R$ ${(calculations.openCashier.openingAmount + cashierMovements.reduce((sum: number, m: any) => sum + m.amount, 0)).toLocaleString()}`,
          type: "success"
        });
      }
      newToasts.push({
        id: "fin-2",
        title: "Projeção Financeira",
        desc: `Faturamento mensal contratado estimado em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.receitaContratada)}.`,
        type: "info"
      });
    } else if (simulatedProfile === "role-operational") {
      if (groupedAlerts.docs.length > 0) {
        newToasts.push({
          id: "op-1",
          title: "Vencimento de Documentos",
          desc: `Existem ${groupedAlerts.docs.length} documentos operacionais (CNH, seguro ou alvará) vencendo em até 30 dias.`,
          type: "warning"
        });
      }
      newToasts.push({
        id: "op-2",
        title: "Taxa de Ocupação",
        desc: `Frota rodando com taxa de ocupação ativa em ${calculations.occupancyRate.toFixed(1)}%.`,
        type: "success"
      });
    } else if (simulatedProfile === "role-workshop") {
      const lowStock = inventory.filter(i => i.currentQty < i.minQty).length;
      if (lowStock > 0) {
        newToasts.push({
          id: "work-1",
          title: "Estoque Crítico",
          desc: `Atenção: ${lowStock} itens do almoxarifado estão abaixo do estoque de segurança.`,
          type: "error"
        });
      }
      const activeWOs = workOrders.filter(w => w.status === "in_progress").length;
      newToasts.push({
        id: "work-2",
        title: "OS em Andamento",
        desc: `Existem ${activeWOs} ordens de serviço sendo executadas na oficina parceira.`,
        type: "info"
      });
    }

    newToasts.forEach((toast, idx) => {
      setTimeout(() => {
        setToasts(prev => {
          if (prev.find(t => t.id === toast.id)) return prev;
          return [...prev, toast];
        });

        // Auto remove after 6 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 6000);
      }, idx * 1200);
    });
  }, [simulatedProfile, loading, calculations, groupedAlerts, cashierMovements, inventory, workOrders, totalFleetMileage]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant text-xs font-semibold tracking-wide">Carregando painel analítico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-stack-lg max-w-[1450px] mx-auto">
      
      {/* Header and Visual Profile Simulator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 border border-outline-variant rounded-2xl shadow-sm">
        <div>
          <h2 className="font-geist text-headline-md font-semibold text-primary flex items-center gap-2">
            <span>Fleet Command Center</span>
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary uppercase px-2 py-0.5 rounded font-black tracking-widest font-mono">v4.0</span>
          </h2>
          <p className="text-on-surface-variant text-xs mt-1">Visão geral unificada de operações, faturamento, patrimônio e ROI.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider font-mono">Simular Perfil:</span>
            <select
              value={simulatedProfile}
              onChange={(e) => setSimulatedProfile(e.target.value)}
              className="bg-surface-container-low border border-outline-variant text-xs font-bold px-3 py-1.5 rounded-lg text-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="role-owner">Proprietário (BI & Patrimônio)</option>
              <option value="role-financial">Financeiro & Caixa</option>
              <option value="role-operational">Operador & Vínculos</option>
              <option value="role-workshop">Oficina Parceira & OS</option>
            </select>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* 🚨 BLOCO 1: ATENÇÃO HOJE (ALERTAS DE ALTO IMPACTO) */}
      <AttentionSection alerts={calculations.attentionAlerts} />

      {/* Compliance Statistics Cockpit */}
      {(simulatedProfile === "role-owner" || simulatedProfile === "role-operational") && (
        <ComplianceWidget calculations={calculations} />
      )}

      {/* ==========================================
          DYNAMIC ROLE-BASED DASHBOARD BLOCKS
         ========================================== */}
      
      {/* View 1: Proprietário (Nível 3 - BI, ROI & Patrimônio) */}
      {simulatedProfile === "role-owner" && (
        <ExecutiveBlock 
          calculations={calculations} 
          totalMileage={totalFleetMileage} 
        />
      )}

      {/* View 2: Financeiro (Nível 2 - Fluxo de Caixa, Faturamento & Custos) */}
      {simulatedProfile === "role-financial" && (
        <FinancialBlock 
          calculations={calculations} 
          cashierMovements={cashierMovements} 
        />
      )}

      {/* View 3: Operador (Nível 1 - Atalhos de Central de Vínculos & Telemetria) */}
      {simulatedProfile === "role-operational" && (
        <OperationalBlock 
          vehicles={vehicles} 
          groupedAlerts={groupedAlerts} 
        />
      )}

      {/* View 4: Oficina & Almoxarifado (Parceiros e Manutenções) */}
      {simulatedProfile === "role-workshop" && (
        <WorkshopBlock 
          calculations={calculations} 
          inventory={inventory} 
          workOrders={workOrders} 
          vehicles={vehicles} 
        />
      )}

      {/* ==========================================
          SHARED DYNAMIC BOTTOM TIMELINE
         ========================================== */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-stack-md border-b border-outline-variant flex justify-between items-center bg-white">
          <h3 className="font-geist text-sm font-bold text-primary flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-outline" />
            Atividade Recente e Logs de Audit (Histórico de Eventos)
          </h3>
          <span className="text-[9px] bg-slate-100 text-outline px-2 py-0.5 rounded font-black font-mono">Últimas Atualizações</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low/50">
              <tr className="border-b border-outline-variant">
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Horário</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Evento</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {timeline.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">Nenhum evento registrado no histórico.</td>
                </tr>
              ) : (
                timeline.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-on-surface-variant">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {log.title}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {log.createdBy || "Sistema"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dynamic Push Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="p-4 rounded-2xl border shadow-2xl flex gap-3 items-start pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 bg-white"
            style={{
              borderColor: toast.type === "success" ? "#bbf7d0" : toast.type === "warning" ? "#fde68a" : toast.type === "error" ? "#fecdd3" : "#bfdbfe",
              backgroundColor: toast.type === "success" ? "#f0fdf4" : toast.type === "warning" ? "#fffbeb" : toast.type === "error" ? "#fff5f5" : "#eff6ff"
            }}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              {toast.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-600" />}
              {toast.type === "error" && <AlertOctagon className="w-4 h-4 text-rose-600" />}
              {toast.type === "info" && <HelpCircle className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-primary">{toast.title}</h4>
              <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">{toast.desc}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-primary hover:text-black p-0.5 rounded transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
