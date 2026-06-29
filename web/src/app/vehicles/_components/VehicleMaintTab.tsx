"use client";

import React, { useState } from "react";
import { 
  PlusCircle, Calendar, Clock, Wrench, CheckCircle2, 
  AlertTriangle, Play, X, Trash2, ShieldAlert, 
  DollarSign, Gauge, ClipboardCheck
} from "lucide-react";
import { MaintFormState } from "../_lib/types";

interface VehicleMaintTabProps {
  selectedVehicle: any;
  maintenancePlan: any[];
  maintenances: any[];
  maintForm: MaintFormState;
  setMaintForm: React.Dispatch<React.SetStateAction<MaintFormState>>;
  handleAddMaintenance: (e: React.FormEvent) => Promise<void>;
  isReadOnly: (vehicle: any) => boolean;
  
  // Workshop integration props
  workOrders: any[];
  appointments: any[];
  handleScheduleWorkshopAppointment: (vehicleId: string, title: string, date: string, time: string, notes: string, type?: string) => Promise<void>;
  handleCreateWorkshopOS: (vehicleId: string, description: string, mileage: number) => Promise<void>;
  handleCancelAppointment: (appId: string, vehicleId: string) => Promise<void>;
  handleStartOSFromAppointment: (app: any) => Promise<void>;
  handleCompleteWorkshopOS: (woId: string, vehicleId: string, mileage: number, cost: number, description: string, planItemId?: string) => Promise<void>;
}

