"use client";

import React from "react";
import { RefreshCw, X, CheckCircle } from "lucide-react";
import { SignaturePad } from "./SignaturePad";
import { SearchSelect } from "./SearchSelect";
import { SwapFormState } from "../_lib/types";

interface SwapWizardProps {
  swapStep: number;
  setSwapStep: React.Dispatch<React.SetStateAction<number>>;
  swapForm: SwapFormState;
  setSwapForm: React.Dispatch<React.SetStateAction<SwapFormState>>;
  vehicles: any[];
  availableVehicles: any[];
  driversWithVehicles: any[];
  activeSwapAssignment: any;
  selectedOldVehicle: any;
  selectedNewVehicle: any;
  selectedSwapDriver: any;
  handleSwapNext: () => void;
  handleSwapPrev: () => void;
  submitSwap: () => void;
  setActiveWizard: (wizard: "delivery" | "return" | "swap" | null) => void;
}

export const SwapWizard: React.FC<SwapWizardProps> = ({
  swapStep,
  swapForm,
  setSwapForm,
  vehicles,
  availableVehicles,
  driversWithVehicles,
  activeSwapAssignment,
  selectedOldVehicle,
  selectedNewVehicle,
  selectedSwapDriver,
  handleSwapNext,
  handleSwapPrev,
  submitSwap,
  setActiveWizard
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-md overflow-hidden animate-fadeIn">
      {/* Header Progress Tracker */}
      <div className="bg-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6" />
            <span className="font-geist font-black tracking-tight text-lg">🔁 Troca / Substituição de Veículo</span>
          </div>
          <button
            onClick={() => {
              if (confirm("Deseja mesmo cancelar a troca de veículo?")) {
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
            { s: 1, name: "Condutor" },
            { s: 2, name: "Checklist Antigo" },
            { s: 3, name: "Novo Veículo" },
            { s: 4, name: "Checklist Novo" },
            { s: 5, name: "Assinatura" },
            { s: 6, name: "Revisão & Troca" }
          ].map(indicator => (
            <div
              key={indicator.s}
              className={`py-1 border-b-4 transition-all ${
                swapStep === indicator.s
                  ? "border-white text-white font-black"
                  : swapStep > indicator.s
                  ? "border-purple-300 text-purple-200"
                  : "border-purple-800 text-purple-800"
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
        {swapStep === 1 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 1: Selecione o Motorista Ativo</h3>
            <p className="text-on-surface-variant text-xs">
              Selecione o motorista que fará a troca. O sistema detectará o veículo atualmente locado.
            </p>

            <SearchSelect
              items={driversWithVehicles.map(drv => ({
                id: drv.id,
                label: drv.name,
                subtitle: drv.cpf
              }))}
              value={swapForm.driverId}
              onChange={(id) => setSwapForm(prev => ({ ...prev, driverId: id }))}
              placeholder="Pesquise por nome ou CPF..."
              label="Selecione o Motorista"
              searchPlaceholder="Digite nome ou CPF..."
              emptyMessage="Nenhum motorista com veículo ativo encontrado"
            />

            {activeSwapAssignment && selectedOldVehicle && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-primary">Veículo Locado Atualmente Detectado</h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Modelo:</span>
                  <span className="font-bold">{selectedOldVehicle.brand} {selectedOldVehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Placa:</span>
                  <span className="font-bold font-mono">{selectedOldVehicle.plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Odômetro Atual registrado:</span>
                  <span className="font-bold font-mono">{selectedOldVehicle.mileage} km</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Checklist Veículo Antigo */}
        {swapStep === 2 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 2: Vistoria de Devolução do Carro Antigo</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.keys(swapForm.oldChecklist).map(item => (
                <label
                  key={item}
                  className="flex items-center space-x-2.5 p-3 border border-outline-variant bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={swapForm.oldChecklist[item as keyof typeof swapForm.oldChecklist]}
                    onChange={(e) => {
                      const updated = { ...swapForm.oldChecklist, [item]: e.target.checked };
                      setSwapForm(prev => ({ ...prev, oldChecklist: updated }));
                    }}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span className="font-semibold capitalize">{item.replace("chaveReserva", "Chave Reserva")}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="floating-label-group">
                <input
                  type="number"
                  value={swapForm.oldMileage}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, oldMileage: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Odômetro Final do Antigo (km)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={swapForm.oldFuelLevel}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, oldFuelLevel: e.target.value }))}
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

            {/* Damages for old vehicle */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-600">Marque novas avarias do carro antigo se houver:</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {Object.keys(swapForm.oldDamages).map(part => (
                  <button
                    key={part}
                    type="button"
                    onClick={() => {
                      const updated = { ...swapForm.oldDamages, [part]: !swapForm.oldDamages[part as keyof typeof swapForm.oldDamages] };
                      setSwapForm(prev => ({ ...prev, oldDamages: updated }));
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-[9px] uppercase transition-all ${
                      swapForm.oldDamages[part as keyof typeof swapForm.oldDamages]
                        ? "bg-red-100 border-red-500 text-red-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Novo Veículo */}
        {swapStep === 3 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 3: Selecione o Novo Veículo</h3>
            <p className="text-on-surface-variant text-xs">
              Selecione o novo ativo a ser entregue ao motorista da lista de veículos livres e ativos.
            </p>

            <SearchSelect
              items={availableVehicles.map(veh => ({
                id: veh.id,
                label: `${veh.brand} ${veh.model}`,
                subtitle: veh.plate
              }))}
              value={swapForm.newVehicleId}
              onChange={(id) => setSwapForm(prev => ({ ...prev, newVehicleId: id }))}
              placeholder="Pesquise por placa, modelo ou marca..."
              label="Selecione o Novo Veículo"
              searchPlaceholder="Digite placa, modelo ou marca..."
              emptyMessage="Nenhum veículo disponível encontrado"
            />

            {selectedNewVehicle && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-primary">Informações do Novo Veículo</h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Odômetro Inicial registrado:</span>
                  <span className="font-bold font-mono">{selectedNewVehicle.mileage} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validade Seguro:</span>
                  <span className="font-bold">{new Date(selectedNewVehicle.insuranceExpiration).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Checklist Novo Veículo */}
        {swapStep === 4 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 4: Vistoria de Entrega do Novo Carro</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.keys(swapForm.newChecklist).map(item => (
                <label
                  key={item}
                  className="flex items-center space-x-2.5 p-3 border border-outline-variant bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={swapForm.newChecklist[item as keyof typeof swapForm.newChecklist]}
                    onChange={(e) => {
                      const updated = { ...swapForm.newChecklist, [item]: e.target.checked };
                      setSwapForm(prev => ({ ...prev, newChecklist: updated }));
                    }}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span className="font-semibold capitalize">{item.replace("chaveReserva", "Chave Reserva")}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="floating-label-group">
                <input
                  type="number"
                  value={swapForm.newMileage}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, newMileage: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Odômetro Inicial do Novo (km)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={swapForm.newFuelLevel}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, newFuelLevel: e.target.value }))}
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

        {/* STEP 5: Assinatura */}
        {swapStep === 5 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist">Passo 5: Termo Aditivo de Substituição e Assinatura</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-700">
              <h4 className="font-bold border-b pb-1 mb-2">TERMO ADITIVO DE TROCA DE VEÍCULO</h4>
              <p className="mt-1">
                Por este termo aditivo operacional, o motorista <strong>{selectedSwapDriver?.name}</strong> entrega o veículo placa <strong>{selectedOldVehicle?.plate}</strong> (odômetro final: {swapForm.oldMileage} km) e assume a posse e responsabilidade técnica e civil do veículo placa <strong>{selectedNewVehicle?.plate}</strong> (odômetro inicial: {swapForm.newMileage} km) na data de {new Date(swapForm.swapDate).toLocaleDateString("pt-BR")}.
              </p>
              <p className="mt-2 text-slate-500">
                Permanecem válidas todas as cláusulas financeiras e regras gerais de locação do contrato original assinado.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={swapForm.signatureText}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, signatureText: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  placeholder="Nome para assinatura"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome para Assinatura Impressa</label>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Assinatura Digital</span>
                <SignaturePad
                  onSave={(data) => setSwapForm(prev => ({ ...prev, signatureImage: data }))}
                  onClear={() => setSwapForm(prev => ({ ...prev, signatureImage: "" }))}
                  value={swapForm.signatureImage}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Revisão */}
        {swapStep === 6 && (
          <div className="space-y-5 max-w-xl mx-auto">
            <h3 className="text-base font-extrabold text-primary font-geist flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <span>Passo 6: Confirme a Substituição e Execução</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Motorista:</span>
                <span className="font-bold">{selectedSwapDriver?.name}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-red-600 font-bold">
                <span>Veículo Devolvido:</span>
                <span>{selectedOldVehicle?.brand} {selectedOldVehicle?.model} ({selectedOldVehicle?.plate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Odômetro Final:</span>
                <span>{swapForm.oldMileage} km</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-emerald-600 font-bold">
                <span>Novo Veículo:</span>
                <span>{selectedNewVehicle?.brand} {selectedNewVehicle?.model} ({selectedNewVehicle?.plate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Odômetro Inicial:</span>
                <span>{swapForm.newMileage} km</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="bg-slate-50 border-t border-outline-variant p-4 flex justify-between">
        <button
          onClick={handleSwapPrev}
          disabled={swapStep === 1}
          className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        
        {swapStep < 6 ? (
          <button
            onClick={handleSwapNext}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={submitSwap}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-black shadow-md transition-colors"
          >
            Confirmar e Substituir Ativo
          </button>
        )}
      </div>
    </div>
  );
};
