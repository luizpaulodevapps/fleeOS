import React, { useState } from "react";
import {
  Search,
  Users,
  Car,
  Phone,
  FileText,
  Printer,
  Trash2,
  ShieldAlert,
  DollarSign,
  AlertTriangle,
  Activity,
  User,
  ArrowLeft,
  Calendar,
  FileSignature
} from "lucide-react";
import { Driver } from "../_lib/types";
import { calcDriverScore, getScoreTier, getCNHStatus } from "../_lib/helpers";

interface DriversTableProps {
  drivers: Driver[];
  activeDriver: Driver | null;
  setActiveDriver: (driver: Driver | null) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  getDriverBalance: (id: string) => number;
  assignments: any[];
  vehicles: any[];
  occurrences: any[];
  claims: any[];
  infractions: any[];
  timeline: any[];
  onOpenProntuario: (driver: Driver) => void;
  onOpenDossier: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
  can: (perm: string) => boolean;
}

export function DriversTable({
  drivers,
  activeDriver,
  setActiveDriver,
  searchTerm,
  setSearchTerm,
  getDriverBalance,
  assignments,
  vehicles,
  occurrences,
  claims,
  infractions,
  timeline,
  onOpenProntuario,
  onOpenDossier,
  onDeleteDriver,
  can
}: DriversTableProps) {
  
  const filteredDrivers = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    return drivers.filter(d =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cpf?.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, "")) ||
      d.rg?.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""))
    );
  }, [drivers, searchTerm]);

  // If no driver is selected in workspace, show the Search UI
  if (!activeDriver) {
    return (
      <div className="space-y-6">
        {/* Search Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-primary font-geist">Pesquisa de Motorista</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Digite o nome completo, CPF ou RG do motorista para carregar o prontuário eletrônico de faturamento e infrações.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-outline" />
            <input
              type="text"
              placeholder="Digite o Nome, CPF ou RG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-geist"
            />
          </div>

          {searchTerm.trim() && (
            <div className="space-y-3 pt-2 max-h-[400px] overflow-y-auto pr-1">
              <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider">
                Resultados da Busca ({filteredDrivers.length})
              </h4>
              
              {filteredDrivers.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-lg">
                  <Users className="w-8 h-8 text-outline mx-auto mb-2" />
                  <p className="text-xs font-semibold text-primary">Nenhum motorista correspondente</p>
                  <p className="text-[10px] mt-0.5">Revise os termos da pesquisa e tente novamente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredDrivers.map((driver) => {
                    const activeAsg = assignments.find(a => a.active && a.driverId === driver.id);
                    const linkedVeh = activeAsg ? vehicles.find(v => v.id === activeAsg.vehicleId) : null;
                    return (
                      <div
                        key={driver.id}
                        onClick={() => {
                          setActiveDriver(driver);
                          setSearchTerm("");
                        }}
                        className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant hover:border-primary/55 rounded-xl cursor-pointer shadow-sm transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={driver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                            alt={driver.name}
                            className="w-12 h-12 rounded-full object-cover border border-outline-variant group-hover:border-primary/40 transition-colors"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-primary group-hover:text-primary-dark transition-colors">
                              {driver.name}
                            </h4>
                            <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                              CPF: {driver.cpf} • RG: {driver.rg || "N/A"}
                            </p>
                            {linkedVeh && (
                              <span className="inline-flex items-center text-[9px] bg-slate-200/60 text-primary font-bold px-1.5 py-0.5 rounded border border-slate-300 mt-1.5">
                                <Car className="w-2.5 h-2.5 mr-1" />
                                <span>{linkedVeh.plate} ({linkedVeh.brand} {linkedVeh.model})</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            driver.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                              : "bg-red-500/10 text-red-500 border-red-500/25"
                          }`}>
                            {driver.status === "active" ? "Ativo" : "Bloqueado"}
                          </span>
                          <p className="text-[10px] font-bold text-outline mt-2.5 flex items-center justify-end gap-1">
                            <span>Selecionar</span>
                            <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!searchTerm.trim() && (
            <div className="p-4 bg-slate-50 border border-outline-variant/60 rounded-lg text-center text-on-surface-variant text-[11px] font-medium flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">info</span>
              <span>Todos os prontuários e históricos financeiros serão carregados após a seleção.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loaded Driver Workspace Dashboard view
  const balance = getDriverBalance(activeDriver.id);
  const locks = activeDriver.activeLocks || [];
  const activeAsg = assignments.find(a => a.active && a.driverId === activeDriver.id);
  const linkedVeh = activeAsg ? vehicles.find(v => v.id === activeAsg.vehicleId) : null;
  const score = calcDriverScore(activeDriver.id, activeDriver.cnhSuspended, occurrences, claims, infractions);
  const scoreTier = getScoreTier(score);

  // Filter recents
  const drvTimeline = timeline.filter(t => t.entityType === "driver" && t.entityId === activeDriver.id).slice(0, 5);
  const drvOccurrences = occurrences.filter(o => o.driverId === activeDriver.id);
  const drvInfractions = infractions.filter(i => i.driverId === activeDriver.id);

  // Combine occurrences and infractions into a single list
  const recentIssues = [
    ...drvOccurrences.map(o => ({ type: "Ocorrência", date: o.date, desc: o.description, label: o.type, isOcc: true })),
    ...drvInfractions.map(i => ({ type: "Infração", date: i.date, desc: i.description, label: `AIT: ${i.ait} (${i.points} pts)`, isOcc: false }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Workspace Header Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={activeDriver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={activeDriver.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-primary font-geist">{activeDriver.name}</h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                activeDriver.status === "active"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                  : "bg-red-500/10 text-red-500 border-red-500/25"
              }`}>
                {activeDriver.status === "active" ? "Ativo" : "Bloqueado"}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              ID: {activeDriver.id} • CPF: {activeDriver.cpf} • RG: {activeDriver.rg || "N/A"}
            </p>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-outline" />
              <span>{activeDriver.phone}</span>
              <span className="text-outline mx-1.5">•</span>
              <Calendar className="w-3.5 h-3.5 text-outline" />
              <span>Admissão: {activeDriver.admissionDate ? new Date(activeDriver.admissionDate).toLocaleDateString("pt-BR") : "N/A"}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveDriver(null)}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-outline-variant text-outline hover:text-primary hover:border-primary transition-all self-start md:self-center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Buscar Outro</span>
        </button>
      </div>

      {/* KPI Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Balance Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-geist">Conta Corrente</span>
            <DollarSign className="w-4 h-4 text-outline" />
          </div>
          <div className="space-y-1">
            <p className={`text-2xl font-black font-mono leading-none ${balance >= 0 ? "text-emerald-600" : "text-error"}`}>
              R$ {balance.toFixed(2)}
            </p>
            <p className="text-[10px] text-on-surface-variant">Saldo operacional consolidado</p>
          </div>
        </div>

        {/* KPI 2: Vehicle Assignment */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-geist">Vínculo Ativo</span>
            <Car className="w-4 h-4 text-outline" />
          </div>
          <div className="space-y-1">
            {linkedVeh ? (
              <>
                <p className="text-base font-black text-primary leading-none font-mono">
                  {linkedVeh.plate}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {linkedVeh.brand} {linkedVeh.model}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-amber-600 leading-none">Sem veículo vinculado</p>
                <p className="text-[10px] text-on-surface-variant">Pronto para nova locação</p>
              </>
            )}
          </div>
        </div>

        {/* KPI 3: CNH Detran Status */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-geist">Situação CNH</span>
            <FileSignature className="w-4 h-4 text-outline" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xl font-black text-primary font-mono leading-none">
                {activeDriver.cnhPoints || 0} pts
              </p>
              {activeDriver.cnhSuspended && (
                <span className="text-[9px] font-bold px-1 rounded bg-red-100 text-red-700 border border-red-200">
                  Suspensa
                </span>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Validade: {activeDriver.cnhExpiration ? new Date(activeDriver.cnhExpiration).toLocaleDateString("pt-BR") : "N/A"}
            </p>
          </div>
        </div>

        {/* KPI 4: Score / Score Tier */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-geist">Score Operacional</span>
            <ShieldAlert className="w-4 h-4 text-outline" />
          </div>
          <div className="space-y-1">
            <p className={`text-base font-black leading-none ${scoreTier.text}`}>
              {scoreTier.emoji} {scoreTier.label}
            </p>
            <p className="text-[10px] text-on-surface-variant">Classificação interna: {score} pts</p>
          </div>
        </div>
      </div>

      {/* Locks, Actions, and Recent logs Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Actions & Rules (Locks) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4 font-geist">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
              Ações Rápidas do Operador
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onOpenProntuario(activeDriver)}
                className="w-full flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-lg bg-primary text-on-primary hover:opacity-90 transition-all shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Abrir Prontuário Operacional</span>
              </button>
              
              <button
                onClick={() => onOpenDossier(activeDriver)}
                className="w-full flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high text-primary transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Gerar Dossiê Impresso</span>
              </button>

              {can("drivers.delete") && (
                <button
                  onClick={() => onDeleteDriver(activeDriver.id)}
                  className="w-full flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-lg border border-red-200 bg-red-50/20 hover:bg-red-50 text-error transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Arquivar Prontuário</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Locks Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4 font-geist">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
              Trava Reguladora / Bloqueios
            </h3>
            
            {locks.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-error">
                  <ShieldAlert className="w-4 h-4 text-error" />
                  <span>Motorista possui bloqueios ativos</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {locks.map((l: string) => (
                    <span
                      key={l}
                      className="text-[10px] font-bold px-2.5 py-1 rounded bg-red-500/10 text-red-600 border border-red-500/15"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Regularizado: sem restrições operacionais.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column (Col Span 2): Recent Timeline and Issues */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 font-geist">
          
          {/* Recent Audit Logs Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2 flex items-center justify-between">
              <span>Linha do Tempo Recente</span>
              <Activity className="w-4 h-4 text-outline" />
            </h3>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {drvTimeline.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Nenhuma atividade registrada.</p>
              ) : (
                drvTimeline.map((t: any) => (
                  <div key={t.id} className="border-l-2 border-primary pl-3 py-0.5 space-y-1">
                    <p className="text-[10px] font-bold text-primary font-mono leading-none">
                      {new Date(t.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs font-bold text-on-surface leading-snug">{t.title}</p>
                    <p className="text-[10px] text-on-surface-variant leading-normal">{t.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Disciplinary issues and Infractions */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2 flex items-center justify-between">
              <span>Ocorrências & Infrações Recentes</span>
              <AlertTriangle className="w-4 h-4 text-outline" />
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {recentIssues.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Nenhuma infração ou advertência.</p>
              ) : (
                recentIssues.map((issue: any, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      issue.isOcc
                        ? "bg-amber-500/5 border-amber-500/15"
                        : "bg-red-500/5 border-red-500/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          issue.isOcc
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {issue.type}: {issue.label}
                      </span>
                      <span className="text-[9px] font-mono text-outline">
                        {new Date(issue.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface leading-normal font-medium">{issue.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
