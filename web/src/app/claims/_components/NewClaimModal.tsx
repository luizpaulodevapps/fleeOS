import React, { useState, useEffect } from "react";
import { X, ShieldAlert, MapPin } from "lucide-react";
import { NewClaimForm } from "../_lib/types";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: any[];
  vehicles: any[];
  onSubmit: (form: NewClaimForm) => Promise<void>;
}

export function NewClaimModal({ isOpen, onClose, drivers, vehicles, onSubmit }: NewClaimModalProps) {
  const [newClaimForm, setNewClaimForm] = useState<NewClaimForm>({
    vehicleId: "",
    driverId: "",
    occurrenceDate: new Date().toISOString().split("T")[0] + "T12:00",
    severity: "light",
    location: "",
    description: "",
    involvedThirdParties: false,
    hasVictims: false,
    vehicleDrivable: true
  });

  useEffect(() => {
    if (isOpen && drivers.length > 0 && vehicles.length > 0) {
      setNewClaimForm(prev => ({
        ...prev,
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id
      }));
    }
  }, [isOpen, drivers, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newClaimForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="text-lg font-bold text-primary font-geist flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Abertura de Ocorrência de Sinistro</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Cadastre as informações da colisão ou acidente do motorista.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Motorista</label>
              <select
                required
                value={newClaimForm.driverId}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, driverId: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
              >
                <option value="">Selecione...</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Veículo</label>
              <select
                required
                value={newClaimForm.vehicleId}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, vehicleId: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
              >
                <option value="">Selecione...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Data / Hora Ocorrência</label>
              <input
                type="datetime-local"
                required
                value={newClaimForm.occurrenceDate}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, occurrenceDate: e.target.value })}
                className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Severidade Inicial</label>
              <select
                value={newClaimForm.severity}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, severity: e.target.value as any })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
              >
                <option value="light">Leve (Arranhão, amassado superficial)</option>
                <option value="medium">Média (Colisão menor com peças afetadas)</option>
                <option value="severe">Grave (Estrutura afetada, reboque)</option>
                <option value="total_loss">Perda Total</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Local do Acidente</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2 w-4 h-4 text-outline" />
              <input
                type="text"
                required
                placeholder="Ex: Av. Paulista, nº 1000, São Paulo - SP"
                value={newClaimForm.location}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, location: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Descrição do Sinistro</label>
            <textarea
              rows={3}
              required
              placeholder="Relato detalhado de como ocorreu o acidente e danos visíveis..."
              value={newClaimForm.description}
              onChange={(e) => setNewClaimForm({ ...newClaimForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none resize-none"
            />
          </div>

          <div className="bg-slate-50 border border-outline-variant/60 rounded-xl p-4 space-y-3 font-semibold">
            <p className="text-[10px] text-outline uppercase font-bold">Variáveis de Triagem</p>
            <div className="flex justify-between items-center">
              <span>Envolveu Terceiros?</span>
              <input
                type="checkbox"
                checked={newClaimForm.involvedThirdParties}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, involvedThirdParties: e.target.checked })}
                className="w-4 h-4 text-primary focus:ring-primary border-outline rounded"
              />
            </div>

            <div className="flex justify-between items-center">
              <span>Houve Vítimas?</span>
              <input
                type="checkbox"
                checked={newClaimForm.hasVictims}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, hasVictims: e.target.checked })}
                className="w-4 h-4 text-primary focus:ring-primary border-outline rounded"
              />
            </div>

            <div className="flex justify-between items-center">
              <span>Veículo Andando (Mecânica OK)?</span>
              <input
                type="checkbox"
                checked={newClaimForm.vehicleDrivable}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, vehicleDrivable: e.target.checked })}
                className="w-4 h-4 text-primary focus:ring-primary border-outline rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface-variant border border-outline-variant rounded-lg font-semibold"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90"
            >
              Abrir Ocorrência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
