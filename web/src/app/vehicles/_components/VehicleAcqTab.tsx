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

  return (
    <div className="space-y-6">
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
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">📊 FIPE Atual + Custos Anuais</h5>
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="block text-[10px] font-bold text-outline mb-1">IPVA/Ano (R$)</label>
            <input type="number" value={f.annualIpvaCost} onChange={e => setAcqForm(p => ({ ...p, annualIpvaCost: e.target.value }))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none" />
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
