"use client";

import React from "react";

interface VehicleLocksTabProps {
  selectedVehicle: any;
  isReadOnly: (vehicle: any) => boolean;
  vehicleLocks: string[];
  setVehicleLocks: React.Dispatch<React.SetStateAction<string[]>>;
  lockJustification: Record<string, string>;
  setLockJustification: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSaveLocks: () => Promise<void>;
}

export function VehicleLocksTab({
  selectedVehicle,
  isReadOnly,
  vehicleLocks,
  setVehicleLocks,
  lockJustification,
  setLockJustification,
  handleSaveLocks
}: VehicleLocksTabProps) {
  const readOnly = isReadOnly(selectedVehicle);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Bloqueios & Travas do Carro</h4>
        <p className="text-xs text-on-surface-variant">
          Defina bloqueios ativos no veículo. Carros com travas ativas podem mudar automaticamente seu status operacional.
        </p>
      </div>

      <div className="space-y-4">
        {[
          { id: "Manutenção", desc: "Veículo bloqueado por necessidade de reparo mecânico crítico." },
          { id: "Sinistro", desc: "Veículo parado devido a avarias graves de colisão de trânsito." },
          { id: "Documentação", desc: "Restrição por licenciamento CRLV ou IPVA pendentes de pagamento." },
          { id: "Apreensão", desc: "Ativo apreendido pelo órgão municipal regulador de trânsito." }
        ].map(l => {
          const isChecked = vehicleLocks.includes(l.id);
          return (
            <div key={l.id} className="bg-slate-50 border border-outline-variant p-4 rounded-xl space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={readOnly}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setVehicleLocks([...vehicleLocks, l.id]);
                    } else {
                      setVehicleLocks(vehicleLocks.filter(item => item !== l.id));
                    }
                  }}
                  className="w-4 h-4 accent-red-650 mt-0.5"
                />
                <div>
                  <span className="font-bold text-primary text-xs">{l.id}</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{l.desc}</p>
                </div>
              </label>

              {isChecked && (
                <div className="pl-7">
                  <label className="block text-[9px] font-bold uppercase text-outline mb-1">Motivo / Justificativa</label>
                  <input
                    type="text"
                    required
                    disabled={readOnly}
                    placeholder="Explique a restrição..."
                    value={lockJustification[l.id] || ""}
                    onChange={(e) => setLockJustification({
                      ...lockJustification,
                      [l.id]: e.target.value
                    })}
                    className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={handleSaveLocks}
            className="px-6 py-2 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
          >
            Salvar Bloqueios
          </button>
        </div>
      )}
    </div>
  );
}