export function VehicleMaintTab({
  selectedVehicle,
  maintenancePlan,
  maintenances,
  maintForm,
  setMaintForm,
  handleAddMaintenance,
  isReadOnly,
  workOrders = [],
  appointments = [],
  handleScheduleWorkshopAppointment,
  handleCreateWorkshopOS,
  handleCancelAppointment,
  handleStartOSFromAppointment,
  handleCompleteWorkshopOS
}: VehicleMaintTabProps) {
  const readOnly = isReadOnly(selectedVehicle);
  const [activeSubTab, setActiveSubTab] = useState<"plan" | "workshop" | "history">("plan");

  // Modal / Form States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedTitle, setSchedTitle] = useState("");
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedNotes, setSchedNotes] = useState("");
  const [schedLinkedItem, setSchedLinkedItem] = useState<any>(null);

  const [isOpenOsModalOpen, setIsOpenOsModalOpen] = useState(false);
  const [osDesc, setOsDesc] = useState("");
  const [osMileage, setOsMileage] = useState(selectedVehicle.mileage.toString());
  const [osLinkedItem, setOsLinkedItem] = useState<any>(null);

  const [isCompleteOsModalOpen, setIsCompleteOsModalOpen] = useState(false);
  const [compWoId, setCompWoId] = useState("");
  const [compMileage, setCompMileage] = useState(selectedVehicle.mileage.toString());
  const [compCost, setCompCost] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compLinkedItemId, setCompLinkedItemId] = useState<string | undefined>(undefined);

  // Filters for current vehicle
  const vehiclePlanItems = maintenancePlan.filter(p => p.vehicleId === selectedVehicle.id);
  const activeAppointments = appointments.filter(a => a.vehicleId === selectedVehicle.id && a.status === "Agendado");
  const openWorkOrders = workOrders.filter(w => w.vehicleId === selectedVehicle.id && (w.status === "Aberta" || w.status === "in_progress"));
  const completedWorkOrders = workOrders.filter(w => w.vehicleId === selectedVehicle.id && (w.status === "completed" || w.status === "Concluída" || w.status === "Entregue"));
  const manualMaintenances = maintenances.filter(m => m.vehicleId === selectedVehicle.id);

  // Combined History sorted by date desc
  const combinedHistory = [
    ...manualMaintenances.map(m => ({
      id: m.id,
      date: m.date,
      type: m.type || "Manutenção",
      description: m.description,
      cost: m.cost,
      mileage: m.mileage,
      source: "manual"
    })),
    ...completedWorkOrders.map(w => ({
      id: w.id,
      date: w.completedAt || w.createdAt,
      type: "Preventiva / Oficina",
      description: w.description,
      cost: w.totalCost || 0,
      mileage: w.mileage || selectedVehicle.mileage,
      source: "workshop"
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Action Triggers
  const openScheduleModal = (item: any) => {
    setSchedLinkedItem(item);
    setSchedTitle(`Revisão Preventiva: ${item.itemName}`);
    setSchedDate("");
    setSchedTime("");
    setSchedNotes("");
    setIsScheduleOpen(true);
  };

  const submitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle || !schedDate || !schedTime) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      await handleScheduleWorkshopAppointment(
        selectedVehicle.id,
        schedTitle,
        schedDate,
        schedTime,
        schedNotes,
        "Preventiva"
      );
      setIsScheduleOpen(false);
      alert("Visita à oficina agendada com sucesso!");
    } catch (e) {
      alert("Erro ao realizar o agendamento.");
    }
  };

  const openOsModal = (item: any) => {
    setOsLinkedItem(item);
    setOsDesc(`OS Preventiva: ${item.itemName}`);
    setOsMileage(selectedVehicle.mileage.toString());
    setIsOpenOsModalOpen(true);
  };

  const submitOpenOs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!osDesc || !osMileage) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      await handleCreateWorkshopOS(selectedVehicle.id, osDesc, Number(osMileage));
      setIsOpenOsModalOpen(false);
      alert("Ordem de Serviço aberta na oficina com sucesso!");
      setActiveSubTab("workshop");
    } catch (e) {
      alert("Erro ao abrir Ordem de Serviço.");
    }
  };

  const openCompleteOsModal = (wo: any, linkedItemId?: string) => {
    setCompWoId(wo.id);
    setCompMileage(selectedVehicle.mileage.toString());
    setCompCost("");
    setCompDesc(wo.description);
    setCompLinkedItemId(linkedItemId);
    setIsCompleteOsModalOpen(true);
  };

  const submitCompleteOs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compMileage || !compCost || !compDesc) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      await handleCompleteWorkshopOS(
        compWoId,
        selectedVehicle.id,
        Number(compMileage),
        Number(compCost),
        compDesc,
        compLinkedItemId
      );
      setIsCompleteOsModalOpen(false);
      alert("Ordem de Serviço concluída e integrada com sucesso!");
      setActiveSubTab("history");
    } catch (e) {
      alert("Erro ao concluir a Ordem de Serviço.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex border-b border-outline-variant/60 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap pb-1">
        {[
          { id: "plan", label: "Plano Preventivo por KM", count: vehiclePlanItems.length },
          { id: "workshop", label: "Fluxo Oficina (OS & Agendamentos)", count: activeAppointments.length + openWorkOrders.length },
          { id: "history", label: "Histórico de Manutenção", count: combinedHistory.length }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeSubTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeSubTab === tab.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PLAN TAB */}
      {activeSubTab === "plan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Status dos Componentes do Plano</h4>
            <span className="text-[10px] bg-slate-100 border px-2 py-0.5 rounded text-on-surface-variant font-mono">
              Quilometragem Atual: <strong>{Number(selectedVehicle.mileage).toLocaleString("pt-BR")} KM</strong>
            </span>
          </div>

          {vehiclePlanItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-outline-variant border-dashed rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-outline/40 mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant italic">Nenhum plano preventivo configurado para este veículo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiclePlanItems.map((item) => {
                const kmDiff = item.nextServiceKm - selectedVehicle.mileage;
                const isOverdue = kmDiff <= 0;
                const isDueSoon = !isOverdue && kmDiff <= 1000;
                
                // Calculate progress
                const totalInterval = item.intervalKm || 10000;
                const completedKm = selectedVehicle.mileage - item.lastServiceKm;
                const rawProgress = (completedKm / totalInterval) * 100;
                const progress = Math.max(0, Math.min(100, rawProgress));

                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all hover:shadow-md ${
                      isOverdue 
                        ? "bg-red-50/50 border-red-200" 
                        : isDueSoon 
                        ? "bg-amber-50/50 border-amber-200" 
                        : "bg-surface border-outline-variant"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-primary text-sm flex items-center gap-1.5">
                          {isOverdue && <AlertTriangle className="w-4 h-4 text-error" />}
                          {isDueSoon && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                          <span>{item.itemName}</span>
                        </h5>
                        <p className="text-[10px] text-outline mt-0.5">
                          Última troca: {Number(item.lastServiceKm).toLocaleString("pt-BR")} km | Próxima: {Number(item.nextServiceKm).toLocaleString("pt-BR")} km
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        isOverdue 
                          ? "bg-red-100 text-red-700" 
                          : isDueSoon 
                          ? "bg-amber-100 text-amber-700" 
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {isOverdue ? "Vencido" : isDueSoon ? "Próximo" : "OK"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-medium">
                        <span className="text-on-surface-variant">Ciclo da Revisão</span>
                        <span className={isOverdue ? "text-error font-bold" : isDueSoon ? "text-amber-700 font-bold" : "text-emerald-700"}>
                          {isOverdue 
                            ? `Vencido há ${Math.abs(kmDiff).toLocaleString("pt-BR")} km` 
                            : isDueSoon 
                            ? `Vence em ${kmDiff.toLocaleString("pt-BR")} km` 
                            : `Restam ${kmDiff.toLocaleString("pt-BR")} km`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isOverdue ? "bg-red-500" : isDueSoon ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {!readOnly && (
                      <div className="flex justify-end gap-2 pt-1.5 border-t border-outline-variant/60">
                        <button
                          type="button"
                          onClick={() => openScheduleModal(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-outline-variant hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Agendar Oficina</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openOsModal(item)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-white rounded-lg text-[10px] font-bold ${
                            isOverdue || isDueSoon 
                              ? "bg-amber-600 hover:bg-amber-700" 
                              : "bg-primary hover:opacity-90"
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Abrir OS</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WORKSHOP TAB */}
      {activeSubTab === "workshop" && (
        <div className="space-y-6">
          {/* Active OS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Ordens de Serviço Abertas (Oficina)</h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => openOsModal({ itemName: "Geral / Diagnóstico" })}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-on-primary hover:opacity-90 rounded-md text-[10px] font-bold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nova OS Avulsa</span>
                </button>
              )}
            </div>

            {openWorkOrders.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-outline-variant rounded-xl text-xs text-on-surface-variant italic">
                Nenhuma Ordem de Serviço aberta na oficina para este veículo.
              </div>
            ) : (
              <div className="space-y-3">
                {openWorkOrders.map((wo) => (
                  <div key={wo.id} className="p-4 bg-white border border-outline-variant rounded-xl flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                          OS-{wo.id.substring(0, 5).toUpperCase()}
                        </span>
                        <h5 className="font-bold text-slate-800 text-xs">{wo.description}</h5>
                      </div>
                      <p className="text-[10px] text-outline">
                        Aberta em: {new Date(wo.createdAt).toLocaleDateString()} às {new Date(wo.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => openCompleteOsModal(wo)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Concluir OS / Executar</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Appointments */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Visitas Agendadas</h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => openScheduleModal({ itemName: "Revisão Geral" })}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-outline-variant hover:bg-slate-50 text-slate-700 rounded-md text-[10px] font-bold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Novo Agendamento</span>
                </button>
              )}
            </div>

            {activeAppointments.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-outline-variant rounded-xl text-xs text-on-surface-variant italic">
                Nenhum agendamento pendente na oficina para este veículo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAppointments.map((app) => (
                  <div key={app.id} className="p-4 bg-white border border-outline-variant rounded-xl flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-slate-800 text-xs">{app.title}</h5>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold uppercase">
                          {app.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-on-surface-variant font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {new Date(app.scheduledDate + "T00:00:00").toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {app.scheduledTime}</span>
                      </div>
                      {app.notes && (
                        <p className="text-[10px] text-outline bg-slate-50 p-2 rounded italic">
                          obs: {app.notes}
                        </p>
                      )}
                    </div>

                    {!readOnly && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/60">
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(app.id, selectedVehicle.id)}
                          className="flex items-center gap-1 p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-[10px]"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartOSFromAppointment(app)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-on-primary hover:opacity-90 rounded-lg text-[10px] font-bold"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar OS</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeSubTab === "history" && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Histórico Completo de Manutenções (OS & Registros)</h4>
          
          <div className="overflow-hidden border border-outline-variant rounded-xl shadow-sm bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-outline-variant sticky top-0">
                <tr className="font-bold text-on-surface-variant">
                  <th className="p-3">Data</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3">Serviço/Peças</th>
                  <th className="p-3 text-right">KM</th>
                  <th className="p-3 text-right">Custo total</th>
                </tr>
              </thead>
              <tbody>
                {combinedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center italic text-on-surface-variant">Nenhuma ida à oficina registrada.</td>
                  </tr>
                ) : (
                  combinedHistory.map((m) => (
                    <tr key={m.id} className="border-t border-outline-variant/60 hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-on-surface-variant">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                          {m.source === "workshop" ? "Oficina Externa" : "Manual"}
                        </span>
                      </td>
                      <td className="p-3 text-primary font-bold">{m.description}</td>
                      <td className="p-3 text-right font-mono">{Number(m.mileage).toLocaleString()} km</td>
                      <td className="p-3 text-right text-emerald-600 font-bold font-mono">
                        {m.cost > 0 ? `R$ ${m.cost.toFixed(2)}` : "R$ 0,00"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: AGENDAR VISITA OFICINA ─── */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="bg-slate-50 px-5 py-4 border-b border-outline-variant flex items-center justify-between">
              <h4 className="font-bold text-primary text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Agendar na Oficina</span>
              </h4>
              <button onClick={() => setIsScheduleOpen(false)} className="p-1 rounded hover:bg-slate-200 text-outline">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitSchedule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Título do Agendamento</label>
                <input
                  type="text"
                  required
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Observações / Sintomas</label>
                <textarea
                  placeholder="Descreva problemas observados ou observações da revisão..."
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90"
                >
                  Agendar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ABRIR OS NA OFICINA ─── */}
      {isOpenOsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="bg-slate-50 px-5 py-4 border-b border-outline-variant flex items-center justify-between">
              <h4 className="font-bold text-primary text-sm flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-primary" />
                <span>Abrir OS na Oficina</span>
              </h4>
              <button onClick={() => setIsOpenOsModalOpen(false)} className="p-1 rounded hover:bg-slate-200 text-outline">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitOpenOs} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Descrição do Serviço (OS)</label>
                <input
                  type="text"
                  required
                  value={osDesc}
                  onChange={(e) => setOsDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Odômetro Atual (KM)</label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-2.5 w-4 h-4 text-outline" style={{ display: 'none' }} />
                  <input
                    type="number"
                    required
                    value={osMileage}
                    onChange={(e) => setOsMileage(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  A abertura da OS enviará este veículo imediatamente para o status de <strong>"Em Manutenção"</strong>, bloqueando novos contratos ou devoluções até a sua conclusão.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setIsOpenOsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90"
                >
                  Iniciar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CONCLUIR E EXECUTAR OS ─── */}
      {isCompleteOsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="bg-slate-50 px-5 py-4 border-b border-outline-variant flex items-center justify-between">
              <h4 className="font-bold text-primary text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Concluir e Registrar Serviço</span>
              </h4>
              <button onClick={() => setIsCompleteOsModalOpen(false)} className="p-1 rounded hover:bg-slate-200 text-outline">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitCompleteOs} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Descrição Final dos Serviços Executados</label>
                <input
                  type="text"
                  required
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Odômetro Final (KM)</label>
                  <input
                    type="number"
                    required
                    value={compMileage}
                    onChange={(e) => setCompMileage(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Custo Total (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-outline" style={{ display: 'none' }} />
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={compCost}
                      onChange={(e) => setCompCost(e.target.value)}
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  Esta ação irá:
                  <br />- Marcar a OS como <strong>Concluída</strong>.
                  <br />- Reativar o veículo para <strong>Disponível (Livre)</strong>.
                  <br />- Registrar a despesa financeira e o histórico de manutenção.
                  <br />- Atualizar e resetar o odômetro do item correspondente do plano preventivo.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setIsCompleteOsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  Confirmar Conclusão (Executar)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
