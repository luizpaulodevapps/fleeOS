"use client";

import React, { useMemo } from "react";
import { Briefcase, Plus, Edit2, Percent, Trash2, Tag, Gift } from "lucide-react";
import { PackageFormState, ExemptionFormState, PromotionFormState } from "../_lib/types";

interface PackagesTabProps {
  packages: any[];
  exemptions: any[];
  promotions: any[];
  drivers: any[];
  contracts: any[];
  vehicles: any[];
  categories: any[];
  operationTypes: any[];
  selectedOperationFilter: string;

  isPkgModalOpen: boolean;
  setIsPkgModalOpen: (open: boolean) => void;
  editingPkg: any | null;
  setEditingPkg: (pkg: any | null) => void;
  pkgForm: PackageFormState;
  setPkgForm: React.Dispatch<React.SetStateAction<PackageFormState>>;

  isExModalOpen: boolean;
  setIsExModalOpen: (open: boolean) => void;
  editingEx: any | null;
  setEditingEx: (ex: any | null) => void;
  exForm: ExemptionFormState;
  setExForm: React.Dispatch<React.SetStateAction<ExemptionFormState>>;
  handleSaveExemption: (e: React.FormEvent) => void;
  handleDeleteExemption: (id: string) => void;

  isPromoModalOpen: boolean;
  setIsPromoModalOpen: (open: boolean) => void;
  editingPromo: any | null;
  setEditingPromo: (promo: any | null) => void;
  promoForm: PromotionFormState;
  setPromoForm: React.Dispatch<React.SetStateAction<PromotionFormState>>;
  handleSavePromo: (e: React.FormEvent) => void;
  handleDeletePromo: (id: string) => void;

