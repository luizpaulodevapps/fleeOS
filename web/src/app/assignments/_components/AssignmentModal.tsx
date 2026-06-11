"use client";

import React from "react";
import { Link2, X, FileCheck, ClipboardList } from "lucide-react";
import { AssignmentFormData } from "../_lib/types";
import { PHOTO_LABELS } from "../_lib/constants";
import { compressImage } from "../_lib/helpers";
import { SignaturePad } from "./SignaturePad";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: AssignmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssignmentFormData>>;
  availableDrivers: any[];
  availableVehicles: any[];
  contracts: any[];
  drivers: any[];
  newAsgPhotos: Record<string, string>;
  setNewAsgPhotos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  newAsgSignature: string;
  setNewAsgSignature: (sig: string) => void;
  onMockPhotos: () => void;
  loading?: boolean;
}

export function AssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  availableDrivers,
  availableVehicles,
  contracts,
  drivers,
  newAsgPhotos,
  setNewAsgPhotos,
  newAsgSignature,
  setNewAsgSignature,
  onMockPhotos,
  loading = false
}: AssignmentModalProps) {
  if (!isOpen) return null;

  const getDriverName = (id: string) => {
    const d = drivers.find(drv => drv.id === id);
    return d ? d.name : `Motorista (${id.substring(0, 6)})`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background border border-outline-variant rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary font-geist flex items-center gap-1.5">
              <Link2 className="w-5 h-5 text-primary" />
              <span>Novo Vínculo Operacional</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Atribua um veículo a um motorista. O checklist de entrega é obrigatório.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Motorista Livre</label>
              <select
                required
                value={formData.driverId}
                onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none font-semibold"
              >
                <option value="">Selecione...</option>
                {availableDrivers.map(d => {
                  const locks = d.activeLocks || [];
                  const isLocked = locks.length > 0;
                  return (
                    <option key={d.id} value={d.id} disabled={isLocked} className={isLocked ? "text-red-450 font-semibold" : ""}>
                      {d.name} {isLocked ? `(Bloqueado: ${locks.join(",")})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Veículo Livre</label>
              <select
                required
                value={formData.vehicleId}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none font-semibold"
              >
                <option value="">Selecione...</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Contrato de Respaldo</label>
            <select
              required
              value={formData.contractId}
              onChange={(e) => setFormData(prev => ({ ...prev, contractId: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none font-semibold"
            >
              <option value="">Nenhum / Sem Contrato Mapeado</option>
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  Contrato ID {c.id.substring(0, 8)} (R$ {c.dailyRate}/dia - {getDriverName(c.driverId)})
                </option>
              ))}
            </select>
          </div>

          {/* Checklist Items */}
          <div className="bg-slate-50 p-4 border border-outline-variant/60 rounded-xl space-y-3">
            <p className="font-bold text-primary flex items-center gap-1.5 uppercase text-[10px] tracking-wider border-b border-outline-variant/40 pb-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Vistoria de Entrega Obrigatória</span>
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-primary">
              {Object.keys(formData.checklist).map((key) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.checklist as any)[key]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      checklist: { ...prev.checklist, [key]: e.target.checked }
                    }))}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="capitalize">{key === "crlv" ? "CRLV / Documento" : key.replace(/([A-Z])/g, " $1")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-slate-50 p-4 border border-outline-variant/60 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2">
              <p className="font-bold text-primary flex items-center gap-1.5 uppercase text-[10px] tracking-wider font-geist">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span>Fotos de Evidência da Entrega</span>
              </p>
              <button
                type="button"
                onClick={onMockPhotos}
                className="px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 text-[9px] font-bold rounded"
              >
                Simular Fotos
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(PHOTO_LABELS) as Array<keyof typeof PHOTO_LABELS>).map((key) => {
                const photoVal = newAsgPhotos[key];
                return (
                  <div key={key} className="relative border border-outline-variant rounded-lg p-1 bg-white hover:bg-slate-50 transition-all flex flex-col items-center justify-center min-h-[72px] text-center">
                    {photoVal ? (
                      <div className="relative w-full h-full min-h-[64px] flex items-center justify-center overflow-hidden rounded">
                        <img src={photoVal} alt={PHOTO_LABELS[key]} className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewAsgPhotos(prev => ({ ...prev, [key]: "" }))}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-1">
                        <span className="material-symbols-outlined text-[16px] text-outline">photo_camera</span>
                        <span className="text-[9px] font-bold text-primary mt-0.5">{PHOTO_LABELS[key]}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImage(file);
                              setNewAsgPhotos(prev => ({ ...prev, [key]: compressed }));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2 font-geist">Nome do Condutor</label>
            <input
              type="text"
              required
              placeholder="Digitar nome de concordância..."
              value={formData.signatureText}
              onChange={(e) => setFormData(prev => ({ ...prev, signatureText: e.target.value }))}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none mb-3 font-semibold"
            />
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2 font-geist">Assinatura Digital</label>
            <SignaturePad
              onSave={setNewAsgSignature}
              onClear={() => setNewAsgSignature("")}
              value={newAsgSignature}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
            >
              {loading ? "Processando..." : "Confirmar Entrega"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
