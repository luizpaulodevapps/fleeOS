"use client";

import React from "react";
import { Car, X, AlertTriangle, CheckCircle } from "lucide-react";
import { SignaturePad } from "./SignaturePad";
import { DeliveryFormState } from "../_lib/types";

interface DeliveryWizardProps {
  delStep: number;
  setDelStep: React.Dispatch<React.SetStateAction<number>>;
  delForm: DeliveryFormState;
  setDelForm: React.Dispatch<React.SetStateAction<DeliveryFormState>>;
  drivers: any[];
  vehicles: any[];
  assignments: any[];
  tables: any[];
  packages: any[];
  billingProfiles: any[];
  dailyProfiles: any[];
  recentActivities: any[];
  openCashier: any;
  selectedDelDriver: any;
  selectedDelVehicle: any;
  selectedDelProfile: any;
  computedDailyRate: number;
  computedDailyProfileName: string;
  deliveryContractText: string;
  handleDelNext: () => void;
  handleDelPrev: () => void;
  submitDelivery: () => void;
  resetDelForm: () => void;
  setActiveWizard: (wizard: "delivery" | "return" | "swap" | null) => void;
}

export const DeliveryWizard: React.FC<DeliveryWizardProps> = ({
  delStep,
  setDelStep,
  delForm,
  setDelForm,
  drivers,
  vehicles,
  assignments,
  tables,
  packages,
  billingProfiles,
  dailyProfiles,
  openCashier,
  selectedDelDriver,
  selectedDelVehicle,
  selectedDelProfile,
  computedDailyRate,
  computedDailyProfileName,
  deliveryContractText,
  handleDelNext,
  handleDelPrev,
  submitDelivery,
  setActiveWizard
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-md overflow-hidden animate-fadeIn">
      {/* Header Progress Tracker */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Car className="w-6 h-6" />
            <span className="font-geist font-black tracking-tight text-lg">🚗 Entrega de Veículo</span>
          </div>
          <button
            onClick={() => {
              if (confirm("Deseja mesmo cancelar o processo de entrega? Todos os dados preenchidos serão perdidos.")) {
                setActiveWizard(null);
              }
            }}
            className="text-white hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Step Indicators */}
        <div className="grid grid-cols-8 gap-2 text-center text-[9px] font-black uppercase tracking-wider">
          {[
            { s: 1, name: "Motorista" },
            { s: 2, name: "Veículo" },
            { s: 3, name: "Contrato" },
            { s: 4, name: "Vistoria" },
            { s: 5, name: "Avarias" },
            { s: 6, name: "Assinatura" },
            { s: 7, name: "Financeiro" },
            { s: 8, name: "Revisão" }
          ].map(indicator => (
            <div
              key={indicator.s}
              className={`py-1 border-b-4 transition-all ${
                delStep === indicator.s
                  ? "border-white text-white font-black"
                  : delStep > indicator.s
                  ? "border-blue-300 text-blue-200"
                  : "border-blue-800 text-blue-800"
              }`}
            >
              {indicator.s}. {indicator.name}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content Body */}
      <div className="p-6 min-h-[400px]">
        {/* STEP 1: Selecionar Motorista */}
        {delStep === 1 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 1: Selecione o Motorista</h3>
            <p className="text-on-surface-variant text-xs">
              Selecione um motorista ativo cadastrado na plataforma para vinculação do veículo. O sistema fará validações automáticas de compliance.
            </p>

            <div className="floating-label-group">
              <select
                value={delForm.driverId}
                onChange={(e) => setDelForm(prev => ({ ...prev, driverId: e.target.value }))}
                className="w-full pl-3 pr-3 text-xs"
                required
              >
                <option value="">Selecione...</option>
                {drivers.map(drv => (
                  <option key={drv.id} value={drv.id}>{drv.name} ({drv.cpf})</option>
                ))}
              </select>
              <label className="text-xs font-semibold text-outline">Selecione o Motorista</label>
            </div>

            {/* Live validation card */}
            {selectedDelDriver && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-primary">Relatório de Compliance do Motorista</h4>
                <div className="space-y-2 text-xs">
                  {/* CNH Verification */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Validade da CNH:</span>
                    {new Date(selectedDelDriver.cnhExpiration) < new Date() ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vencida ({new Date(selectedDelDriver.cnhExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ativa ({new Date(selectedDelDriver.cnhExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    )}
                  </div>

                  {/* Condutax Verification */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Validade do CONDUTAX:</span>
                    {!selectedDelDriver.condutaxExpiration ? (
                      <span className="text-amber-600 font-semibold">Não cadastrado / Não exigido</span>
                    ) : new Date(selectedDelDriver.condutaxExpiration) < new Date() ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vencido ({new Date(selectedDelDriver.condutaxExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ativo ({new Date(selectedDelDriver.condutaxExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    )}
                  </div>

                  {/* activeLocks Verification */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Bloqueios Operacionais:</span>
                    {selectedDelDriver.activeLocks && selectedDelDriver.activeLocks.length > 0 ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Bloqueado ({selectedDelDriver.activeLocks.join(", ")})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Sem bloqueios
                      </span>
                    )}
                  </div>

                  {/* Exclusivity Verification */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Vínculo Ativo Existente:</span>
                    {assignments.some(a => a.active === true && a.driverId === selectedDelDriver.id) ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Bloqueado (Já possui veículo)
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Sem veículo ativo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Selecionar Veículo */}
        {delStep === 2 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 2: Selecione o Veículo</h3>
            <p className="text-on-surface-variant text-xs">
              Selecione um veículo disponível em estoque. O sistema verificará se o licenciamento e seguro estão em dia.
            </p>

            <div className="floating-label-group">
              <select
                value={delForm.vehicleId}
                onChange={(e) => {
                  const vId = e.target.value;
                  const veh = vehicles.find(v => v.id === vId);
                  setDelForm(prev => ({
                    ...prev,
                    vehicleId: vId,
                    pricingCategoryId: veh?.pricingCategoryId || "",
                    packageId: veh?.defaultPackageId || "",
                    billingProfileId: veh?.billingProfileId || "",
                    pricingTableId: prev.pricingTableId || "tbl-std"
                  }));
                }}
                className="w-full pl-3 pr-3 text-xs"
                required
              >
                <option value="">Selecione...</option>
                {vehicles.map(veh => (
                  <option key={veh.id} value={veh.id}>
                    {veh.brand} {veh.model} ({veh.plate}) — Status: {veh.status}
                  </option>
                ))}
              </select>
              <label className="text-xs font-semibold text-outline">Selecione o Veículo</label>
            </div>

            {selectedDelVehicle && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-primary">Relatório Técnico do Veículo</h4>
                <div className="space-y-2 text-xs">
                  {/* Status Check */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Status Operacional:</span>
                    {selectedDelVehicle.status !== "active" ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Indisponível ({selectedDelVehicle.status})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Disponível
                      </span>
                    )}
                  </div>

                  {/* Seguro Check */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Validade do Seguro:</span>
                    {new Date(selectedDelVehicle.insuranceExpiration) < new Date() ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vencido ({new Date(selectedDelVehicle.insuranceExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ativo ({new Date(selectedDelVehicle.insuranceExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    )}
                  </div>

                  {/* CRLV check */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Vencimento CRLV / IPVA:</span>
                    {new Date(selectedDelVehicle.registrationExpiration) < new Date() ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vencido ({new Date(selectedDelVehicle.registrationExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Regularizado ({new Date(selectedDelVehicle.registrationExpiration).toLocaleDateString("pt-BR")})
                      </span>
                    )}
                  </div>

                  {/* activeLocks Check */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Bloqueios de Manutenção:</span>
                    {selectedDelVehicle.activeLocks && selectedDelVehicle.activeLocks.length > 0 ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Bloqueado ({selectedDelVehicle.activeLocks.join(", ")})
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Nenhum impedimento mecânico
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Configurar Contrato */}
        {delStep === 3 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 3: Parâmetros Financeiros e Contrato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDelVehicle?.pricingCategoryId ? (
                <>
                  <div className="floating-label-group">
                    <select
                      value={delForm.pricingTableId}
                      onChange={(e) => setDelForm(prev => ({ ...prev, pricingTableId: e.target.value }))}
                      className="w-full pl-3 pr-3 text-xs"
                      required
                    >
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <label className="text-xs font-semibold text-outline">Tabela Tarifária</label>
                  </div>

                  <div className="floating-label-group">
                    <select
                      value={delForm.packageId}
                      onChange={(e) => setDelForm(prev => ({ ...prev, packageId: e.target.value }))}
                      className="w-full pl-3 pr-3 text-xs"
                    >
                      <option value="">Nenhum Pacote</option>
                      {packages.filter(p => p.pricingCategoryId === selectedDelVehicle.pricingCategoryId).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <label className="text-xs font-semibold text-outline">Pacote de Locação</label>
                  </div>

                  <div className="floating-label-group">
                    <select
                      value={delForm.billingProfileId}
                      onChange={(e) => setDelForm(prev => ({ ...prev, billingProfileId: e.target.value }))}
                      className="w-full pl-3 pr-3 text-xs"
                      required
                    >
                      <option value="">Selecione...</option>
                      {billingProfiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <label className="text-xs font-semibold text-outline">Perfil de Faturamento</label>
                  </div>
                </>
              ) : (
                <div className="floating-label-group">
                  <select
                    value={delForm.dailyProfileId}
                    onChange={(e) => setDelForm(prev => ({ ...prev, dailyProfileId: e.target.value }))}
                    className="w-full pl-3 pr-3 text-xs"
                    required
                  >
                    <option value="">Selecione...</option>
                    {dailyProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.amount}/dia)</option>
                    ))}
                  </select>
                  <label className="text-xs font-semibold text-outline">Perfil de Diária (Legado)</label>
                </div>
              )}

              <div className="floating-label-group">
                <input
                  type="number"
                  value={delForm.depositAmount}
                  onChange={(e) => setDelForm(prev => ({ ...prev, depositAmount: Number(e.target.value) }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Valor da Caução (R$)</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="date"
                  value={delForm.startDate}
                  onChange={(e) => setDelForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Início do Vínculo</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="date"
                  value={delForm.endDate}
                  onChange={(e) => setDelForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Término Previsto</label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold text-primary mb-2">Composição de Tarifas Previstas</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Diária Comercial:</span>
                  <span className="font-bold">R$ {computedDailyRate},00 / dia</span>
                </div>
                <div className="flex justify-between">
                  <span>Faturamento Mensal (Média Estimada):</span>
                  <span className="font-bold">R$ {(computedDailyRate * 30 * 0.8).toFixed(2)} / mês</span>
                </div>
                <div className="flex justify-between">
                  <span>Garantia de Caução Retida no Extrato:</span>
                  <span className="font-bold text-red-600">-R$ {delForm.depositAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Checklist de Saída */}
        {delStep === 4 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 4: Checklist Técnico de Entrega</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.keys(delForm.checklist).map(item => (
                <label
                  key={item}
                  className="flex items-center space-x-2.5 p-3 border border-outline-variant bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={delForm.checklist[item as keyof typeof delForm.checklist]}
                    onChange={(e) => {
                      const updated = { ...delForm.checklist, [item]: e.target.checked };
                      setDelForm(prev => ({ ...prev, checklist: updated }));
                    }}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold capitalize">{item.replace("chaveReserva", "Chave Reserva")}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="floating-label-group">
                <input
                  type="number"
                  value={delForm.mileage}
                  onChange={(e) => setDelForm(prev => ({ ...prev, mileage: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Odômetro Atual (km)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={delForm.fuelLevel}
                  onChange={(e) => setDelForm(prev => ({ ...prev, fuelLevel: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="Reserva">Reserva (Luz acesa)</option>
                  <option value="1/4">1/4 Tanque</option>
                  <option value="1/2">1/2 Tanque</option>
                  <option value="3/4">3/4 Tanque</option>
                  <option value="Cheio">Tanque Cheio (8/8)</option>
                </select>
                <label className="text-xs font-semibold text-outline">Nível de Combustível</label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Fotos / Avarias */}
        {delStep === 5 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 5: Fotos & Mapa de Avarias</h3>
            <p className="text-on-surface-variant text-xs">
              Marque as partes do veículo que possuem avarias pré-existentes e insira notas descritivas.
            </p>

            {/* Visual damages list */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {Object.keys(delForm.damages).map(part => (
                <button
                  key={part}
                  type="button"
                  onClick={() => {
                    const updated = { ...delForm.damages, [part]: !delForm.damages[part as keyof typeof delForm.damages] };
                    setDelForm(prev => ({ ...prev, damages: updated }));
                  }}
                  className={`p-3 rounded-xl border text-center font-bold text-[10px] uppercase transition-all ${
                    delForm.damages[part as keyof typeof delForm.damages]
                      ? "bg-red-100 border-red-500 text-red-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>

            <div className="floating-label-group">
              <textarea
                value={delForm.damageNotes}
                onChange={(e) => setDelForm(prev => ({ ...prev, damageNotes: e.target.value }))}
                className="w-full pl-3 pr-3 text-xs min-h-[64px] py-2"
                placeholder=" "
              />
              <label className="text-xs font-semibold text-outline">Notas / Detalhamento das Avarias</label>
            </div>

            {/* Upload Section Mock */}
            <div className="border border-dashed border-outline-variant rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[32px] text-outline mb-2">upload</span>
              <p className="text-xs font-bold text-primary">Upload de fotos do laudo técnico</p>
              <p className="text-[10px] text-outline mt-0.5">Mock: Fotos padrão de entrega pré-carregadas para simulação.</p>
            </div>
          </div>
        )}

        {/* STEP 6: Contrato e Assinatura */}
        {delStep === 6 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 6: Termos e Assinatura do Motorista</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap">
              {deliveryContractText}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={delForm.signatureText}
                  onChange={(e) => setDelForm(prev => ({ ...prev, signatureText: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  placeholder="Nome do motorista para assinatura"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome para Assinatura Impressa</label>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Assinatura Digital</span>
                <SignaturePad
                  onSave={(data) => setDelForm(prev => ({ ...prev, signatureImage: data }))}
                  onClear={() => setDelForm(prev => ({ ...prev, signatureImage: "" }))}
                  value={delForm.signatureImage}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Integração Financeira */}
        {delStep === 7 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 7: Lançamento no Extrato & Entrada</h3>
            
            <div className="p-4 border border-outline-variant bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-semibold">Débito Caução (Lançamento Extrato):</span>
                <span className="text-xs font-mono font-bold text-red-600">-R$ {delForm.depositAmount.toFixed(2)}</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={delForm.initialPayment}
                    onChange={(e) => setDelForm(prev => ({ ...prev, initialPayment: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    placeholder="R$ 0,00"
                  />
                  <label className="text-xs font-semibold text-outline">Valor Pago de Entrada no Ato (Opcional)</label>
                </div>

                {delForm.initialPayment > 0 && (
                  <div className="floating-label-group">
                    <select
                      value={delForm.paymentMethod}
                      onChange={(e) => setDelForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full pl-3 pr-3 text-xs"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro físico</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Transferência">TED / DOC</option>
                    </select>
                    <label className="text-xs font-semibold text-outline">Forma de Recebimento</label>
                  </div>
                )}
              </div>
            </div>

            {/* Closed cashier warning */}
            {delForm.initialPayment > 0 && !openCashier && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-lg flex items-start gap-2 text-red-800 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Erro de Caixa:</strong> Seu caixa está fechado. Para registrar a entrada no caixa da empresa, abra seu caixa primeiro ou remova o valor de entrada para lançar apenas o débito.
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: Revisão e Conclusão */}
        {delStep === 8 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Passo 8: Revise os dados e Confirme a Entrega</span>
            </h3>
            <p className="text-on-surface-variant text-xs">
              Verifique os dados da operação. Ao clicar em "Confirmar e Entregar Veículo", o veículo será locado e todos os lançamentos financeiros serão efetuados.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Motorista:</span>
                <span className="font-bold">{selectedDelDriver?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Veículo:</span>
                <span className="font-bold">{selectedDelVehicle?.brand} {selectedDelVehicle?.model} ({selectedDelVehicle?.plate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Diária Contratada:</span>
                <span className="font-bold">R$ {computedDailyRate},00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Caução Lançada:</span>
                <span className="font-bold text-red-600">-R$ {delForm.depositAmount.toFixed(2)}</span>
              </div>
              {delForm.initialPayment > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Entrada Paga no Ato:</span>
                  <span className="font-bold text-emerald-600">+R$ {delForm.initialPayment.toFixed(2)} ({delForm.paymentMethod})</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Quilometragem de Saída:</span>
                <span className="font-bold">{delForm.mileage} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Combustível de Saída:</span>
                <span className="font-bold">{delForm.fuelLevel}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-semibold">Avarias pré-existentes:</span>
                <span className="font-bold">
                  {Object.entries(delForm.damages).filter(([_, v]) => v).map(([k]) => k).join(", ") || "Nenhuma"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="bg-slate-50 border-t border-outline-variant p-4 flex justify-between">
        <button
          onClick={handleDelPrev}
          disabled={delStep === 1}
          className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        
        {delStep < 8 ? (
          <button
            onClick={handleDelNext}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={submitDelivery}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-md transition-colors"
          >
            Confirmar e Entregar Veículo
          </button>
        )}
      </div>
    </div>
  );
};
