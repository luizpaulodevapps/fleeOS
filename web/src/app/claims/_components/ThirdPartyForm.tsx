"use client";

import React, { useState } from "react";
import { TpForm } from "../_lib/types";
import { User, Phone, Clipboard, Building, ShieldCheck } from "lucide-react";

interface ThirdPartyFormProps {
  initialValue: TpForm;
  onSave: (form: TpForm) => Promise<void>;
  readOnly?: boolean;
}

export function ThirdPartyForm({ initialValue, onSave, readOnly = false }: ThirdPartyFormProps) {
  const [form, setForm] = useState<TpForm>({
    name: initialValue.name || "",
    cpf: initialValue.cpf || "",
    phone: initialValue.phone || "",
    plate: initialValue.plate || "",
    vehicle: initialValue.vehicle || "",
    insurer: initialValue.insurer || "",
    policyNumber: initialValue.policyNumber || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      <div className="flex items-center space-x-2 border-b border-outline-variant pb-3">
        <User className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
            Terceiros Envolvidos na Ocorrência
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            Registre os dados de contato, veículo e seguradora do terceiro para acionamento de franquia ou recuperação financeira.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Personal Details */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>Dados Pessoais do Condutor</span>
          </p>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              required={!readOnly}
              disabled={readOnly}
              placeholder="Ex: Carlos Eduardo de Souza"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                CPF do Terceiro
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Celular / Contato
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-outline">
                  <Phone className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="(11) 98888-7777"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Insurer details */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline flex items-center gap-1">
            <Clipboard className="w-3.5 h-3.5" />
            <span>Dados do Veículo e Apólice</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Modelo do Veículo
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Ex: Chevrolet Onix"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Placa
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="ABC1D23"
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Seguradora
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-outline">
                  <Building className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="Ex: Porto Seguro"
                  value={form.insurer}
                  onChange={(e) => setForm({ ...form, insurer: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Número do Sinistro / Apólice
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Apólice do Terceiro"
                value={form.policyNumber || ""}
                onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
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
            <ShieldCheck className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Salvar Dados do Terceiro"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
