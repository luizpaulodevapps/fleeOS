"use client";

import React from "react";
import { Zap } from "lucide-react";

interface VehicleCurrentOpTabProps {
  selectedVehicle: any;
  assignments: any[];
  drivers: any[];
  contracts: any[];
  maintenancePlan: any[];
}

export function VehicleCurrentOpTab({
  selectedVehicle,
  assignments,
  drivers,
  contracts,
  maintenancePlan
}: VehicleCurrentOpTabProps) {
  const activeAssignment = assignments.find(a => a.active && a.vehicleId === selectedVehicle.id);
  const activeDriver = activeAssignment ? drivers.find(d => d.id === activeAssignment.driverId) : null;
  const activeContractDoc = activeAssignment?.contractId
    ? contracts.find(c => c.id === activeAssignment.contractId)
    : contracts.find(c => activeDriver && c.driverId === activeDriver.id && (c.status === "active" || c.status === "Ativo"));

  const deliveryDate = activeAssignment?.startDate ? new Date(activeAssignment.startDate) : null;
  const daysInOp = deliveryDate ? Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const dailyRate = Number(activeContractDoc?.dailyRate || activeContractDoc?.dailyAmountSnapshot || 0);
  const revenueGenerated = dailyRate * daysInOp;

  const nextInsurance = selectedVehicle.insuranceExpiration;
  const nextCrlv = selectedVehicle.registrationExpiration;
  const nextMaint = maintenancePlan
    .filter(m => m.vehicleId === selectedVehicle.id)
    .sort((a, b) => a.nextServiceKm - b.nextServiceKm)[0];

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" />
        Operação Atual
      </h4>

      {/* Status principal */}
      <div className={`rounded-2xl p-5 ${
        activeAssignment
          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
          : selectedVehicle.status === "maintenance" ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
          : "bg-gradient-to-br from-slate-700 to-slate-900 text-white"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase opacity-70">Status Operacional</span>
          <span className="text-lg font-black uppercase">
            {activeAssignment ? "LOCADO" : selectedVehicle.status === "maintenance" ? "OFICINA" : "DISPONÍVEL"}
          </span>
        </div>

        {activeDriver ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-black">
                {activeDriver.name?.charAt(0)}
              </div>
              <div>
                <p className="font-black text-base">{activeDriver.name}</p>
                <p className="text-xs opacity-70">{activeDriver.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-[10px] opacity-70 font-bold uppercase">Dias em Operação</p>
                <p className="text-xl font-black">{daysInOp}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-[10px] opacity-70 font-bold uppercase">Diária</p>
                <p className="text-xl font-black">R$ {dailyRate.toFixed(0)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 col-span-2">
                <p className="text-[10px] opacity-70 font-bold uppercase">Receita Gerada (est.)</p>
                <p className="text-2xl font-black">{revenueGenerated.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-80 mt-2">
            {selectedVehicle.status === "maintenance" ? "Em reparo na oficina" : "Nenhum motorista vinculado — veículo livre na frota"}
          </p>
        )}
      </div>

      {/* Contrato ativo */}
      {activeContractDoc && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">📄 Contrato Ativo</h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-bold">Início</p>
              <p className="font-mono font-bold text-slate-800">{activeContractDoc.startDate ? new Date(activeContractDoc.startDate).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Término</p>
              <p className="font-mono font-bold text-slate-800">{activeContractDoc.endDate ? new Date(activeContractDoc.endDate).toLocaleDateString("pt-BR") : "Indeterminado"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Taxa Diária</p>
              <p className="font-mono font-bold text-slate-800">R$ {Number(activeContractDoc.dailyRate || activeContractDoc.dailyAmountSnapshot || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                (activeContractDoc.status === "active" || activeContractDoc.status === "Ativo")
                  ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}>{activeContractDoc.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Próximos vencimentos */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">⏰ Próximos Vencimentos</h5>
        <div className="space-y-2">
          {[
            { label: "Seguro", date: nextInsurance },
            { label: "CRLV / Licenciamento", date: nextCrlv }
          ].map(item => {
            if (!item.date) return null;
            const d = new Date(item.date);
            const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">{item.label}</span>
                <span className={`font-mono font-bold ${
                  diff < 0 ? "text-red-600" : diff <= 30 ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {diff < 0 ? `Vencido há ${Math.abs(diff)}d` : diff <= 30 ? `Vence em ${diff}d` : d.toLocaleDateString("pt-BR")}
                </span>
              </div>
            );
          })}
          {nextMaint && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Próxima manutenção ({nextMaint.itemName})</span>
              <span className={`font-mono font-bold ${
                nextMaint.nextServiceKm <= selectedVehicle.mileage ? "text-red-600" : "text-slate-700"
              }`}>{nextMaint.nextServiceKm.toLocaleString("pt-BR")} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
