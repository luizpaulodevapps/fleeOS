"use client";

import React, { useState, useEffect } from "react";
import { ClaimFinancialRecovery } from "../_lib/types";
import { HandCoins, Scale, DollarSign, Calculator } from "lucide-react";

interface RecoveryPanelProps {
  initialValue: ClaimFinancialRecovery | null;
  onSave: (form: ClaimFinancialRecovery) => Promise<void>;
  readOnly?: boolean;
}

export function RecoveryPanel({ initialValue, onSave, readOnly = false }: RecoveryPanelProps) {
  const [form, setForm] = useState<ClaimFinancialRecovery>({
    claimId: initialValue?.claimId || "",
    repairCost: 0,
    deductible: 0,
    insuranceCoverage: 0,
    driverCharge: 0,
    thirdPartyCharge: 0,
    responsible: "Motorista"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setForm({
        claimId: initialValue.claimId || "",
        repairCost: Number(initialValue.repairCost || 0),
        deductible: Number(initialValue.deductible || 0),
        insuranceCoverage: Number(initialValue.insuranceCoverage || 0),
        driverCharge: Number(initialValue.driverCharge || 0),
        thirdPartyCharge: Number(initialValue.thirdPartyCharge || 0),
        responsible: initialValue.responsible || "Motorista"
      });
    }
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const totalAssigned = form.insuranceCoverage + form.driverCharge + form.thirdPartyCharge;
  const difference = form.repairCost - totalAssigned;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      <div className="flex items-center space-x-2 border-b border-outline-variant pb-3">
        <HandCoins className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
            Recuperação Financeira & Divisão de Custos
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            Distribua e acompanhe os custos totais do reparo do sinistro entre as partes responsáveis.
          </p>
        </div>
      </div>

      {/* Visual Splits Indicator */}
      <div className="bg-slate-50 border p-5 rounded-xl space-y-4">
        <p className="text-[10px] font-bold uppercase text-outline flex items-center gap-1">
          <Calculator className="w-3.5 h-3.5" />
          <span>Balanço de Rateio de Custos</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white border p-3 rounded-lg">
            <span className="text-[9px] text-outline uppercase font-bold block mb-1">Custo do Reparo</span>
            <span className="font-bold text-xs text-primary">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(form.repairCost)}
            </span>
          </div>

          <div className="bg-white border p-3 rounded-lg">
            <span className="text-[9px] text-emerald-700 uppercase font-bold block mb-1">Pago Seguradora</span>
            <span className="font-bold text-xs text-emerald-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(form.insuranceCoverage)}
            </span>
          </div>

          <div className="bg-white border p-3 rounded-lg">
            <span className="text-[9px] text-orange-700 uppercase font-bold block mb-1">Cobrado Condutor</span>
            <span className="font-bold text-xs text-orange-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(form.driverCharge)}
            </span>
          </div>

          <div className="bg-white border p-3 rounded-lg">
            <span className="text-[9px] text-blue-700 uppercase font-bold block mb-1">Cobrado Terceiro</span>
            <span className="font-bold text-xs text-blue-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(form.thirdPartyCharge)}
            </span>
          </div>
        </div>

        {/* Progress Bar of Splits */}
        {form.repairCost > 0 && (
          <div className="space-y-1">
            <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex font-mono text-[9px] font-bold text-white text-center">
              {form.insuranceCoverage > 0 && (
                <div
                  style={{ width: `${(form.insuranceCoverage / form.repairCost) * 100}%` }}
                  className="bg-emerald-500 flex items-center justify-center"
                  title="Seguradora"
                >
                  Seg.
                </div>
              )}
              {form.driverCharge > 0 && (
                <div
                  style={{ width: `${(form.driverCharge / form.repairCost) * 100}%` }}
                  className="bg-orange-500 flex items-center justify-center"
                  title="Motorista"
                >
                  Mot.
                </div>
              )}
              {form.thirdPartyCharge > 0 && (
                <div
                  style={{ width: `${(form.thirdPartyCharge / form.repairCost) * 100}%` }}
                  className="bg-blue-500 flex items-center justify-center"
                  title="Terceiro"
                >
                  Terc.
                </div>
              )}
              {difference > 0 && (
                <div
                  style={{ width: `${(difference / form.repairCost) * 100}%` }}
                  className="bg-red-500 flex items-center justify-center animate-pulse"
                  title="Diferença Pendente de Rateio"
                >
                  Falta
                </div>
              )}
            </div>
            {difference !== 0 && (
              <div className="flex justify-between items-center text-[10px] font-semibold">
                <span className={difference > 0 ? "text-red-500" : "text-emerald-600"}>
                  {difference > 0
                    ? `Diferença pendente de rateio: R$ ${difference.toFixed(2)}`
                    : `Soma excede o custo total em: R$ ${Math.abs(difference).toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Direct Costs inputs */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline">Custos do Evento</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Custo de Reparo Total (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.repairCost}
                onChange={(e) => setForm({ ...form, repairCost: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Franquia Despendida (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.deductible}
                onChange={(e) => setForm({ ...form, deductible: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Parte Responsável Principal
            </label>
            <select
              disabled={readOnly}
              value={form.responsible}
              onChange={(e) => setForm({ ...form, responsible: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            >
              <option value="Motorista">Motorista (Cobrança em Franquia)</option>
              <option value="Terceiro">Terceiro Envolvido (Acionamento Cia)</option>
              <option value="Seguradora">Seguradora da Locadora</option>
              <option value="Compartilhado">Rateio Compartilhado</option>
            </select>
          </div>
        </div>

        {/* Cost sharing amounts */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline">Rateio Financeiro</p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Seguradora (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.insuranceCoverage}
                onChange={(e) => setForm({ ...form, insuranceCoverage: Number(e.target.value) })}
                className="w-full px-2 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Condutor (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.driverCharge}
                onChange={(e) => setForm({ ...form, driverCharge: Number(e.target.value) })}
                className="w-full px-2 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Terceiro (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.thirdPartyCharge}
                onChange={(e) => setForm({ ...form, thirdPartyCharge: Number(e.target.value) })}
                className="w-full px-2 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="pt-2 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <Scale className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Salvar Rateio Financeiro"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