  handleSavePackage: (e: React.FormEvent) => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  packages,
  exemptions,
  promotions,
  drivers,
  contracts,
  vehicles,
  categories,
  operationTypes,
  selectedOperationFilter,
  isPkgModalOpen,
  setIsPkgModalOpen,
  editingPkg,
  setEditingPkg,
  pkgForm,
  setPkgForm,
  isExModalOpen,
  setIsExModalOpen,
  editingEx,
  setEditingEx,
  exForm,
  setExForm,
  handleSaveExemption,
  handleDeleteExemption,
  isPromoModalOpen,
  setIsPromoModalOpen,
  editingPromo,
  setEditingPromo,
  promoForm,
  setPromoForm,
  handleSavePromo,
  handleDeletePromo,
  handleSavePackage
}) => {

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      if (!selectedOperationFilter) return true;
      return pkg.operationTypeId === selectedOperationFilter;
    });
  }, [packages, selectedOperationFilter]);

  // Target options helper based on selected target type in Exemption modal
  const targetOptions = useMemo(() => {
    if (exForm.targetType === "driver") {
      return drivers.map(d => ({ id: d.id, label: d.name }));
    }
    if (exForm.targetType === "contract") {
      return contracts.map(c => {
        const d = drivers.find(drv => drv.id === c.driverId);
        const v = vehicles.find(veh => veh.id === c.vehicleId);
        return { id: c.id, label: `${d?.name || "Sem Nome"} - ${v?.plate || c.vehicleId}` };
      });
    }
    if (exForm.targetType === "vehicle") {
      return vehicles.map(v => ({ id: v.id, label: `${v.brand} ${v.model} (${v.plate})` }));
    }
    if (exForm.targetType === "category") {
      return categories.map(c => ({ id: c.id, label: c.name }));
    }
    return [];
  }, [exForm.targetType, drivers, contracts, vehicles, categories]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Operational Packages */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-outline-variant pb-2">
          <div>
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1.5">
              <Briefcase className="w-4.5 h-4.5 text-outline" />
              <span>Pacotes Operacionais de Adicionais</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant">Franquias de quilometragem e opcionais vinculados a cada plano.</p>
          </div>
          <button
            onClick={() => {
              setEditingPkg(null);
              setPkgForm({
                name: "",
                pricingCategoryId: categories[0]?.id || "",
                includedKm: 250,
                extraKmPrice: 1.50,
                includedServicesText: "Seguro, Suporte 24h",
                allowReserveVehicle: true,
                roadsideAssistance: true,
                operationTypeId: selectedOperationFilter || operationTypes[0]?.id || ""
              });
              setIsPkgModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Pacote</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPackages.length === 0 ? (
            <div className="md:col-span-2 p-8 text-center border border-outline-variant rounded-xl bg-slate-50/50 text-on-surface-variant text-xs italic">
              Nenhum pacote cadastrado para esta operação.
            </div>
          ) : (
            filteredPackages.map(pkg => {
              const cat = categories.find(c => c.id === pkg.pricingCategoryId);
              const op = operationTypes.find(o => o.id === pkg.operationTypeId);
              return (
                <div key={pkg.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex justify-between items-start shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-primary">{pkg.name}</h4>
                      {cat && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">
                          {cat.name}
                        </span>
                      )}
                      {op && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-black rounded uppercase">
                          {op.name}
                        </span>
                      )}
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
                          roadsideAssistance: pkg.roadsideAssistance,
                          operationTypeId: pkg.operationTypeId || ""
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
            })
          )}
        </div>
      </div>

      {/* 2. Driver Personal Exemptions */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1.5">
              <Percent className="w-4.5 h-4.5 text-outline" />
              <span>Isenções & Descontos Diretos</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant">Vigência de abatimentos e descontos individuais associados a motoristas ou contratos.</p>
          </div>
          <button
            onClick={() => {
              setEditingEx(null);
              setExForm({
                name: "",
                targetType: "driver",
                targetId: drivers[0]?.id || "",
                exemptionType: "percentage",
                percentage: 10,
                value: 0,
                freeDaysCount: 0,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
              });
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
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Descrição</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Tipo Alvo</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Identificação</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Forma de Abatimento</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Vencimento</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {exemptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant italic">Nenhuma isenção ativa lançada.</td>
                </tr>
              ) : (
                exemptions.map(ex => {
                  let label = ex.targetId;
                  if (ex.targetType === "driver") {
                    label = drivers.find(d => d.id === ex.targetId)?.name || ex.targetId;
                  } else if (ex.targetType === "vehicle") {
                    const v = vehicles.find(veh => veh.id === ex.targetId);
                    label = v ? `${v.brand} ${v.model} (${v.plate})` : ex.targetId;
                  } else if (ex.targetType === "category") {
                    label = categories.find(c => c.id === ex.targetId)?.name || ex.targetId;
                  } else if (ex.targetType === "contract") {
                    const c = contracts.find(con => con.id === ex.targetId);
                    const d = drivers.find(drv => drv.id === c?.driverId);
                    label = c ? `Contrato: ${d?.name || "Sem Nome"}` : ex.targetId;
                  }

                  return (
                    <tr key={ex.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-primary">{ex.name || "Isenção Especial"}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500 uppercase text-[10px]">{ex.targetType}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{label}</td>
                      <td className="px-6 py-4 text-emerald-600 font-extrabold">
                        {ex.exemptionType === "percentage" ? `${ex.percentage}% OFF` : ex.exemptionType === "fixed" ? `R$ ${ex.value.toFixed(2)} desconto` : "Diárias grátis"}
                      </td>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Marketing Campaigns / Promotions */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1.5">
              <Tag className="w-4.5 h-4.5 text-outline" />
              <span>Campanhas de Marketing & Promoções</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant">Descontos automáticos associados a categorias de veículos por período.</p>
          </div>
          <button
            onClick={() => {
              setEditingPromo(null);
              setPromoForm({
                name: "",
                pricingCategoryId: categories[0]?.id || "",
                discountPercentage: 15,
                validFrom: new Date().toISOString().split("T")[0],
                validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                active: true
              });
              setIsPromoModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Campanha</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Nome da Promoção</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Categoria de Veículos</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Desconto (%)</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Vigência De</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Até</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Status</th>
                <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant italic">Nenhuma promoção de marketing ativa cadastrada.</td>
                </tr>
              ) : (
                promotions.map(promo => {
                  const cat = categories.find(c => c.id === promo.pricingCategoryId);
                  return (
                    <tr key={promo.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-primary">{promo.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{cat?.name || "Qualquer"}</td>
                      <td className="px-6 py-4 font-mono font-extrabold text-emerald-600">{promo.discountPercentage}% OFF</td>
                      <td className="px-6 py-4 font-mono">{new Date(promo.validFrom + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-4 font-mono">{new Date(promo.validTo + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-[4px] font-black text-[9px] uppercase ${
                          promo.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>{promo.active ? "Ativo" : "Pausada"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePromo(promo.id)}
                          className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Form Modal */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSavePackage} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">{editingPkg ? "Editar Pacote" : "Novo Pacote"}</h3>
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

              <div className="floating-label-group">
                <select
                  value={pkgForm.operationTypeId || ""}
                  onChange={(e) => setPkgForm(prev => ({ ...prev, operationTypeId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="">Selecione a operação...</option>
                  {operationTypes.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Tipo de Operação</label>
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
                  <label className="text-xs font-semibold text-outline">KM Incluso / semana</label>
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
                Gravar Pacote
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exemption Modal */}
      {isExModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveExemption} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">Vincular Isenção Comercial</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={exForm.name}
                  onChange={(e) => setExForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome da Isenção (ex: Desconto Fidelidade)</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="floating-label-group">
                  <select
                    value={exForm.targetType}
                    onChange={(e) => setExForm(prev => ({ ...prev, targetType: e.target.value as any, targetId: "" }))}
                    className="w-full pl-3 pr-3 text-xs"
                    required
                  >
                    <option value="driver">Motorista</option>
                    <option value="contract">Contrato Ativo</option>
                    <option value="vehicle">Veículo</option>
                    <option value="category">Categoria</option>
                  </select>
                  <label className="text-xs font-semibold text-outline">Alvo da Isenção</label>
                </div>

                <div className="floating-label-group">
                  <select
                    value={exForm.targetId}
                    onChange={(e) => setExForm(prev => ({ ...prev, targetId: e.target.value }))}
                    className="w-full pl-3 pr-3 text-xs"
                    required
                  >
                    <option value="">Selecione o alvo...</option>
                    {targetOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                  </select>
                  <label className="text-xs font-semibold text-outline">Alvo Específico</label>
                </div>
              </div>

              <div className="floating-label-group">
                <select
                  value={exForm.exemptionType}
                  onChange={(e) => setExForm(prev => ({ ...prev, exemptionType: e.target.value as any }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                  <option value="free_days">Dias Grátis (Sem cobrança)</option>
                </select>
                <label className="text-xs font-semibold text-outline">Tipo de Isenção</label>
              </div>

              {exForm.exemptionType === "percentage" && (
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
              )}

              {exForm.exemptionType === "fixed" && (
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={exForm.value}
                    onChange={(e) => setExForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Valor do Desconto R$ / dia</label>
                </div>
              )}

              {exForm.exemptionType === "free_days" && (
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={exForm.freeDaysCount}
                    onChange={(e) => setExForm(prev => ({ ...prev, freeDaysCount: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Quantidade de Dias Grátis</label>
                </div>
              )}

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
                Gravar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSavePromo} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">{editingPromo ? "Editar Campanha" : "Nova Campanha de Marketing"}</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome da Campanha (ex: Primeira Semana 50% OFF)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={promoForm.pricingCategoryId}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, pricingCategoryId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="">Aplica em qualquer categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Categoria Alvo</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="number"
                  value={promoForm.discountPercentage}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Percentual de Desconto (%)</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="floating-label-group">
                  <input
                    type="date"
                    value={promoForm.validFrom}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, validFrom: e.target.value }))}
                    className="w-full pl-3 pr-3 text-xs"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">De (Data Início)</label>
                </div>

                <div className="floating-label-group">
                  <input
                    type="date"
                    value={promoForm.validTo}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, validTo: e.target.value }))}
                    className="w-full pl-3 pr-3 text-xs"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Até (Data Fim)</label>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={promoForm.active}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary"
                />
                <span className="font-semibold text-slate-700 text-[10px]">Campanha Ativa e Publicada</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPromoModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Publicar Campanha
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
