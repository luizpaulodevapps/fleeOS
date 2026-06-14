"use client";

import React, { useState } from "react";
import { Claim } from "../_lib/types";
import { Car, AlertCircle, CheckCircle, RefreshCw, Key, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ClaimReserveVehicleProps {
  claims: Claim[];
  vehicles: any[];
  drivers: any[];
  onReload: () => Promise<void>;
  updateClaim: (claimId: string, payload: Partial<Claim>) => Promise<void>;
}

export function ClaimReserveVehicle({
  claims,
  vehicles,
  drivers,
  onReload,
  updateClaim
}: ClaimReserveVehicleProps) {
  const { addDocument, updateDocument } = useAuth();
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Filter claims that need reserve vehicle and don't have one assigned yet
  const pendingReserveClaims = claims.filter(
    (c) => c.reserveVehicleRequired && !c.reserveVehicleAssigned && c.status !== "closed"
  );

  // List of active available vehicles (not currently rented / not damaged)
  const availableVehicles = vehicles.filter(
    (v) => v.status === "active" || v.status === "disponivel"
  );

  const getDriverName = (driverId: string) => {
    const d = drivers.find((drv) => drv.id === driverId);
    return d ? d.name : "Motorista Desconhecido";
  };

  const getVehiclePlate = (vehicleId: string) => {
    const v = vehicles.find((veh) => veh.id === vehicleId);
    return v ? `${v.brand} ${v.model} (${v.plate})` : "Veículo Desconhecido";
  };

  const handleAssignReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimId || !selectedVehicleId) return;

    try {
      setAssigning(true);
      const claim = claims.find((c) => c.id === selectedClaimId);
      if (!claim) return;

      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (!vehicle) return;

      // 1. Create a vehicle assignment
      const newAsg = await addDocument("vehicle_assignments", {
        tenantId: "tenant-1",
        driverId: claim.driverId,
        vehicleId: vehicle.id,
        active: true,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: `Carro reserva vinculado devido ao sinistro ${claim.claimNumber}.`
      });

      // 2. Update reserve vehicle status in DB
      await updateDocument("vehicles", vehicle.id, { status: "locado" });

      // 3. Update the claim with reserve details
      await updateClaim(claim.id, {
        reserveVehicleAssigned: true,
        reserveVehicleId: vehicle.id,
        reserveAssignmentId: newAsg.id
      });

      alert(`Carro reserva ${vehicle.brand} ${vehicle.model} (${vehicle.plate}) vinculado com sucesso!`);
      setSelectedClaimId("");
      setSelectedVehicleId("");
      await onReload();
    } catch (err) {
      console.error(err);
      alert("Erro ao atribuir carro reserva.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top banner */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-primary font-geist flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            <span>Alocação de Veículo Reserva</span>
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Gerencie os motoristas que estão com carros parados na oficina e necessitam de veículo reserva.
            Atribua de forma rápida entre a frota disponível e controle os prazos.
          </p>
        </div>
        <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-around">
          <div className="text-center">
            <span className="text-[10px] text-outline uppercase font-bold">Aguardando Reserva</span>
            <p className="text-2xl font-black text-red-600">{pendingReserveClaims.length}</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/60" />
          <div className="text-center">
            <span className="text-[10px] text-outline uppercase font-bold">Frota Disponível</span>
            <p className="text-2xl font-black text-emerald-600">{availableVehicles.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form area */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1">
            <Key className="w-4 h-4 text-primary" />
            <span>Vincular Carro Reserva</span>
          </p>

          <form onSubmit={handleAssignReserve} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5 font-geist">
                Motorista Acometido (Sinistrado)
              </label>
              <select
                required
                value={selectedClaimId}
                onChange={(e) => setSelectedClaimId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              >
                <option value="">Selecione o motorista/sinistro...</option>
                {pendingReserveClaims.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getDriverName(c.driverId)} - {c.claimNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5 font-geist">
                Veículo Reserva Disponível
              </label>
              <select
                required
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              >
                <option value="">Selecione o veículo reserva...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.plate}) - {v.color || "Preto"}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={assigning || !selectedClaimId || !selectedVehicleId}
              className="w-full py-3 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{assigning ? "Alocando..." : "Confirmar Vínculo de Reserva"}</span>
            </button>
          </form>
        </div>

        {/* List of active reserves */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist">
            Histórico Recente de Alocações
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-[10px] text-outline uppercase font-bold">
                  <th className="py-2">Sinistro</th>
                  <th className="py-2">Motorista</th>
                  <th className="py-2">Carro Principal</th>
                  <th className="py-2">Carro Reserva</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {claims.filter((c) => c.reserveVehicleRequired).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-outline italic">
                      Nenhum motorista necessitou de carro reserva até o momento.
                    </td>
                  </tr>
                ) : (
                  claims
                    .filter((c) => c.reserveVehicleRequired)
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-primary">{c.claimNumber}</td>
                        <td className="py-3 font-medium">{getDriverName(c.driverId)}</td>
                        <td className="py-3 text-on-surface-variant font-mono">{getVehiclePlate(c.vehicleId)}</td>
                        <td className="py-3 text-primary font-bold font-mono">
                          {c.reserveVehicleAssigned ? getVehiclePlate(c.reserveVehicleId || "") : "Aguardando"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              c.reserveVehicleAssigned
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                            }`}
                          >
                            {c.reserveVehicleAssigned ? "Atribuído" : "Aguardando"}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
