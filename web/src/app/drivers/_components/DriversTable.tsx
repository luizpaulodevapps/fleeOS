import React from "react";
import { Search, Users, Car, Phone, FileText, Printer, Trash2 } from "lucide-react";
import { Driver } from "../_lib/types";
import { calcDriverScore, getScoreTier, getCNHStatus } from "../_lib/helpers";

interface DriversTableProps {
  filteredDrivers: Driver[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  getDriverBalance: (id: string) => number;
  assignments: any[];
  vehicles: any[];
  occurrences: any[];
  claims: any[];
  infractions: any[];
  onOpenProntuario: (driver: Driver) => void;
  onOpenDossier: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
  can: (perm: string) => boolean;
}

export function DriversTable({
  filteredDrivers,
  searchTerm,
  setSearchTerm,
  getDriverBalance,
  assignments,
  vehicles,
  occurrences,
  claims,
  infractions,
  onOpenProntuario,
  onOpenDossier,
  onDeleteDriver,
  can
}: DriversTableProps) {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-outline" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
        />
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {filteredDrivers.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <Users className="w-12 h-12 text-outline mx-auto mb-4" />
            <p className="text-base font-semibold text-primary font-geist">Nenhum motorista cadastrado</p>
            <p className="text-xs mt-1">Inicie a gestão de prontuários de motoristas para a frota.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr className="text-on-surface-variant font-semibold uppercase">
                  <th className="px-6 py-4">Ficha Motorista</th>
                  <th className="px-6 py-4">CPF / Telefone</th>
                  <th className="px-6 py-4">CNH & CONDUTAX</th>
                  <th className="px-6 py-4">Score & CNH Pts</th>
                  <th className="px-6 py-4">Saldo Conta</th>
                  <th className="px-6 py-4">Restrições</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-on-surface">
                {filteredDrivers.map((driver) => {
                  const balance = getDriverBalance(driver.id);
                  const locks = driver.activeLocks || [];
                  const activeAsg = assignments.find(a => a.active && a.driverId === driver.id);
                  const linkedVeh = activeAsg ? vehicles.find(v => v.id === activeAsg.vehicleId) : null;
                  const score = calcDriverScore(driver.id, driver.cnhSuspended, occurrences, claims, infractions);
                  const scoreTier = getScoreTier(score);
                  const cnhSt = getCNHStatus(driver.cnhPoints || 0);

                  return (
                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Foto & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={driver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                            alt={driver.name}
                            className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                          />
                          <div>
                            <p className="font-bold text-primary text-sm">{driver.name}</p>
                            <div className="flex items-center space-x-1 mt-0.5 text-on-surface-variant">
                              <span className="text-[9px] font-mono">ID: {driver.id.substring(0, 8)}</span>
                              {linkedVeh && (
                                <span className="inline-flex items-center text-[9px] bg-slate-100 text-primary font-bold px-1 py-0.5 rounded border border-slate-200">
                                  <Car className="w-2.5 h-2.5 mr-0.5" />
                                  <span>{linkedVeh.plate}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CPF / Phone */}
                      <td className="px-6 py-4">
                        <p className="font-semibold">{driver.cpf}</p>
                        <p className="text-on-surface-variant flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-outline" />
                          <span>{driver.phone}</span>
                        </p>
                      </td>

                      {/* CNH & CONDUTAX */}
                      <td className="px-6 py-4">
                        <p className="font-semibold">Nº {driver.cnhNumber} ({driver.cnhCategory || "AB"})</p>
                        <p className="text-on-surface-variant mt-0.5">
                          Venc: {driver.cnhExpiration ? new Date(driver.cnhExpiration).toLocaleDateString("pt-BR") : "N/A"}
                        </p>
                        <p className="text-on-surface-variant mt-0.5 text-[10px]">Condutax: {driver.condutax || "N/A"}</p>
                      </td>

                      {/* Score & CNH Points */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${scoreTier.bg} ${scoreTier.text} ${scoreTier.border} border`}>
                          {scoreTier.emoji} {scoreTier.label} — {score}pts
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cnhSt.bg} ${cnhSt.text} ${cnhSt.border}`}>
                            CNH: {driver.cnhPoints || 0}pts — {cnhSt.label}
                          </span>
                          {driver.cnhSuspended && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-500/15 text-red-700 border border-red-500/25">⛔ Suspensa</span>
                          )}
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-6 py-4">
                        <p className={`font-bold font-mono text-sm ${balance >= 0 ? "text-emerald-600" : "text-error"}`}>
                          R$ {balance.toFixed(2)}
                        </p>
                      </td>

                      {/* Locks */}
                      <td className="px-6 py-4">
                        {locks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {locks.map((l: string) => (
                              <span key={l} className="inline-flex items-center text-[9px] bg-red-500/10 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-500/15">
                                {l}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                            Sem Restrição
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onOpenProntuario(driver)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded bg-surface-container border border-outline-variant text-primary hover:bg-surface-container-high transition-all"
                            title="Prontuário Completo"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Prontuário</span>
                          </button>
                          <button
                            onClick={() => onOpenDossier(driver)}
                            className="p-1.5 rounded bg-surface-container border border-outline-variant text-primary hover:bg-surface-container-high transition-all"
                            title="Gerar Dossiê Consolidado"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {can("drivers.delete") && (
                            <button
                              onClick={() => onDeleteDriver(driver.id)}
                              className="p-1.5 rounded bg-surface-container border border-outline-variant text-error hover:bg-red-500/5 transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
