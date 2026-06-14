"use client";

import React from "react";
import { Banknote } from "lucide-react";
import { AcquisitionFormState } from "../_lib/types";

interface VehicleAcqTabProps {
  selectedVehicle: any;
  acqForm: AcquisitionFormState;
  setAcqForm: React.Dispatch<React.SetStateAction<AcquisitionFormState>>;
  handleSaveAcquisition: () => Promise<void>;
  acquisitions: any[];
}

export function VehicleAcqTab({
  selectedVehicle,
  acqForm,
  setAcqForm,
  handleSaveAcquisition,
  acquisitions
}: VehicleAcqTabProps) {
  const f = acqForm;
  const purchaseVal = Number(f.purchaseValue) || 0;
  const currentFipe = Number(f.currentFipeValue) || 0;
  const fipeVariation = purchaseVal > 0 && currentFipe > 0 ? ((currentFipe - purchaseVal) / purchaseVal * 100) : null;
  const totalInstall = Number(f.installments) || 0;
  const purchaseDate = f.purchaseDate ? new Date(f.purchaseDate) : null;
  const monthsOwned = purchaseDate ? Math.max(1, Math.round((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0;
  const paidInstall = Math.min(monthsOwned, totalInstall);
  const remainInstall = Math.max(0, totalInstall - paidInstall);
  const remainDebt = remainInstall * (Number(f.installmentValue) || 0);
  const progressPct = totalInstall > 0 ? (paidInstall / totalInstall) * 100 : 0;

  // Taxi & Initial Setup Calculations
  const taximeter = Number(f.taximeterCost) || 0;
  const rooftopLight = Number(f.rooftopLightCost) || 0;
  const initialInspection = Number(f.initialInspectionCost) || 0;
  const paintOrDecal = Number(f.paintOrDecalCost) || 0;
  const municipalReg = Number(f.municipalRegistrationCost) || 0;
  const otherInitial = Number(f.otherInitialCosts) || 0;
  
  const totalSetupCost = taximeter + rooftopLight + initialInspection + paintOrDecal + municipalReg + otherInitial;
  const totalCapex = purchaseVal + totalSetupCost;

  return (
    <div className="space-y-6">
      {/* CAPEX Activation KPI dashboard */}
      {purchaseVal > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
          <div className="bg-white border border-slate-150 p-3 rounded-xl flex flex-col justify-between shadow-sm">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Custo de Aquisição (Base)</span>
            <span className="text-sm font-black text-slate-800 font-mono mt-1">
              {purchaseVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="bg-white border border-slate-150 p-3 rounded-xl flex flex-col justify-between shadow-sm">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Preparação & Equipagem</span>
            <span className="text-sm font-black text-violet-600 font-mono mt-1">
              {totalSetupCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-3 rounded-xl flex flex-col justify-between text-white shadow-md">
            <span className="text-[9px] font-black text-violet-100 uppercase tracking-wider">CAPEX Ativado Total</span>
            <span className="text-base font-extrabold font-mono mt-1">
              {totalCapex.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-violet-600" />
          Patrimônio e Aquisição
        </h4>
      </div>

      {/* Origem */}
      <div>
        <label className="block text-[10px] font-bold uppercase text-outline mb-2">Origem do Veículo</label>
        <div className="flex flex-wrap gap-2">
          {["Compra à Vista", "Financiamento", "Leasing", "Comodato", "Consignação", "Frota Parceira", "Terceiro"].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setAcqForm(prev => ({ ...prev, acquisitionType: type }))}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                f.acquisitionType === type
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
              }`}
            >{type}</button>
          ))}
        </div>
      </div>

      {/* Compra */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">📋 Dados da Compra</h5>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Data da Compra</label>
            <input type="date" value={f.purchaseDate} onChange={e => setAcqForm(p => ({ ...p, purchaseDate: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Valor da Compra (R$)</label>
            <input type="number" value={f.purchaseValue} onChange={e => setAcqForm(p => ({ ...p, purchaseValue: e.target.value }))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">FIPE na Compra (R$)</label>
            <input type="number" value={f.fipeAtPurchase} onChange={e => setAcqForm(p => ({ ...p, fipeAtPurchase: e.target.value }))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Loja / Vendedor</label>
            <input type="text" value={f.seller} onChange={e => setAcqForm(p => ({ ...p, seller: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Nota Fiscal</label>
            <input type="text" value={f.invoiceNumber} onChange={e => setAcqForm(p => ({ ...p, invoiceNumber: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">KM na Admissão</label>
            <input type="number" value={f.admissionMileage} onChange={e => setAcqForm(p => ({ ...p, admissionMileage: e.target.value }))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
        </div>
      </div>

      {/* Financiamento */}
      {f.acquisitionType === "Financiamento" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-blue-600 mb-3">🏦 Financiamento</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Banco / Financeira</label>
              <input type="text" value={f.bankName} onChange={e => setAcqForm(p => ({ ...p, bankName: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Nº Contrato</label>
              <input type="text" value={f.contractNumber} onChange={e => setAcqForm(p => ({ ...p, contractNumber: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Valor Financiado (R$)</label>
              <input type="number" value={f.financedAmount} onChange={e => setAcqForm(p => ({ ...p, financedAmount: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Entrada (R$)</label>
              <input type="number" value={f.downPayment} onChange={e => setAcqForm(p => ({ ...p, downPayment: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Nº Parcelas</label>
              <input type="number" value={f.installments} onChange={e => setAcqForm(p => ({ ...p, installments: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Valor Parcela (R$)</label>
              <input type="number" value={f.installmentValue} onChange={e => setAcqForm(p => ({ ...p, installmentValue: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Taxa Juros (% a.m.)</label>
              <input type="number" step="0.01" value={f.interestRate} onChange={e => setAcqForm(p => ({ ...p, interestRate: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Data Início</label>
              <input type="date" value={f.startDate} onChange={e => setAcqForm(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-xs outline-none" />
            </div>
          </div>
          {totalInstall > 0 && (
            <div className="mt-4 bg-white border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-blue-700">Progresso Quitação</span>
                <span className="font-mono text-blue-600">{paidInstall}/{totalInstall} parcelas pagas</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{progressPct.toFixed(0)}% quitado</span>
                <span className="font-bold text-red-600">Saldo: {remainDebt.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leasing */}
      {f.acquisitionType === "Leasing" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-purple-600 mb-3">📑 Leasing</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Empresa de Leasing</label>
              <input type="text" value={f.leasingCompany} onChange={e => setAcqForm(p => ({ ...p, leasingCompany: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Prazo (meses)</label>
              <input type="number" value={f.leasingMonths} onChange={e => setAcqForm(p => ({ ...p, leasingMonths: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Valor Mensal (R$)</label>
              <input type="number" value={f.leasingMonthlyValue} onChange={e => setAcqForm(p => ({ ...p, leasingMonthlyValue: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Opção de Compra (R$)</label>
              <input type="number" value={f.leasingBuyOption} onChange={e => setAcqForm(p => ({ ...p, leasingBuyOption: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded text-xs outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* Comodato */}
      {f.acquisitionType === "Comodato" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-3">🤝 Comodato</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Nome do Proprietário</label>
              <input type="text" value={f.ownerName} onChange={e => setAcqForm(p => ({ ...p, ownerName: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">CPF / CNPJ</label>
              <input type="text" value={f.ownerDocument} onChange={e => setAcqForm(p => ({ ...p, ownerDocument: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Prazo (meses)</label>
              <input type="number" value={f.comodatoMonths} onChange={e => setAcqForm(p => ({ ...p, comodatoMonths: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Repasse Mensal (R$)</label>
              <input type="number" value={f.monthlyRepasse} onChange={e => setAcqForm(p => ({ ...p, monthlyRepasse: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded text-xs outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* FIPE + Custos fixos */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">📊 FIPE Atual & Seguro Anual</h5>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Valor FIPE Atual (R$)</label>
            <input type="number" value={f.currentFipeValue} onChange={e => setAcqForm(p => ({ ...p, currentFipeValue: e.target.value }))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Data da Consulta</label>
            <input type="date" value={f.fipeConsultDate} onChange={e => setAcqForm(p => ({ ...p, fipeConsultDate: e.target.value }))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Custo Seguro/Ano (R$)</label>
            <input type="number" value={f.annualInsuranceCost} onChange={e => setAcqForm(p => ({ ...p, annualInsuranceCost: e.target.value }))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
          </div>
        </div>
        {fipeVariation !== null && (
          <div className={`mt-3 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg ${
            fipeVariation >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <span>{fipeVariation >= 0 ? "▲" : "▼"}</span>
            <span>FIPE {fipeVariation >= 0 ? "valorizou" : "depreciou"} {Math.abs(fipeVariation).toFixed(1)}% vs compra</span>
          </div>
        )}

        {selectedVehicle && selectedVehicle.fipe && selectedVehicle.fipe.code && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs bg-slate-100/30 p-3 rounded-lg border border-slate-200/50">
            <div>
              <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider">Código FIPE</span>
              <span className="font-mono text-slate-900 font-bold">{selectedVehicle.fipe.code}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider">Referência FIPE</span>
              <span className="text-slate-900 font-bold">{selectedVehicle.fipe.referenceMonth}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider">Avaliação de Tabela FIPE</span>
              <span className="text-violet-750 font-extrabold text-violet-700">
                {selectedVehicle.fipe.value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider">Última Atualização FIPE</span>
              <span className="text-slate-900 font-bold font-mono">
                {selectedVehicle.lastFipeUpdate ? new Date(selectedVehicle.lastFipeUpdate).toLocaleDateString("pt-BR") : "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Impostos, Licenciamento e Vistorias */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">📜 Impostos, Licenciamento e Vistorias</h5>
        <div className="space-y-4">
          {/* IPVA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end border-b border-slate-150 pb-3">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Custo IPVA Anual (R$)</label>
              <input
                type="number"
                value={f.annualIpvaCost || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, annualIpvaCost: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Vencimento IPVA</label>
              <input
                type="date"
                value={f.ipvaExpirationDate || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, ipvaExpirationDate: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Situação IPVA</label>
              <select
                value={f.ipvaPaidStatus || "pending"}
                onChange={(e) => setAcqForm((p) => ({ ...p, ipvaPaidStatus: e.target.value as any }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
              >
                <option value="pending">Pendente de Pagamento</option>
                <option value="paid">✓ Pago / Regularizado</option>
              </select>
            </div>
          </div>

          {/* Licenciamento (CRLV) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end border-b border-slate-150 pb-3">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Taxa Licenciamento CRLV (R$)</label>
              <input
                type="number"
                value={f.annualLicensingCost || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, annualLicensingCost: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Vencimento Licenciamento</label>
              <input
                type="date"
                value={f.licensingExpirationDate || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, licensingExpirationDate: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Situação Licenciamento</label>
              <select
                value={f.licensingPaidStatus || "pending"}
                onChange={(e) => setAcqForm((p) => ({ ...p, licensingPaidStatus: e.target.value as any }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
              >
                <option value="pending">Pendente de Pagamento</option>
                <option value="paid">✓ Pago / Emitido</option>
              </select>
            </div>
          </div>

          {/* Vistoria Periódica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Custo Vistoria GNV/Anual (R$)</label>
              <input
                type="number"
                value={f.annualInspectionCost || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, annualInspectionCost: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Vencimento Vistoria</label>
              <input
                type="date"
                value={f.inspectionExpirationDate || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, inspectionExpirationDate: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Situação Vistoria</label>
              <select
                value={f.inspectionPaidStatus || "pending"}
                onChange={(e) => setAcqForm((p) => ({ ...p, inspectionPaidStatus: e.target.value as any }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
              >
                <option value="pending">Pendente / Não Realizada</option>
                <option value="paid">✓ Realizada / Aprovada</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Credenciamento de Táxi (Alvará) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500">🚖 Credenciamento de Táxi e Regulamentação</h5>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!f.isTaxi}
              onChange={(e) => setAcqForm((prev) => ({ ...prev, isTaxi: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-2 text-xs font-bold text-slate-700">Ativar Perfil Táxi</span>
          </label>
        </div>

        {f.isTaxi && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Número do Alvará</label>
              <input
                type="text"
                value={f.alvaraNumber || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, alvaraNumber: e.target.value }))}
                placeholder="Ex: Alvará-1234"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Vencimento Alvará</label>
              <input
                type="date"
                value={f.alvaraExpirationDate || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, alvaraExpirationDate: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Custo de Renovação (R$)</label>
              <input
                type="number"
                value={f.alvaraRenewalCost || ""}
                onChange={(e) => setAcqForm((p) => ({ ...p, alvaraRenewalCost: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-outline mb-1">Vistoria Municipal DTP</label>
              <select
                value={f.municipalInspectionStatus || "pending"}
                onChange={(e) => setAcqForm((p) => ({ ...p, municipalInspectionStatus: e.target.value as any }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
              >
                <option value="pending">Aguardando / Pendente</option>
                <option value="approved">✓ Aprovada</option>
                <option value="failed">✗ Reprovada</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Custos de Preparação e Equipagem Inicial (Setup do Veículo) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">🛠️ Preparação Inicial e Equipagem (Capex Prep)</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Instalação de Taxímetro (R$)</label>
            <input
              type="number"
              value={f.taximeterCost || ""}
              onChange={(e) => setAcqForm((p) => ({ ...p, taximeterCost: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Luminoso / Sinalizador (R$)</label>
            <input
              type="number"
              value={f.rooftopLightCost || ""}
              onChange={(e) => setAcqForm((p) => ({ ...p, rooftopLightCost: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Vistoria Inicial Inmetro (R$)</label>
            <input
              type="number"
              value={f.initialInspectionCost || ""}
              onChange={(e) => setAcqForm((p) => ({ ...p, initialInspectionCost: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Plotagem / Pintura (R$)</label>
            <input
              type="number"
              value={f.paintOrDecalCost || ""}
              onChange={(e) => setAcqForm((p) => ({ ...p, paintOrDecalCost: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Licenciamento / Outorga DTP (R$)</label>
            <input
              type="number"
              value={f.municipalRegistrationCost || ""}
              onChange={(e) => setAcqForm((p) => ({ ...p, municipalRegistrationCost: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">Outras Taxas Iniciais (R$)</label>
            <input
              type="number"
              value={f.otherInitialCosts || ""}
              onChange={(e) => setAcqForm((p) => ({ ...p, otherInitialCosts: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
            />
          </div>
        </div>

        {totalSetupCost > 0 && (
          <div className="mt-3 bg-violet-50 text-violet-900 border border-violet-200 px-3 py-2 rounded-lg flex justify-between items-center text-xs font-bold">
            <span>Custo Total de Equipagem / Preparação:</span>
            <span className="font-mono text-sm">{totalSetupCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveAcquisition}
          className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-colors"
        >
          Salvar Dados Patrimoniais
        </button>
      </div>
    </div>
  );
}
