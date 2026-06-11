"use client";

import React, { useState, useMemo } from "react";
import type { DocumentTemplate } from "../_lib/types";
import { buildVariableMap, resolveVariables } from "../_lib/engine";

type Props = {
  template: DocumentTemplate;
  contracts: any[];
  drivers: any[];
  vehicles: any[];
  company: any;
  currentUserName: string;
  onClose: () => void;
  onGenerate: (resolvedBody: string) => void;
};

export function GenerateDocumentModal({
  template,
  contracts,
  drivers,
  vehicles,
  company,
  currentUserName,
  onClose,
  onGenerate,
}: Props) {
  const [contractId, setContractId] = useState("");
  const [search, setSearch] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const activeContracts = contracts.filter((c) => c.status === "Ativo" || c.status === "Suspenso" || c.status === "Encerrado");

  const filteredContracts = useMemo(() => {
    const q = search.toLowerCase();
    return activeContracts.filter((c) => {
      const driver = drivers.find((d) => d.id === c.driverId);
      const vehicle = vehicles.find((v) => v.id === c.vehicleId);
      return (
        driver?.name?.toLowerCase().includes(q) ||
        vehicle?.plate?.toLowerCase().includes(q) ||
        vehicle?.brand?.toLowerCase().includes(q) ||
        vehicle?.model?.toLowerCase().includes(q)
      );
    });
  }, [activeContracts, search, drivers, vehicles]);

  const selectedContract = contracts.find((c) => c.id === contractId);
  const selectedDriver = drivers.find((d) => d.id === selectedContract?.driverId);
  const selectedVehicle = vehicles.find((v) => v.id === selectedContract?.vehicleId);

  const resolvedBody = useMemo(() => {
    if (!selectedContract) return template.body;
    const vars = buildVariableMap(selectedContract, selectedDriver, selectedVehicle, company, extras);
    return resolveVariables(template.body, vars);
  }, [selectedContract, selectedDriver, selectedVehicle, company, extras, template.body]);

  const hasUnresolved = resolvedBody.includes("⚠️[");

  const handleExtraChange = (key: string, value: string) => {
    setExtras((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px] text-primary">{template.icon}</span>
            <div>
              <h2 className="text-base font-black text-slate-900">{template.name}</h2>
              <p className="text-xs text-slate-500">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="p-7 space-y-6">
          {/* Step 1 — Select Contract */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Selecione o Contrato / Motorista
            </label>
            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por motorista, placa, modelo..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {filteredContracts.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">Nenhum contrato encontrado</div>
              ) : (
                filteredContracts.map((c) => {
                  const drv = drivers.find((d) => d.id === c.driverId);
                  const veh = vehicles.find((v) => v.id === c.vehicleId);
                  const isSelected = contractId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setContractId(c.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? "bg-primary/5 border-l-4 border-primary"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {drv?.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{drv?.name || "Motorista"}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {veh ? `${veh.brand} ${veh.model} • ${veh.plate}` : "Veículo não encontrado"}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        c.status === "Ativo" ? "bg-emerald-100 text-emerald-700" :
                        c.status === "Suspenso" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {c.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2 — Extra Fields */}
          {template.extraFields && template.extraFields.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Informações Adicionais
              </label>
              <div className="grid grid-cols-2 gap-4">
                {template.extraFields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={extras[field.key] || ""}
                        onChange={(e) => handleExtraChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={extras[field.key] || ""}
                        onChange={(e) => handleExtraChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                      >
                        <option value="">Selecione...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={extras[field.key] || ""}
                        onChange={(e) => handleExtraChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview toggle */}
          {selectedContract && (
            <div>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showPreview ? "expand_less" : "expand_more"}
                </span>
                {showPreview ? "Ocultar pré-visualização" : "Ver pré-visualização do documento"}
              </button>

              {showPreview && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {resolvedBody}
                  </pre>
                </div>
              )}

              {hasUnresolved && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  Existem variáveis não preenchidas no documento. Preencha os campos acima ou verifique os dados do motorista/veículo.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onGenerate(resolvedBody)}
            disabled={!selectedContract}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Gerar Documento
          </button>
        </div>
      </div>
    </div>
  );
}
