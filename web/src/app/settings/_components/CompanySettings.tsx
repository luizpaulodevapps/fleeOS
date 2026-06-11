"use client";

import React from "react";
import { Save, Lock } from "lucide-react";
import { CompanyForm } from "../_lib/types";

interface CompanySettingsProps {
  companyForm: CompanyForm;
  setCompanyForm: React.Dispatch<React.SetStateAction<CompanyForm>>;
  handleUpdateCompany: (e: React.FormEvent) => Promise<void>;
}

export function CompanySettings({
  companyForm,
  setCompanyForm,
  handleUpdateCompany
}: CompanySettingsProps) {
  return (
    <form onSubmit={handleUpdateCompany} className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Perfil da Organização</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Informações e detalhes fiscais para faturamento multi-tenant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Nome Fantasia</label>
          <input
            type="text"
            required
            value={companyForm.companyName}
            onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">CNPJ / Documento</label>
          <input
            type="text"
            required
            value={companyForm.document}
            onChange={(e) => setCompanyForm({ ...companyForm, document: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Telefone Comercial</label>
          <input
            type="text"
            required
            value={companyForm.phone}
            onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">E-mail Comercial</label>
          <input
            type="email"
            required
            value={companyForm.email}
            onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-outline" />
            <span>Plano Contratado</span>
          </label>
          <select
            disabled
            value={companyForm.plan}
            className="w-full px-4 py-2.5 bg-surface-container/60 border border-outline-variant rounded-lg text-xs outline-none text-on-surface-variant cursor-not-allowed"
          >
            <option value="Pro">Pro Plan (Até 50 veículos)</option>
            <option value="Enterprise">Enterprise Fleet Plan (Ilimitado)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-outline-variant">
        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </form>
  );
}
