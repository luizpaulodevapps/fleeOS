"use client";

import React from "react";
import { Plus, Search, Gauge, Wrench, ShieldAlert, Link2, Printer, Trash2 } from "lucide-react";

interface VehiclesOverviewProps {
  filteredVehicles: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openNewVehicle: () => void;
  openVehicleProntuario: (vehicle: any) => void;
  handleOpenDossier: (vehicle: any) => void;
  handleDeleteVehicle: (id: string) => void;
  getActiveDriver: (vehicleId: string) => string | null;
  getExpirationBadge: (dateStr: string) => React.ReactNode;
  regulatoryProcesses: any[];
  municipalRegulations: any[];
}

export const VehiclesOverview: React.FC<VehiclesOverviewProps> = ({
  filteredVehicles,
  searchTerm,
  setSearchTerm,
  openNewVehicle,
  openVehicleProntuario,
  handleOpenDossier,
  handleDeleteVehicle,
  getActiveDriver,
  getExpirationBadge,
  regulatoryProcesses = [],
  municipalRegulations = []
}) => {
  // Helper for Status Badge and Operational Checklist Block mapping
  const getStatusBadge = (veh: any) => {
    const status = veh.status;
    const process = regulatoryProcesses.find(rp => rp.vehicleId === veh.id);
    let isNonLocatable = false;
    let pendingReasons: string[] = [];

    if (status === "active" && process) {
      const reg = municipalRegulations.find(r => r.city === process.city);
      const checklist = process.checklist;
      if (checklist) {
        const needsTaximeter = process.operationType === "taxi" && (!reg || reg.requiresTaxiMeter);
        const needsDtp = process.operationType === "taxi" && (!reg || reg.requiresPermitInspection);

        if (!checklist.invoice) pendingReasons.push("NF");
        if (!checklist.crv) pendingReasons.push("CRV");
        if (!checklist.renavam) pendingReasons.push("Renavam");
        if (!checklist.insuranceActive) pendingReasons.push("Seguro");
        if (!checklist.trackerInstalled) pendingReasons.push("Rastreador");
        if (needsTaximeter && (!checklist.taximeterInstalled || !checklist.taximeterCalibrated)) pendingReasons.push("Taxímetro");
        if (process.operationType === "taxi" && !checklist.permitIssued) pendingReasons.push("Alvará");
        if (needsDtp && !checklist.dtpInspectionApproved) pendingReasons.push("Vistoria DTP");

        if (pendingReasons.length > 0) {
          isNonLocatable = true;
        }
      }
    }

    const badgeStyles: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      locado: "bg-blue-100 text-blue-700",
      maintenance: "bg-amber-100 text-amber-700",
      sinistrado: "bg-red-100 text-red-700",
      acquisition: "bg-purple-100 text-purple-750 text-purple-700",
      awaiting_docs: "bg-indigo-100 text-indigo-700",
      in_registration: "bg-cyan-100 text-cyan-700",
      awaiting_dtp: "bg-teal-100 text-teal-700",
      awaiting_taximeter: "bg-orange-100 text-orange-700",
      awaiting_gnv: "bg-rose-100 text-rose-700",
      homologated: "bg-lime-100 text-lime-700",
      blocked_regulatory: "bg-red-105 bg-red-100 text-red-800 border border-red-200",
      decommissioning: "bg-yellow-100 text-yellow-850 text-yellow-700",
      for_sale: "bg-stone-100 text-stone-700",
      sold: "bg-gray-100 text-gray-500 line-through"
    };

    const badgeLabels: Record<string, string> = {
      active: "Disponível",
      locado: "Locado",
      maintenance: "Oficina",
      sinistrado: "Sinistrado",
      acquisition: "Em aquisição",
      awaiting_docs: "Aguardando docs",
      in_registration: "Em credenciamento",
      awaiting_dtp: "Aguardando DTP",
      awaiting_taximeter: "Aguardando taxímetro",
      awaiting_gnv: "Aguardando GNV",
      homologated: "Homologado",
      blocked_regulatory: "Bloqueio Reg.",
      decommissioning: "Descredenciando",
      for_sale: "À venda",
      sold: "Vendido"
    };

    const style = badgeStyles[status] || "bg-slate-100 text-slate-700";
    const label = badgeLabels[status] || status;

    return (
      <div className="flex flex-col gap-1 items-start">
        <span className={`px-2 py-0.5 font-black text-[9px] uppercase rounded ${style}`}>
          {label}
        </span>
        {isNonLocatable && (
          <span className="px-1.5 py-0.5 bg-amber-500 text-white font-black text-[8.5px] leading-none rounded flex items-center gap-1 shadow-sm" title={`Pendente: ${pendingReasons.join(", ")}`}>
            <ShieldAlert className="w-2.5 h-2.5" />
            NÃO LOCÁVEL ({pendingReasons.join(", ")})
          </span>
        )}
        {veh.activeLocks && veh.activeLocks.length > 0 && (
          <span className="px-1.5 py-0.5 bg-red-500 text-white font-black text-[8px] rounded flex items-center gap-0.5">
            <ShieldAlert className="w-2.5 h-2.5" />
            BLOQUEADO
          </span>
        )}
      </div>
    );
  };

  // Stats counters
  const total = filteredVehicles.length;
  const active = filteredVehicles.filter(v => v.status === "active").length;
  const locado = filteredVehicles.filter(v => v.status === "locado").length;
  const maint = filteredVehicles.filter(v => v.status === "maintenance").length;
  
  // Custom locked/blocked/non-locatable calculation
  const locked = filteredVehicles.filter(v => {
    if (v.status === "blocked_regulatory") return true;
    if (v.activeLocks && v.activeLocks.length > 0) return true;
    
    // Check if non-locatable active
    const process = regulatoryProcesses.find(rp => rp.vehicleId === v.id);
    if (v.status === "active" && process) {
      const reg = municipalRegulations.find(r => r.city === process.city);
      const checklist = process.checklist;
      if (checklist) {
        const needsTaximeter = process.operationType === "taxi" && (!reg || reg.requiresTaxiMeter);
        const needsDtp = process.operationType === "taxi" && (!reg || reg.requiresPermitInspection);
        
        if (!checklist.invoice || !checklist.crv || !checklist.renavam || !checklist.insuranceActive || !checklist.trackerInstalled) return true;
        if (needsTaximeter && (!checklist.taximeterInstalled || !checklist.taximeterCalibrated)) return true;
        if (process.operationType === "taxi" && !checklist.permitIssued) return true;
        if (needsDtp && !checklist.dtpInspectionApproved) return true;
      }
    }
    return false;
  }).length;

  // GNV/Taximeter alarm alerts
  const gnvAlerts = filteredVehicles.filter(v => {
    const process = regulatoryProcesses.find(rp => rp.vehicleId === v.id);
    if (!process || !process.gnvDetails?.hasGnv || !process.gnvDetails?.cylinderExpiry) return false;
    const expiry = new Date(process.gnvDetails.cylinderExpiry);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  }).length;

  const taximeterAlerts = filteredVehicles.filter(v => {
    const process = regulatoryProcesses.find(rp => rp.vehicleId === v.id);
    if (!process || process.operationType !== "taxi") return false;
    const checklist = process.checklist;
    return checklist && (!checklist.taximeterInstalled || !checklist.taximeterCalibrated);
  }).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Counters Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total de Veículos", val: total, color: "text-primary bg-slate-50 border-slate-200" },
          { label: "Disponíveis (Livres)", val: active, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "Locados em Contrato", val: locado, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Em Manutenção (OS)", val: maint, color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Com Restrição / Bloqueados", val: locked, color: "text-red-700 bg-red-50 border-red-200" }
        ].map((c, i) => (
          <div key={i} className={`p-4 border rounded-xl shadow-sm ${c.color}`}>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">{c.label}</p>
            <h3 className="text-2xl font-extrabold mt-1">{c.val}</h3>
          </div>
        ))}
      </div>

      {/* Alarm Badges */}
      {(gnvAlerts > 0 || taximeterAlerts > 0) && (
        <div className="flex gap-2 flex-wrap bg-white p-3 border border-outline-variant rounded-xl shadow-sm">
          {gnvAlerts > 0 && (
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              {gnvAlerts} cilindro(s) GNV vencendo em 60 dias
            </span>
          )}
          {taximeterAlerts > 0 && (
            <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              {taximeterAlerts} taxímetro(s) irregular(es) ou sem calibragem
            </span>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo ou marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-xs bg-surface-container-lowest focus:outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={openNewVehicle}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Marca / Modelo</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Placa</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Condutor Atual</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Odômetro</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Seguro / Licenc.</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Status</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {filteredVehicles.map(veh => {
              const driver = getActiveDriver(veh.id);
              return (
                <tr key={veh.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {veh.photoUrl ? (
                        <img src={veh.photoUrl} alt="Foto" className="w-10 h-7 rounded object-cover border border-outline-variant" />
                      ) : (
                        <div className="w-10 h-7 rounded bg-slate-100 flex items-center justify-center border border-outline-variant text-[10px] text-outline font-bold">
                          FROTA
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-primary">{veh.brand} {veh.model}</h4>
                        <p className="text-[10px] text-outline mt-0.5">{veh.color} | {veh.fuelType} | {veh.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 uppercase">{veh.plate}</td>
                  <td className="px-6 py-4 font-medium">
                    {driver ? (
                      <span className="text-slate-800 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {driver}
                      </span>
                    ) : (
                      <span className="text-outline italic">Estoque Livre</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span>{Number(veh.mileage).toLocaleString("pt-BR")} km</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between gap-2 text-[10px]">
                        <span className="text-slate-400">Seguro:</span>
                        {getExpirationBadge(veh.insuranceExpiration)}
                      </div>
                      <div className="flex justify-between gap-2 text-[10px]">
                        <span className="text-slate-400">CRLV:</span>
                        {getExpirationBadge(veh.registrationExpiration)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(veh)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openVehicleProntuario(veh)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-outline-variant hover:bg-slate-100 text-primary font-bold rounded-lg text-[10px]"
                      >
                        <Wrench className="w-3.5 h-3.5 text-slate-500" />
                        <span>Prontuário</span>
                      </button>
                      <button
                        onClick={() => handleOpenDossier(veh)}
                        className="p-1.5 bg-white border border-outline-variant hover:bg-slate-100 text-slate-700 rounded-lg"
                        title="Imprimir Dossiê"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(veh.id)}
                        className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
