"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, HelpCircle } from "lucide-react";

export function BillingSettings() {
  const [activePlan, setActivePlan] = useState("Pro");

  const plans = [
    {
      name: "Starter",
      price: 149,
      limit: 10,
      infra: "Shared Pod, Shared Local DB, Standard Support",
      features: [
        "Gestão de até 10 veículos ativos",
        "Armazenamento local do navegador",
        "Vínculos e Prontuário básico",
        "Suporte em horário comercial (E-mail)"
      ]
    },
    {
      name: "Pro",
      price: 499,
      limit: 50,
      infra: "Dedicated Pod, Replica DB node, API Webhooks access",
      features: [
        "Gestão de até 50 veículos ativos",
        "Banco de dados relacional replicado",
        "Webhooks de sinistros e faturamento",
        "Integrações de Telemetria e GPS",
        "WhatsApp Gateway de notificações",
        "Suporte Prioritário (WhatsApp & E-mail)"
      ]
    },
    {
      name: "Enterprise",
      price: 999,
      limit: 150,
      infra: "Isolated K8s Nodes, High CPU/RAM, Dedicated DB Replica",
      features: [
        "Gestão de até 150 veículos ativos",
        "Instância de banco de dados isolada",
        "Webhooks em tempo real e de alto volume",
        "Multi-login com Auditoria Completa",
        "Histórico financeiro ilimitado",
        "SLA de Uptime 99.8% com canal dedicado"
      ]
    },
    {
      name: "Custom Infra SaaS",
      price: 2490,
      limit: 1000,
      infra: "Full isolated GCP/AWS container cluster, VPN, Custom Domain",
      features: [
        "Veículos e motoristas ilimitados",
        "Cluster Kubernetes dedicado (GCP/AWS)",
        "Rede isolada (VPC) e VPN corporativa",
        "Domínio customizado e SSL dedicado",
        "Acesso completo ao banco de dados Firestore",
        "Gerente de conta técnico dedicado"
      ]
    }
  ];

  return (
    <div className="space-y-6 text-xs text-slate-800">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Assinatura do FleetOS</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Consulte faturas de uso, limites de licença e compare os planos escalados de infraestrutura SaaS.</p>
      </div>

      {/* Pricing Tiers based on Infra */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(p => {
          const isActive = p.name === activePlan;
          return (
            <div 
              key={p.name} 
              className={`p-4 bg-white border rounded-2xl flex flex-col justify-between shadow-xs transition-all relative ${
                isActive 
                  ? "border-primary ring-2 ring-primary/10 bg-indigo-50/15" 
                  : "border-outline-variant hover:border-slate-350"
              }`}
            >
              {isActive && (
                <span className="absolute -top-2.5 left-4 text-[8px] bg-primary text-on-primary font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Plano Ativo
                </span>
              )}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 font-geist">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{p.infra}</p>
                </div>
                
                <div className="py-2 border-y border-slate-100">
                  <p className="text-xl font-black text-slate-950 font-geist">
                    R$ {p.price.toLocaleString("pt-BR")} 
                    <span className="text-[10px] text-slate-450 font-normal"> /mês</span>
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Limite: {p.limit} veículos</p>
                </div>

                <ul className="space-y-2 text-[10px] text-slate-650">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!isActive && (
                <button
                  onClick={() => {
                    setActivePlan(p.name);
                    alert(`Solicitação de alteração para o plano "${p.name}" enviada para a infraestrutura SaaS!`);
                  }}
                  className="mt-5 w-full h-8 bg-slate-900 hover:bg-slate-950 text-white rounded-lg font-bold text-[10px] transition-all"
                >
                  Alterar para este Plano
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
        {/* Active plan card details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Resumo da Assinatura</h4>
            <p className="leading-relaxed">Você está utilizando a infraestrutura do **Plano Pro (R$ 499/mês)**, ideal para operações com banco de dados replicado e telemetria ativa.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-end text-[10px]">
            <div>
              <p className="text-slate-450">Próxima Renovação</p>
              <p className="font-bold text-slate-800 mt-0.5">15/07/2026</p>
            </div>
            <strong className="text-emerald-700 font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SLA Regular
            </strong>
          </div>
        </div>

        {/* Billing history list */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Histórico de Cobranças</h4>
          <div className="border border-outline-variant rounded-xl overflow-hidden bg-white text-xs">
            <div className="grid grid-cols-4 bg-slate-50 p-3 font-semibold text-outline border-b border-outline-variant">
              <span>Vencimento</span>
              <span>Referência</span>
              <span>Valor BRL</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-outline-variant/60">
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="font-mono text-slate-550">15/06/2026</span>
                <span className="text-primary font-bold">Mensalidade Jun/26</span>
                <span className="font-mono font-semibold">R$ 499,00</span>
                <span className="text-right font-bold text-amber-700 bg-amber-50 rounded border border-amber-100 text-[10px] py-0.5 px-2 w-fit ml-auto">Aberto</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="font-mono text-slate-550">15/05/2026</span>
                <span className="text-primary font-bold">Mensalidade Mai/26</span>
                <span className="font-mono font-semibold">R$ 499,00</span>
                <span className="text-right font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-100 text-[10px] py-0.5 px-2 w-fit ml-auto">Pago</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="font-mono text-slate-550">15/04/2026</span>
                <span className="text-primary font-bold">Mensalidade Abr/26</span>
                <span className="font-mono font-semibold">R$ 499,00</span>
                <span className="text-right font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-100 text-[10px] py-0.5 px-2 w-fit ml-auto">Pago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
