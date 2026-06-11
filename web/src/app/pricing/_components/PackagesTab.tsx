"use client";

import React from "react";
import { Briefcase, Plus, Edit2, Percent, Trash2 } from "lucide-react";
import { PackageFormState, ExemptionFormState } from "../_lib/types";

interface PackagesTabProps {
  packages: any[];
  exemptions: any[];
  drivers: any[];
  categories: any[];
  isPkgModalOpen: boolean;
  setIsPkgModalOpen: (open: boolean) => void;
  editingPkg: any | null;
  setEditingPkg: (pkg: any | null) => void;
  pkgForm: PackageFormState;
  setPkgForm: React.Dispatch<React.SetStateAction<PackageFormState>>;
  isExModalOpen: boolean;
  setIsExModalOpen: (open: boolean) => void;
  exForm: ExemptionFormState;
  setExForm: React.Dispatch<React.SetStateAction<ExemptionFormState>>;
  handleSavePackage: (e: React.FormEvent) => void;
  handleSaveExemption: (e: React.FormEvent) => void;
  handleDeleteExemption: (id: string) => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  packages,
  exemptions,
  drivers,
  categories,
  isPkgModalOpen,
  setIsPkgModalOpen,
  editingPkg,
  setEditingPkg,
  pkgForm,
  setPkgForm,
  isExModalOpen,
  setIsExModalOpen,
  exForm,
  setExForm,
  handleSavePackage,
  handleSaveExemption,
  handleDeleteExemption
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Packages */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1">
              <Briefcase className="w-4.5 h-4.5 text-outline" />
              <span>Pacotes Operacionais de Locação</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant">Configure os pacotes que os motoristas podem contratar.</p>
          </div>
          <button
            onClick={() => {
              setEditingPkg(null);
              setPkgForm({ name: "", pricingCategoryId: categories[0]?.id || "", includedKm: 250, extraKmPrice: 1.50, includedServicesText: "Seguro, Suporte 24h", allowReserveVehicle: true, roadsideAssistance: true });
              setIsPkgModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Pacote</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map(pkg => {
            const cat = categories.find(c => c.id === pkg.pricingCategoryId);
            return (
              <div key={pkg.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-primary">{pkg.name}</h4>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-black rounded uppercase">
                      {cat?.name}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600">
                    <p>🔹 Franquia de KM: <strong className="font-bold text-slate-800">{pkg.includedKm} km / semana</strong></p>
                    <p>🔹 Preço KM Excedente: <strong className="font-bold text-slate-800">R$ {pkg.extraKmPrice.toFixed(2)} / km</strong></p>
                    <p>🔹 Serviços Inclusos: <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{pkg.includedServices?.join(", ")}</span></p>
                    <p>🔹 Carro Reserva: <strong className="font-bold text-slate-800">{pkg.allowReserveVehicle ? "Sim" : "Não"}</strong></p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditingPkg(pkg);
                      setPkgForm({
                        name: pkg.name,
                        pricingCategoryId: pkg.pricingCategoryId,
                        includedKm: pkg.includedKm,
                        extraKmPrice: pkg.extraKmPrice,
                        includedServicesText: pkg.includedServices?.join(", ") || "",
                        allowReserveVehicle: pkg.allowReserveVehicle,
                        roadsideAssistance: pkg.roadsideAssistance
                      });
                      setIsPkgModalOpen(true);
                    }}
                    className="p-1.5 bg-white border border-outline-variant hover:bg-slate-100 text-slate-700 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exemptions */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1">
              <Percent className="w-4.5 h-4.5 text-outline" />
              <span>Isenções & Descontos de Condutores</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant">Vincule descontos manuais ou regras de isenção temporárias a motoristas.</p>
          </div>
          <button
            onClick={() => {
              setExForm({ driverId: drivers[0]?.id || "", exemptionType: "percentage_discount", percentage: 10, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });
              setIsExModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aplicar Isenção</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Motorista</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Tipo Benefício</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Desconto / Valor</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Vigência Até</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {exemptions.map(ex => {
                const drv = drivers.find(d => d.id === ex.driverId);
                return (
                  <tr key={ex.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-primary">{drv?.name || "Motorista"}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-slate-600">{ex.exemptionType.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-emerald-600 font-extrabold">{ex.percentage}% de desconto</td>
                    <td className="px-6 py-4 font-mono">{new Date(ex.validUntil + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteExemption(ex.id)}
                        className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Modal */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSavePackage} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">Configurar Pacote</h3>
            <div className="space-y-3 text-xs">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome do Pacote (ex: Pacote Flex)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={pkgForm.pricingCategoryId}
                  onChange={(e) => setPkgForm(prev => ({ ...prev, pricingCategoryId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Categoria do Veículo</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={pkgForm.includedKm}
                    onChange={(e) => setPkgForm(prev => ({ ...prev, includedKm: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">KM Incluso</label>
                </div>

                <div className="floating-label-group">
                  <input
                    type="number"
                    value={pkgForm.extraKmPrice}
                    onChange={(e) => setPkgForm(prev => ({ ...prev, extraKmPrice: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    step="0.01"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Preço KM Extra (R$)</label>
                </div>
              </div>

              <div className="floating-label-group">
                <input
                  type="text"
                  value={pkgForm.includedServicesText}
                  onChange={(e) => setPkgForm(prev => ({ ...prev, includedServicesText: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Serviços Inclusos (separados por vírgula)</label>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkgForm.allowReserveVehicle}
                    onChange={(e) => setPkgForm(prev => ({ ...prev, allowReserveVehicle: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="font-semibold text-slate-700 text-[10px]">Carro Reserva</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkgForm.roadsideAssistance}
                    onChange={(e) => setPkgForm(prev => ({ ...prev, roadsideAssistance: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="font-semibold text-slate-700 text-[10px]">Guincho/Suporte</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPkgModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Gravar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exemption Config Modal */}
      {isExModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveExemption} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">Vincular Isenção a Motorista</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <select
                  value={exForm.driverId}
                  onChange={(e) => setExForm(prev => ({ ...prev, driverId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Selecione o Motorista</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="number"
                  value={exForm.percentage}
                  onChange={(e) => setExForm(prev => ({ ...prev, percentage: Number(e.target.value) }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Percentual de Desconto (%)</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="date"
                  value={exForm.validUntil}
                  onChange={(e) => setExForm(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Válido Até</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsExModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Aplicar Desconto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
