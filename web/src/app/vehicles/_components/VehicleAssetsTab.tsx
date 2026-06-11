"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { AssetFormState } from "../_lib/types";

interface VehicleAssetsTabProps {
  selectedVehicle: any;
  assets: any[];
  assetForm: AssetFormState;
  setAssetForm: React.Dispatch<React.SetStateAction<AssetFormState>>;
  handleAddAsset: (e: React.FormEvent) => Promise<void>;
  isReadOnly: (vehicle: any) => boolean;
}

export function VehicleAssetsTab({
  selectedVehicle,
  assets,
  assetForm,
  setAssetForm,
  handleAddAsset,
  isReadOnly
}: VehicleAssetsTabProps) {
  const readOnly = isReadOnly(selectedVehicle);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Periféricos e Acessórios Instalados</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assets.filter(a => a.vehicleId === selectedVehicle.id).length === 0 ? (
            <p className="col-span-2 text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
              Nenhum equipamento cadastrado neste carro.
            </p>
          ) : (
            assets.filter(a => a.vehicleId === selectedVehicle.id).map(a => (
              <div key={a.id} className="bg-slate-50 border border-outline-variant p-3.5 rounded-xl flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-primary">{a.assetType}</p>
                  <p className="text-on-surface-variant font-mono">S/N: {a.serialNumber}</p>
                  <p className="text-[10px] text-slate-500">Instalação: {new Date(a.installDate).toLocaleDateString()}</p>
                </div>
                <span className="bg-emerald-100 border border-emerald-250 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Equipment Asset form */}
      {!readOnly && (
        <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-primary" />
            <span>Instalar Novo Equipamento / Periférico</span>
          </h4>

          <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Tipo de Periférico</label>
              <select
                value={assetForm.assetType}
                onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
              >
                <option value="Taxímetro">Taxímetro</option>
                <option value="Luminoso">Luminoso (Prato)</option>
                <option value="GPS Rastreador">GPS Rastreador</option>
                <option value="Rádio Comunicador">Rádio Comunicador</option>
                <option value="Máquina de Cartão">Máquina de Cartão</option>
                <option value="Câmera Interna">Câmera Interna</option>
                <option value="Botão de Pânico">Botão de Pânico</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Número de Série / Patrimônio</label>
              <input
                type="text"
                required
                placeholder="Ex: TX-98765-X"
                value={assetForm.serialNumber}
                onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Instalação</label>
              <input
                type="date"
                required
                value={assetForm.installDate}
                onChange={(e) => setAssetForm({ ...assetForm, installDate: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Efetivar Instalação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
