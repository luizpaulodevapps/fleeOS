"use client";

import React, { useState } from "react";
import { RotateCcw, X, AlertTriangle, CheckCircle, Camera } from "lucide-react";
import { SignaturePad } from "./SignaturePad";
import { SearchSelect } from "./SearchSelect";
import { PlateScanner } from "./PlateScanner";
import { ReturnFormState } from "../_lib/types";

interface ReturnWizardProps {
  retStep: number;
  setRetStep: React.Dispatch<React.SetStateAction<number>>;
  retForm: ReturnFormState;
  setRetForm: React.Dispatch<React.SetStateAction<ReturnFormState>>;
  vehicles: any[];
  assignments: any[];
  activeAssignment: any;
  activeContract: any;
  activeDriver: any;
  selectedRetVehicle: any;
  returnContractText: string;
  handleRetNext: () => void;
  handleRetPrev: () => void;
  submitReturn: () => void;
  setActiveWizard: (wizard: "delivery" | "return" | "swap" | null) => void;
}

export const ReturnWizard: React.FC<ReturnWizardProps> = ({
  retStep,
  retForm,
  setRetForm,
  vehicles,
  assignments,
  activeAssignment,
  activeContract,
  activeDriver,
  selectedRetVehicle,
  returnContractText,
  handleRetNext,
  handleRetPrev,
  submitReturn,
  setActiveWizard
}) => {
  const [showScanner, setShowScanner] = useState(false);

  const handlePlateScan = (plate: string) => {
    const veh = vehicles.find(v => v.plate?.toUpperCase() === plate);
    if (!veh) {
      alert(`Nenhum veículo encontrado com a placa ${plate}`);
      setShowScanner(false);
      return;
    }
    const hasActive = assignments.some(a => a.active === true && a.vehicleId === veh.id);
    if (!hasActive) {
      alert(`O veículo ${plate} não possui vínculo ativo para devolução.`);
      setShowScanner(false);
      return;
    }
    setRetForm(prev => ({ ...prev, vehicleId: veh.id }));
    setShowScanner(false);
    handleRetNext();
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-md overflow-hidden animate-fadeIn">
      {/* Header Progress Tracker */}
      <div className="bg-emerald-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-6 h-6" />
            <span className="font-geist font-black tracking-tight text-lg">🔄 Devolução de Veículo</span>
          </div>
          <button
            onClick={() => {
              if (confirm("Deseja mesmo cancelar o processo de devolução? Todos os dados serão limpos.")) {
                setActiveWizard(null);
              }
            }}
            className="text-white hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Step Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-[9px] font-black uppercase tracking-wider">
          {[
            { s: 1, name: "Ativo Locado" },
            { s: 2, name: "Checklist" },
            { s: 3, name: "Novas Avarias" },
            { s: 4, name: "Ajuste Financeiro" },
            { s: 5, name: "Quitação" },
            { s: 6, name: "Revisão" }
          ].map(indicator => (
            <div
              key={indicator.s}
              className={`py-1 border-b-4 transition-all ${
                retStep === indicator.s
                  ? "border-white text-white font-black"
                  : retStep > indicator.s
                  ? "border-emerald-300 text-emerald-200"
                  : "border-emerald-800 text-emerald-800"
              }`}
            >
              {indicator.s}. {indicator.name}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content Body */}
      <div className="p-6 min-h-[400px]">
        {/* STEP 1: Selecionar Veículo */}
        {retStep === 1 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 1: Selecione o Veículo Locado</h3>
            <p className="text-on-surface-variant text-xs">
              Selecione o veículo da frota que está retornando. O sistema carregará o motorista e o contrato ativo vinculados a ele.
            </p>

            {/* Scan Plate Button */}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Camera className="w-4 h-4" />
              Escanear Placa do Veículo
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-container-lowest px-3 text-outline">ou selecione manualmente</span>
              </div>
            </div>

            <SearchSelect
              items={vehicles.filter(v => v.status === "locado" || assignments.some(a => a.active === true && a.vehicleId === v.id)).map(veh => ({
                id: veh.id,
                label: `${veh.brand} ${veh.model}`,
                subtitle: veh.plate
              }))}
              value={retForm.vehicleId}
              onChange={(id) => setRetForm(prev => ({ ...prev, vehicleId: id }))}
              placeholder="Pesquise por placa, modelo ou marca..."
              label="Selecione o Veículo"
              searchPlaceholder="Digite placa, modelo ou marca..."
              emptyMessage="Nenhum veículo locado encontrado"
            />

            {activeAssignment && activeDriver && activeContract && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-primary mb-1">Informações do Contrato Carregadas</h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Motorista:</span>
                  <span className="font-bold">{activeDriver.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contrato:</span>
                  <span className="font-bold font-mono">CON-{activeContract.id.substring(0,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Início da Locação:</span>
                  <span className="font-bold font-mono">{new Date(activeAssignment.startDate).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Checklist */}
        {retStep === 2 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 2: Checklist de Devolução</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.keys(retForm.checklist).map(item => (
                <label
                  key={item}
                  className="flex items-center space-x-2.5 p-3 border border-outline-variant bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={retForm.checklist[item as keyof typeof retForm.checklist]}
                    onChange={(e) => {
                      const updated = { ...retForm.checklist, [item]: e.target.checked };
                      setRetForm(prev => ({ ...prev, checklist: updated }));
                    }}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold capitalize">{item.replace("chaveReserva", "Chave Reserva")}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="floating-label-group">
                <input
                  type="number"
                  value={retForm.mileage}
                  onChange={(e) => setRetForm(prev => ({ ...prev, mileage: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Odômetro Final (km)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={retForm.fuelLevel}
                  onChange={(e) => setRetForm(prev => ({ ...prev, fuelLevel: e.target.value }))}
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

        {/* STEP 3: Novas Avarias */}
        {retStep === 3 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 3: Avarias Encontradas no Retorno</h3>
            <p className="text-on-surface-variant text-xs">
              Caso encontre novos amassados ou quebras no ativo, selecione as partes avariadas para gerar um pré-sinistro automático.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {Object.keys(retForm.damages).map(part => (
                <button
                  key={part}
                  type="button"
                  onClick={() => {
                    const updated = { ...retForm.damages, [part]: !retForm.damages[part as keyof typeof retForm.damages] };
                    setRetForm(prev => ({ ...prev, damages: updated }));
                  }}
                  className={`p-3 rounded-xl border text-center font-bold text-[10px] uppercase transition-all ${
                    retForm.damages[part as keyof typeof retForm.damages]
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
                value={retForm.damageNotes}
                onChange={(e) => setRetForm(prev => ({ ...prev, damageNotes: e.target.value }))}
                className="w-full pl-3 pr-3 text-xs min-h-[64px] py-2"
                placeholder=" "
              />
              <label className="text-xs font-semibold text-outline">Descrição Detalhada das Novas Avarias</label>
            </div>

            <div className="floating-label-group">
              <select
                value={retForm.vehicleStatusAfter}
                onChange={(e) => setRetForm(prev => ({ ...prev, vehicleStatusAfter: e.target.value as any }))}
                className="w-full pl-3 pr-3 text-xs"
                required
              >
                <option value="active">Disponível para nova entrega (Sem avarias)</option>
                <option value="maintenance">Enviar para Oficina (Requer manutenção leve)</option>
                <option value="sinistrado">Indisponível / Sinistrado (Dano mecânico grave)</option>
              </select>
              <label className="text-xs font-semibold text-outline">Destino do Veículo após Devolução</label>
            </div>
          </div>
        )}

        {/* STEP 4: Ajuste Financeiro */}
        {retStep === 4 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 4: Fechamento de Saldos Financeiros</h3>
            <p className="text-on-surface-variant text-xs">
              O sistema projeta a cobrança de diárias até a data de hoje, adicionando penalidades se houver falta de combustível ou avarias graves.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={retForm.dailyCharges}
                    onChange={(e) => setRetForm(prev => ({ ...prev, dailyCharges: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                  />
                  <label className="text-xs font-semibold text-outline">Valor de Diárias (R$)</label>
                </div>

                <div className="floating-label-group">
                  <input
                    type="number"
                    value={retForm.fuelCharge}
                    onChange={(e) => setRetForm(prev => ({ ...prev, fuelCharge: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                  />
                  <label className="text-xs font-semibold text-outline">Falta de Combustível (R$)</label>
                </div>

                <div className="floating-label-group">
                  <input
                    type="number"
                    value={retForm.damageCharge}
                    onChange={(e) => setRetForm(prev => ({ ...prev, damageCharge: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                  />
                  <label className="text-xs font-semibold text-outline">Avarias a Cobrar (R$)</label>
                </div>
              </div>

              <label className="flex items-center space-x-2.5 p-4 border border-outline-variant bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={retForm.deductFromDeposit}
                  onChange={(e) => setRetForm(prev => ({ ...prev, deductFromDeposit: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <div>
                  <p className="font-bold text-primary">Abater pendências da Caução retida (R$ 3.000,00)</p>
                  <p className="text-[10px] text-outline mt-0.5">O saldo restante da caução será estornado para o motorista no extrato.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Quitação */}
        {retStep === 5 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 5: Termo de Distrato & Quitação</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap">
              {returnContractText}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={retForm.signatureText}
                  onChange={(e) => setRetForm(prev => ({ ...prev, signatureText: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  placeholder="Nome para assinatura"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome para Assinatura Impressa</label>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Assinatura Digital</span>
                <SignaturePad
                  onSave={(data) => setRetForm(prev => ({ ...prev, signatureImage: data }))}
                  onClear={() => setRetForm(prev => ({ ...prev, signatureImage: "" }))}
                  value={retForm.signatureImage}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Revisão */}
        {retStep === 6 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Passo 6: Confirme o Recebimento e Quitação</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Motorista:</span>
                <span className="font-bold">{activeDriver?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Veículo Devolvido:</span>
                <span className="font-bold">{selectedRetVehicle?.brand} {selectedRetVehicle?.model} ({selectedRetVehicle?.plate})</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-semibold">Total de Cobranças Extras:</span>
                <span className="font-bold text-red-600">R$ {(retForm.dailyCharges + retForm.fuelCharge + retForm.damageCharge).toFixed(2)}</span>
              </div>
              {retForm.deductFromDeposit && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Saldo de Estorno da Caução:</span>
                  <span className="font-bold text-emerald-600">R$ {Math.max(0, 3000 - (retForm.dailyCharges + retForm.fuelCharge + retForm.damageCharge)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-semibold">Odômetro de Entrada:</span>
                <span className="font-bold">{retForm.mileage} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Novas Avarias Reportadas:</span>
                <span className="font-bold">
                  {Object.entries(retForm.damages).filter(([_, v]) => v).map(([k]) => k).join(", ") || "Nenhuma"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Destino do Ativo:</span>
                <span className="font-bold uppercase text-amber-700">{retForm.vehicleStatusAfter}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="bg-slate-50 border-t border-outline-variant p-4 flex justify-between">
        <button
          onClick={handleRetPrev}
          disabled={retStep === 1}
          className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        
        {retStep < 6 ? (
          <button
            onClick={handleRetNext}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={submitReturn}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-md transition-colors"
          >
            Confirmar Recebimento e Fechar Vínculo
          </button>
        )}
      </div>

      {/* Plate Scanner Modal */}
      {showScanner && (
        <PlateScanner
          onScan={handlePlateScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
