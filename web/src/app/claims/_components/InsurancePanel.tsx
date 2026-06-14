"use client";

import React, { useState, useEffect } from "react";
import { ClaimInsurance } from "../_lib/types";
import { ShieldCheck, Phone, Calendar, DollarSign, RefreshCw } from "lucide-react";

interface InsurancePanelProps {
  initialValue: ClaimInsurance | null;
  onSave: (form: ClaimInsurance) => Promise<void>;
  readOnly?: boolean;
}

export function InsurancePanel({ initialValue, onSave, readOnly = false }: InsurancePanelProps) {
  const [form, setForm] = useState<ClaimInsurance>({
    claimId: initialValue?.claimId || "",
    insuranceCompany: "",
    policyNumber: "",
    claimNumber: "",
    adjusterName: "",
    adjusterPhone: "",
    deductibleAmount: 0,
    approvedAmount: 0,
    deniedAmount: 0,
    expectedPaymentDate: "",
    receivedAmount: 0,
    receivedDate: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setForm({
        claimId: initialValue.claimId || "",
        insuranceCompany: initialValue.insuranceCompany || "",
        policyNumber: initialValue.policyNumber || "",
        claimNumber: initialValue.claimNumber || "",
        adjusterName: initialValue.adjusterName || "",
        adjusterPhone: initialValue.adjusterPhone || "",
        deductibleAmount: Number(initialValue.deductibleAmount || 0),
        approvedAmount: Number(initialValue.approvedAmount || 0),
        deniedAmount: Number(initialValue.deniedAmount || 0),
        expectedPaymentDate: initialValue.expectedPaymentDate || "",
        receivedAmount: Number(initialValue.receivedAmount || 0),
        receivedDate: initialValue.receivedDate || ""
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

  const balanceDue = Math.max(0, form.approvedAmount - form.receivedAmount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      <div className="flex items-center space-x-2 border-b border-outline-variant pb-3">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
            Painel da Seguradora & Franquia
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            Gerencie o acionamento da apólice de seguro, reguladores envolvidos, valores aprovados, negados e pagamentos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI: Deductible */}
        <div className="bg-slate-50 border p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-outline uppercase font-bold">Valor da Franquia</span>
          <p className="text-xl font-black text-primary">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(form.deductibleAmount)}
          </p>
          <span className="text-[8px] text-on-surface-variant block font-mono">Coparticipação da locadora</span>
        </div>

        {/* KPI: Insurance Approved */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-emerald-700 uppercase font-bold">Aprovado pela Seguradora</span>
          <p className="text-xl font-black text-emerald-600">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(form.approvedAmount)}
          </p>
          <span className="text-[8px] text-emerald-700 block font-mono">
            Exclui valor da franquia
          </span>
        </div>

        {/* KPI: Pending Balance */}
        <div className={`border p-4 rounded-xl text-center space-y-1 ${balanceDue > 0 ? "bg-amber-500/5 border-amber-500/20 text-amber-700" : "bg-slate-50 text-outline"}`}>
          <span className="text-[10px] uppercase font-bold">Saldo a Receber</span>
          <p className="text-xl font-black">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balanceDue)}
          </p>
          <span className="text-[8px] block font-mono">Aguardando liquidação</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Insurer and policy info */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline">Dados do Sinistro & Apólice</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Seguradora Credenciada
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Ex: Allianz Seguros"
                value={form.insuranceCompany}
                onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Número da Apólice
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Ex: AP-0992388"
                value={form.policyNumber}
                onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Nº Sinistro na Seguradora
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Nº gerado pela Cia"
                value={form.claimNumber}
                onChange={(e) => setForm({ ...form, claimNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Franquia / Coparticipação (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.deductibleAmount}
                onChange={(e) => setForm({ ...form, deductibleAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Nome do Regulador / Perito
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Ex: Pedro Henrique"
                value={form.adjusterName}
                onChange={(e) => setForm({ ...form, adjusterName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Contato do Perito
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-outline">
                  <Phone className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="(11) 97777-6666"
                  value={form.adjusterPhone}
                  onChange={(e) => setForm({ ...form, adjusterPhone: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Claim financial breakdown */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline">Valores Regulados & Pagamentos</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Valor Aprovado (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.approvedAmount}
                onChange={(e) => setForm({ ...form, approvedAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Valor Negado / Glosa (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.deniedAmount}
                onChange={(e) => setForm({ ...form, deniedAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Previsão de Pagamento
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-outline">
                  <Calendar className="w-3 h-3" />
                </span>
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.expectedPaymentDate}
                  onChange={(e) => setForm({ ...form, expectedPaymentDate: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Valor Pago / Recebido (R$)
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.receivedAmount}
                onChange={(e) => setForm({ ...form, receivedAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Data do Recebimento
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={form.receivedDate}
              onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
            />
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
            <RefreshCw className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Salvar Configuração Securitária"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
