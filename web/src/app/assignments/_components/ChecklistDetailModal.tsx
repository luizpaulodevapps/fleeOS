"use client";

import React from "react";
import { X, FileCheck, Printer } from "lucide-react";
import { Checklist } from "../_lib/types";
import { PHOTO_LABELS } from "../_lib/constants";

interface ChecklistDetailModalProps {
  checklist: Checklist | null;
  onClose: () => void;
  drivers: any[];
  vehicles: any[];
}

export function ChecklistDetailModal({
  checklist,
  onClose,
  drivers,
  vehicles
}: ChecklistDetailModalProps) {
  if (!checklist) return null;

  const getDriverName = (id: string) => {
    const d = drivers.find(drv => drv.id === id);
    return d ? d.name : `Motorista (${id.substring(0, 6)})`;
  };

  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    return v ? `${v.brand} ${v.model} (${v.plate})` : `Veículo (${id.substring(0, 6)})`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm print:bg-white print:text-black">
      <div className="w-full max-w-lg bg-background border border-outline-variant rounded-xl p-6 relative shadow-2xl space-y-4 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-3 border-b border-outline-variant/60">
          <h3 className="text-base font-black uppercase text-primary font-geist flex items-center justify-center gap-1.5">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            <span>Laudo de Vistoria de Veículo</span>
          </h3>
          <p className="text-[10px] text-outline mt-0.5">
            Tipo: <span className="font-bold text-primary uppercase">{checklist.type}</span>
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs print:bg-slate-100">
          <p>
            <span className="text-outline font-semibold">Motorista:</span>{" "}
            <span className="font-bold text-primary">{getDriverName(checklist.driverId)}</span>
          </p>
          <p>
            <span className="text-outline font-semibold">Veículo Placa:</span>{" "}
            <span className="font-bold text-primary">{getVehicleInfo(checklist.vehicleId)}</span>
          </p>
          <p>
            <span className="text-outline font-semibold">Data da Vistoria:</span>{" "}
            <span className="font-medium font-mono">{checklist.date}</span>
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider font-geist">Itens Inspecionados</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-primary">
            {Object.entries(checklist.items).map(([key, val]) => (
              <div key={key} className="flex items-center space-x-2">
                <span className={`material-symbols-outlined text-[16px] ${val ? "text-emerald-500" : "text-red-500"}`}>
                  {val ? "check_circle" : "cancel"}
                </span>
                <span className="capitalize">{key === "crlv" ? "CRLV / Documento" : key.replace(/([A-Z])/g, " $1")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Photos Viewer */}
        {checklist.photos && Object.values(checklist.photos).some(Boolean) && (
          <div className="space-y-2 pt-3 border-t border-outline-variant/60">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider font-geist">Evidências Fotográficas</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(checklist.photos).map(([key, imgUrl]) => {
                if (!imgUrl) return null;
                const label = PHOTO_LABELS[key as keyof typeof PHOTO_LABELS] || key;
                return (
                  <div key={key} className="relative group border border-outline-variant rounded-lg overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-1 print:border-slate-300">
                    <img 
                      src={imgUrl} 
                      alt={label} 
                      className="w-full h-16 object-cover cursor-pointer hover:scale-105 transition-transform rounded" 
                      onClick={() => window.open(imgUrl, "_blank")} 
                    />
                    <span className="text-[9px] font-bold text-primary mt-1">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-outline-variant/60 text-center space-y-1">
          <p className="text-[10px] text-outline uppercase font-semibold">Assinatura de Concordância</p>
          {checklist.signatureImage ? (
            <div className="my-2 p-2 bg-white border border-outline-variant rounded-lg inline-block print:border-slate-350">
              <img src={checklist.signatureImage} alt="Assinatura Digital" className="max-h-16 object-contain mx-auto" />
            </div>
          ) : (
            <p className="font-geist text-sm font-black italic text-primary mt-1">/ {checklist.signatureText} /</p>
          )}
          <p className="font-geist text-[9px] text-outline">Condutor/Conferente: {checklist.signatureText}</p>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center space-x-1.5 print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Vistoria</span>
        </button>
      </div>
    </div>
  );
}
