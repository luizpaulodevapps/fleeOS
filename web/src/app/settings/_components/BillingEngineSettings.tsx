"use client";

import React from "react";
import { 
  Activity, FileText, Sliders, CalendarRange, CalendarOff, Calculator, 
  History, Plus, CheckSquare, FileSpreadsheet, Play, Save, X, User
} from "lucide-react";
import { 
  ProfileFormFields, RuleFormFields, CalendarFormFields, 
  SuspensionFormFields, SimIndividual, SimBulk 
} from "../_lib/types";

interface BillingEngineSettingsProps {
  can: (permission: string) => boolean;
  dailyProfiles: any[];
  billingRules: any[];
  businessCalendar: any[];
  billingSuspensions: any[];
  billingRuns: any[];
  driversList: any[];
  billingSubTab: string;
  setBillingSubTab: (tab: string) => void;
  
  // Form fields
  profileFormFields: ProfileFormFields;
  setProfileFormFields: React.Dispatch<React.SetStateAction<ProfileFormFields>>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  editingProfile: any | null;
  setEditingProfile: (profile: any | null) => void;
  
  ruleFormFields: RuleFormFields;
  setRuleFormFields: React.Dispatch<React.SetStateAction<RuleFormFields>>;
  isRuleModalOpen: boolean;
  setIsRuleModalOpen: (isOpen: boolean) => void;
  editingRule: any | null;
  setEditingRule: (rule: any | null) => void;
  
  calendarFormFields: CalendarFormFields;
  setCalendarFormFields: React.Dispatch<React.SetStateAction<CalendarFormFields>>;
  isCalendarModalOpen: boolean;
  setIsCalendarModalOpen: (isOpen: boolean) => void;
  editingCalendar: any | null;
  setEditingCalendar: (event: any | null) => void;
  
  suspensionFormFields: SuspensionFormFields;
  setTransitionFormFields?: any; // naming fallback
  setSuspensionFormFields: React.Dispatch<React.SetStateAction<SuspensionFormFields>>;
  isSuspensionModalOpen: boolean;
  setIsSuspensionModalOpen: (isOpen: boolean) => void;
  editingSuspension: any | null;
  setEditingSuspension: (suspension: any | null) => void;
  
  simIndividual: SimIndividual;
  setSimIndividual: React.Dispatch<React.SetStateAction<SimIndividual>>;
  simIndividualResults: any | null;
  setSimIndividualResults: (results: any | null) => void;
  
  simBulk: SimBulk;
  setSimBulk: React.Dispatch<React.SetStateAction<SimBulk>>;
  simBulkResults: any | null;
  setSimBulkResults: (results: any | null) => void;
  
  selectedBillingRun: any | null;
  setSelectedBillingRun: (run: any | null) => void;
  billingRunItemsList: any[];
  setBillingRunItemsList: (items: any[]) => void;
  selectedRunItemDetails: any | null;
  setSelectedRunItemDetails: (item: any | null) => void;
  
  // Handlers
  handleSaveProfile: (e: React.FormEvent) => Promise<void>;
  handleSaveRule: (e: React.FormEvent) => Promise<void>;
  handleSaveCalendarEvent: (e: React.FormEvent) => Promise<void>;
  handleSaveSuspension: (e: React.FormEvent) => Promise<void>;
  handleDeleteProfile: (id: string) => Promise<void>;
  handleDeleteRule: (id: string) => Promise<void>;
  handleDeleteCalendarEvent: (id: string) => Promise<void>;
  handleDeleteSuspension: (id: string) => Promise<void>;
  handleImportDefaultHolidays: () => Promise<void>;
  handleRunIndividualSimulation: () => void;
  handleRunBulkSimulation: () => void;
  handleProcessBillingRun: () => Promise<void>;
  handleInspectBillingRun: (run: any) => Promise<void>;
}

export function BillingEngineSettings({
  can,
  dailyProfiles,
  billingRules,
  businessCalendar,
  billingSuspensions,
  billingRuns,
  driversList,
  billingSubTab,
  setBillingSubTab,
  profileFormFields,
  setProfileFormFields,
  isProfileModalOpen,
  setIsProfileModalOpen,
  editingProfile,
  setEditingProfile,
  ruleFormFields,
  setRuleFormFields,
  isRuleModalOpen,
  setIsRuleModalOpen,
  editingRule,
  setEditingRule,
  calendarFormFields,
  setCalendarFormFields,
  isCalendarModalOpen,
  setIsCalendarModalOpen,
  editingCalendar,
  setEditingCalendar,
  suspensionFormFields,
  setSuspensionFormFields,
  isSuspensionModalOpen,
  setIsSuspensionModalOpen,
  editingSuspension,
  setEditingSuspension,
  simIndividual,
  setSimIndividual,
  simIndividualResults,
  setSimIndividualResults,
  simBulk,
  setSimBulk,
  simBulkResults,
  setSimBulkResults,
  selectedBillingRun,
  setSelectedBillingRun,
  billingRunItemsList,
  setBillingRunItemsList,
  selectedRunItemDetails,
  setSelectedRunItemDetails,
  handleSaveProfile,
  handleSaveRule,
  handleSaveCalendarEvent,
  handleSaveSuspension,
  handleDeleteProfile,
  handleDeleteRule,
  handleDeleteCalendarEvent,
  handleDeleteSuspension,
  handleImportDefaultHolidays,
  handleRunIndividualSimulation,
  handleRunBulkSimulation,
  handleProcessBillingRun,
  handleInspectBillingRun
}: BillingEngineSettingsProps) {
  const weekdaysKeys: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];
  const weekdaysLetters = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist flex items-center gap-1.5">
          <Activity className="w-5 h-5 text-primary" />
          <span>Motor de Faturamento (Billing Engine)</span>
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Configure perfis de preços, regras de vigência, calendário corporativo, isenções e simule faturamento em lote.</p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-outline-variant gap-4 overflow-x-auto pb-px text-xs font-bold text-outline">
        {[
          { id: "profiles", label: "Perfis de Diária", icon: FileText },
          { id: "rules", label: "Regras de Cobrança", icon: Sliders },
          { id: "calendar", label: "Calendário Corporativo", icon: CalendarRange },
          { id: "suspensions", label: "Suspensões", icon: CalendarOff },
          { id: "simulator", label: "Simulador & Lançador", icon: Calculator },
          { id: "runs", label: "Histórico de Lotes", icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBillingSubTab(tab.id)}
              className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                billingSubTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent hover:text-on-surface"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab 1: PROFILES */}
      {billingSubTab === "profiles" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">Gerencie os perfis de preços e as vigências das diárias dos veículos.</p>
            {can("billing.edit") && (
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(null);
                  setProfileFormFields({ id: "", name: "", amount: 150, description: "", validFrom: new Date().toISOString().split("T")[0], validTo: "" });
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Perfil</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold text-outline">Nome do Perfil</th>
                  <th className="px-4 py-3 font-semibold text-outline">Valor Diário</th>
                  <th className="px-4 py-3 font-semibold text-outline">Vigência</th>
                  <th className="px-4 py-3 font-semibold text-outline">Descrição</th>
                  <th className="px-4 py-3 font-semibold text-outline text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {dailyProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-outline italic">Nenhum perfil cadastrado.</td>
                  </tr>
                ) : (
                  dailyProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-primary">{p.name}</td>
                      <td className="px-4 py-3 font-bold text-primary">R$ {Number(p.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {new Date(p.validFrom + "T12:00:00").toLocaleDateString("pt-BR")} até {p.validTo ? new Date(p.validTo + "T12:00:00").toLocaleDateString("pt-BR") : "Indeterminado"}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">{p.description}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {can("billing.edit") && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProfile(p);
                                setProfileFormFields({
                                  id: p.id,
                                  name: p.name,
                                  amount: p.amount,
                                  description: p.description,
                                  validFrom: p.validFrom,
                                  validTo: p.validTo || ""
                                });
                                setIsProfileModalOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-surface-container border border-outline-variant text-[10px] font-bold text-primary hover:bg-surface-container-high"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProfile(p.id)}
                              className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-650 hover:bg-red-500/20"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: RULES */}
      {billingSubTab === "rules" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">Associe perfis a regras com dias específicos da semana de cobrança e isenções.</p>
            {can("billing.edit") && (
              <button
                type="button"
                onClick={() => {
                  setEditingRule(null);
                  setRuleFormFields({
                    id: "",
                    profileId: dailyProfiles[0]?.id || "",
                    calendarId: "default",
                    weekdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
                    exemptHolidays: true,
                    exemptOptionalDays: true,
                    active: true
                  });
                  setIsRuleModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Regra</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold text-outline">Perfil</th>
                  <th className="px-4 py-3 font-semibold text-outline">Dias de Cobrança</th>
                  <th className="px-4 py-3 font-semibold text-outline">Feriados</th>
                  <th className="px-4 py-3 font-semibold text-outline">Facultativos</th>
                  <th className="px-4 py-3 font-semibold text-outline">Status</th>
                  <th className="px-4 py-3 font-semibold text-outline text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {billingRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-outline italic">Nenhuma regra cadastrada.</td>
                  </tr>
                ) : (
                  billingRules.map(r => {
                    const profName = dailyProfiles.find(p => p.id === r.profileId)?.name || "Perfil Desconhecido";
                    const days = [
                      { key: "monday", label: "S" },
                      { key: "tuesday", label: "T" },
                      { key: "wednesday", label: "Q" },
                      { key: "thursday", label: "Q" },
                      { key: "friday", label: "S" },
                      { key: "saturday", label: "S" },
                      { key: "sunday", label: "D" }
                    ];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-primary">{profName}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {days.map(d => {
                              const active = r.weekdays[d.key];
                              return (
                                <span
                                  key={d.key}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                    active
                                      ? "bg-primary text-on-primary"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                  title={d.key}
                                >
                                  {d.label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.exemptHolidays ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-605"}`}>
                            {r.exemptHolidays ? "Isento" : "Cobrado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.exemptOptionalDays ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-605"}`}>
                            {r.exemptOptionalDays ? "Isento" : "Cobrado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.active ? "bg-emerald-500/10 text-emerald-605 border border-emerald-500/25" : "bg-slate-100 text-slate-400"}`}>
                            {r.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {can("billing.edit") && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRule(r);
                                  setRuleFormFields({
                                    id: r.id,
                                    profileId: r.profileId,
                                    calendarId: r.calendarId,
                                    weekdays: { ...r.weekdays },
                                    exemptHolidays: r.exemptHolidays,
                                    exemptOptionalDays: r.exemptOptionalDays,
                                    active: r.active
                                  });
                                  setIsRuleModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-surface-container border border-outline-variant text-[10px] font-bold text-primary hover:bg-surface-container-high"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRule(r.id)}
                                className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-650 hover:bg-red-500/20"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: CORPORATE CALENDAR */}
      {billingSubTab === "calendar" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">Cadastre feriados locais, pontos facultativos, recessos da empresa ou suspensão geral.</p>
            <div className="flex gap-2">
              {can("billing.edit") && (
                <>
                  <button
                    type="button"
                    onClick={handleImportDefaultHolidays}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-xs font-bold text-primary hover:bg-surface-container-high transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Importar Feriados 2026</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCalendar(null);
                      setCalendarFormFields({ id: "", date: new Date().toISOString().split("T")[0], name: "", type: "holiday", chargeNormally: false });
                      setIsCalendarModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Evento</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold text-outline">Data do Evento</th>
                  <th className="px-4 py-3 font-semibold text-outline">Nome / Título</th>
                  <th className="px-4 py-3 font-semibold text-outline">Tipo de Evento</th>
                  <th className="px-4 py-3 font-semibold text-outline">Regra de Faturamento</th>
                  <th className="px-4 py-3 font-semibold text-outline text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {businessCalendar.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-outline italic">Nenhum feriado ou exceção cadastrado.</td>
                  </tr>
                ) : (
                  businessCalendar
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-primary">
                          {new Date(c.date + "T12:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 font-bold text-primary">{c.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.type === "holiday"
                              ? "bg-red-500/10 text-red-650 border border-red-500/20"
                              : c.type === "optional"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : c.type === "company_shutdown"
                              ? "bg-slate-900 text-white"
                              : "bg-blue-500/10 text-blue-600"
                          }`}>
                            {c.type === "holiday" ? "Feriado" : c.type === "optional" ? "Ponto Facultativo" : c.type === "company_shutdown" ? "Recesso da Frota" : "Manutenção Coletiva"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {c.chargeNormally ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> Cobrar Normalmente</span>
                          ) : (
                            <span className="text-amber-600 font-bold flex items-center gap-1"><CalendarOff className="w-3.5 h-3.5" /> Isenção Ativa</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {can("billing.edit") && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCalendar(c);
                                  setCalendarFormFields({
                                    id: c.id,
                                    date: c.date,
                                    name: c.name,
                                    type: c.type,
                                    chargeNormally: c.chargeNormally
                                  });
                                  setIsCalendarModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-surface-container border border-outline-variant text-[10px] font-bold text-primary hover:bg-surface-container-high"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCalendarEvent(c.id)}
                                className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-650 hover:bg-red-500/20"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 4: BILLING SUSPENSIONS */}
      {billingSubTab === "suspensions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">Suspenda o faturamento de motoristas temporariamente por afastamento médico, férias ou sinistros.</p>
            {can("billing.edit") && (
              <button
                type="button"
                onClick={() => {
                  setEditingSuspension(null);
                  setSuspensionFormFields({
                    id: "",
                    driverId: driversList[0]?.id || "",
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: new Date().toISOString().split("T")[0],
                    reason: "",
                    suspendCharges: true
                  });
                  setIsSuspensionModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Suspensão</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold text-outline">Motorista</th>
                  <th className="px-4 py-3 font-semibold text-outline">Período</th>
                  <th className="px-4 py-3 font-semibold text-outline">Motivo do Afastamento</th>
                  <th className="px-4 py-3 font-semibold text-outline">Efeito Financeiro</th>
                  <th className="px-4 py-3 font-semibold text-outline text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {billingSuspensions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-outline italic">Nenhuma suspensão temporária registrada.</td>
                  </tr>
                ) : (
                  billingSuspensions.map(s => {
                    const driverName = driversList.find(d => d.id === s.driverId)?.name || "Motorista Desconhecido";
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-primary">{driverName}</td>
                        <td className="px-4 py-3 text-on-surface-variant font-mono">
                          {new Date(s.startDate + "T12:00:00").toLocaleDateString("pt-BR")} até {new Date(s.endDate + "T12:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{s.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.suspendCharges ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-605"}`}>
                            {s.suspendCharges ? "Não Cobrar Diária" : "Cobrança Normal"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {can("billing.edit") && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSuspension(s);
                                  setSuspensionFormFields({
                                    id: s.id,
                                    driverId: s.driverId,
                                    startDate: s.startDate,
                                    endDate: s.endDate,
                                    reason: s.reason,
                                    suspendCharges: s.suspendCharges
                                  });
                                  setIsSuspensionModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-surface-container border border-outline-variant text-[10px] font-bold text-primary hover:bg-surface-container-high"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSuspension(s.id)}
                                className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-650 hover:bg-red-500/20"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 5: SIMULATOR & EXECUTION */}
      {billingSubTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel A: Individual Simulator */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm h-fit">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              <span>Simulador de Diárias Individual</span>
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">Simule e audite dia a dia a cobrança de um motorista específico em qualquer período.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Selecione o Motorista</label>
                <select
                  value={simIndividual.driverId}
                  onChange={(e) => setSimIndividual({ ...simIndividual, driverId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary font-sans"
                >
                  <option value="">Selecione...</option>
                  {driversList.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.cpf})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Data Início</label>
                <input
                  type="date"
                  value={simIndividual.startDate}
                  onChange={(e) => setSimIndividual({ ...simIndividual, startDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Data Fim</label>
                <input
                  type="date"
                  value={simIndividual.endDate}
                  onChange={(e) => setSimIndividual({ ...simIndividual, endDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunIndividualSimulation}
                  className="w-full py-2 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Simular</span>
                </button>
              </div>
            </div>

            {simIndividualResults && (
              <div className="space-y-3 pt-3 border-t border-outline-variant">
                <div className="flex justify-between items-center p-3 bg-slate-50 border border-outline-variant rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-primary">Resumo da Simulação</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Perfil: {simIndividualResults.profileName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">R$ {Number(simIndividualResults.totalAmount).toFixed(2)}</p>
                    <p className="text-[9px] text-on-surface-variant">{simIndividualResults.daysCharged} dias cobrados / {simIndividualResults.daysExempt} isentos</p>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-outline-variant/60 rounded-lg divide-y divide-outline-variant/40 text-[10px] bg-white">
                  {simIndividualResults.details.map((day: any) => (
                    <div key={day.date} className="flex items-center justify-between p-2 hover:bg-slate-50">
                      <span className="font-mono text-primary font-bold">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR")} ({day.dayOfWeek})
                      </span>
                      <span className="text-on-surface-variant truncate max-w-xs">{day.reason}</span>
                      <span className={`font-mono font-bold ${day.isCharged ? "text-emerald-600" : "text-amber-600"}`}>
                        {day.isCharged ? `R$ ${day.rate.toFixed(2)}` : "R$ 0,00"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel B: Bulk Simulator & Execution */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between h-fit">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                <span>Geração e Simulação de Faturamento em Massa</span>
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Gere em lote as cobranças de diárias de todos os motoristas ativos na plataforma com base nas regras vigentes.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Período Letivo Início</label>
                  <input
                    type="date"
                    value={simBulk.startDate}
                    onChange={(e) => setSimBulk({ ...simBulk, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Período Letivo Fim</label>
                  <input
                    type="date"
                    value={simBulk.endDate}
                    onChange={(e) => setSimBulk({ ...simBulk, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleRunBulkSimulation}
                    className="w-full py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Calculator className="w-3.5 h-3.5 text-white" />
                    <span>Simular Lote</span>
                  </button>
                </div>
              </div>

              {simBulkResults && (
                <div className="space-y-3 pt-3 border-t border-outline-variant text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-outline-variant/60">
                    <div className="text-center bg-white p-2 rounded border border-outline-variant/40">
                      <p className="text-base font-black text-primary font-geist">{simBulkResults.totalDrivers}</p>
                      <p className="text-[9px] text-outline font-bold uppercase">Motoristas</p>
                    </div>
                    <div className="text-center bg-white p-2 rounded border border-outline-variant/40">
                      <p className="text-base font-black text-primary font-geist">{simBulkResults.totalChargedDays}</p>
                      <p className="text-[9px] text-outline font-bold uppercase">Dias Cobr.</p>
                    </div>
                    <div className="text-center bg-white p-2 rounded border border-outline-variant/40">
                      <p className="text-base font-black text-primary font-geist">{simBulkResults.totalExemptDays}</p>
                      <p className="text-[9px] text-outline font-bold uppercase">Dias Isen.</p>
                    </div>
                    <div className="text-center bg-white p-2 rounded border border-outline-variant/40">
                      <p className="text-base font-black text-primary font-geist">{simBulkResults.failedCount}</p>
                      <p className="text-[9px] text-outline font-bold uppercase">S/ Contrato</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div>
                      <p className="font-bold text-emerald-700">Previsão de Cobrança Total</p>
                      <p className="text-[9px] text-on-surface-variant font-medium">Será postado em débito na conta corrente dos motoristas.</p>
                    </div>
                    <p className="text-xl font-black text-emerald-600 font-geist">R$ {Number(simBulkResults.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {simBulkResults && can("billing.edit") && (
              <button
                type="button"
                onClick={handleProcessBillingRun}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Efetivar Lote de Diárias no Extrato</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 6: BILLING RUNS HISTORY */}
      {billingSubTab === "runs" && (
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant">Consulte e audite as gerações financeiras em lote executadas no sistema.</p>

          <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold text-outline">Data de Processamento</th>
                  <th className="px-4 py-3 font-semibold text-outline">Período Cobrado</th>
                  <th className="px-4 py-3 font-semibold text-outline">Total Cobrado</th>
                  <th className="px-4 py-3 font-semibold text-outline">Motoristas Faturados</th>
                  <th className="px-4 py-3 font-semibold text-outline">Processado Por</th>
                  <th className="px-4 py-3 font-semibold text-outline text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {billingRuns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-outline italic">Nenhum lote faturado encontrado.</td>
                  </tr>
                ) : (
                  billingRuns
                    .slice()
                    .reverse()
                    .map(run => (
                      <tr key={run.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-primary">
                          {new Date(run.generatedAt || run.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant font-mono">
                          {new Date(run.periodStart + "T12:00:00").toLocaleDateString("pt-BR")} até {new Date(run.periodEnd + "T12:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 font-bold text-primary">R$ {Number(run.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{run.totalDrivers} motoristas</td>
                        <td className="px-4 py-3 text-on-surface-variant font-bold">{run.generatedBy}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspectBillingRun(run)}
                            className="px-2.5 py-1.5 rounded bg-surface-container border border-outline-variant font-bold hover:bg-surface-container-high transition-all text-[10px]"
                          >
                            Inspecionar Lote
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDIVIDUAL PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/65 backdrop-blur-sm">
          <form onSubmit={handleSaveProfile} className="w-full max-w-md bg-background border border-outline-variant rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto animate-none">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-primary border-b border-outline-variant pb-3 mb-4 font-geist">
              {editingProfile ? "Editar Perfil de Diária" : "Criar Perfil de Diária"}
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome do Perfil</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Táxi Convencional"
                  value={profileFormFields.name}
                  onChange={(e) => setProfileFormFields({ ...profileFormFields, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Valor Diário (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 150.00"
                  value={profileFormFields.amount}
                  onChange={(e) => setProfileFormFields({ ...profileFormFields, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1">Início da Vigência</label>
                  <input
                    type="date"
                    required
                    value={profileFormFields.validFrom}
                    onChange={(e) => setProfileFormFields({ ...profileFormFields, validFrom: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1">Fim da Vigência (Opcional)</label>
                  <input
                    type="date"
                    value={profileFormFields.validTo}
                    onChange={(e) => setProfileFormFields({ ...profileFormFields, validTo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cobrança padrão para veículos populares..."
                  value={profileFormFields.description}
                  onChange={(e) => setProfileFormFields({ ...profileFormFields, description: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INDIVIDUAL RULE MODAL */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/65 backdrop-blur-sm">
          <form onSubmit={handleSaveRule} className="w-full max-w-md bg-background border border-outline-variant rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto animate-none">
            <button
              type="button"
              onClick={() => setIsRuleModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-primary border-b border-outline-variant pb-3 mb-4 font-geist">
              {editingRule ? "Editar Regra de Cobrança" : "Criar Regra de Cobrança"}
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Perfil de Diária</label>
                <select
                  required
                  value={ruleFormFields.profileId}
                  onChange={(e) => setRuleFormFields({ ...ruleFormFields, profileId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary font-sans"
                >
                  <option value="">Selecione o Perfil...</option>
                  {dailyProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {Number(p.amount).toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-2">Dias da Semana para Cobrança</label>
                <div className="flex gap-2 justify-between">
                  {weekdaysKeys.map((day, idx) => {
                    const active = ruleFormFields.weekdays[day];
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setRuleFormFields({
                          ...ruleFormFields,
                          weekdays: { ...ruleFormFields.weekdays, [day]: !active }
                        })}
                        className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                          active 
                            ? "bg-primary text-on-primary shadow-sm" 
                            : "bg-surface-container-low text-on-surface-variant border border-outline-variant hover:bg-surface-container"
                        }`}
                        title={day.charAt(0).toUpperCase() + day.slice(1)}
                      >
                        {weekdaysLetters[idx]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline-variant/60 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ruleFormFields.exemptHolidays}
                    onChange={(e) => setRuleFormFields({ ...ruleFormFields, exemptHolidays: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <div>
                    <p className="font-bold text-primary">Dar Isenção nos Feriados</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline-variant/60 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ruleFormFields.exemptOptionalDays}
                    onChange={(e) => setRuleFormFields({ ...ruleFormFields, exemptOptionalDays: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <div>
                    <p className="font-bold text-primary">Dar Isenção nos Pontos Facultativos</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline-variant/60 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ruleFormFields.active}
                    onChange={(e) => setRuleFormFields({ ...ruleFormFields, active: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <div>
                    <p className="font-bold text-primary">Esta Regra está Ativa</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Salvar Regra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INDIVIDUAL CALENDAR EVENT MODAL */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/65 backdrop-blur-sm">
          <form onSubmit={handleSaveCalendarEvent} className="w-full max-w-md bg-background border border-outline-variant rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto animate-none">
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-primary border-b border-outline-variant pb-3 mb-4 font-geist">
              {editingCalendar ? "Editar Evento" : "Criar Evento no Calendário"}
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={calendarFormFields.date}
                  onChange={(e) => setCalendarFormFields({ ...calendarFormFields, date: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome do Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Feriado de São Paulo"
                  value={calendarFormFields.name}
                  onChange={(e) => setCalendarFormFields({ ...calendarFormFields, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Tipo de Evento</label>
                <select
                  required
                  value={calendarFormFields.type}
                  onChange={(e) => setCalendarFormFields({ ...calendarFormFields, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary font-sans"
                >
                  <option value="holiday">Feriado Nacional / Estadual</option>
                  <option value="optional">Ponto Facultativo</option>
                  <option value="maintenance">Manutenção Coletiva</option>
                  <option value="company_shutdown">Recesso da Frota</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline-variant/60 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={calendarFormFields.chargeNormally}
                    onChange={(e) => setCalendarFormFields({ ...calendarFormFields, chargeNormally: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <div>
                    <p className="font-bold text-primary">Cobrar Diária Normalmente (Sem Isenção)</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Salvar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INDIVIDUAL BILLING SUSPENSION MODAL */}
      {isSuspensionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/65 backdrop-blur-sm">
          <form onSubmit={handleSaveSuspension} className="w-full max-w-md bg-background border border-outline-variant rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto animate-none">
            <button
              type="button"
              onClick={() => setIsSuspensionModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-primary border-b border-outline-variant pb-3 mb-4 font-geist">
              {editingSuspension ? "Editar Suspensão" : "Cadastrar Suspensão Temporária"}
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Motorista Beneficiário</label>
                <select
                  required
                  value={suspensionFormFields.driverId}
                  onChange={(e) => setSuspensionFormFields({ ...suspensionFormFields, driverId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary font-sans"
                >
                  <option value="">Selecione...</option>
                  {driversList.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.cpf})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={suspensionFormFields.startDate}
                    onChange={(e) => setSuspensionFormFields({ ...suspensionFormFields, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1">Data Fim</label>
                  <input
                    type="date"
                    required
                    value={suspensionFormFields.endDate}
                    onChange={(e) => setSuspensionFormFields({ ...suspensionFormFields, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Justificativa / Motivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Veículo retido na oficina mecânica."
                  value={suspensionFormFields.reason}
                  onChange={(e) => setSuspensionFormFields({ ...suspensionFormFields, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                />
              </div>
              <div>
                <label className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline-variant/60 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={suspensionFormFields.suspendCharges}
                    onChange={(e) => setSuspensionFormFields({ ...suspensionFormFields, suspendCharges: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <div>
                    <p className="font-bold text-primary">Isentar Cobrança de Diárias</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setIsSuspensionModalOpen(false)}
                className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Salvar Suspensão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BILLING RUN DETAILS MODAL */}
      {selectedBillingRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/65 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-background border border-outline-variant rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedBillingRun(null);
                setBillingRunItemsList([]);
                setSelectedRunItemDetails(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-primary border-b border-outline-variant pb-3 mb-4 font-geist">
              Lote de Faturamento: Período {new Date(selectedBillingRun.periodStart + "T12:00:00").toLocaleDateString("pt-BR")} a {new Date(selectedBillingRun.periodEnd + "T12:00:00").toLocaleDateString("pt-BR")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-outline-variant/60">
                <span className="text-[10px] text-outline font-bold uppercase">Gerado em</span>
                <p className="font-bold text-primary mt-0.5">{new Date(selectedBillingRun.generatedAt || selectedBillingRun.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-outline-variant/60">
                <span className="text-[10px] text-outline font-bold uppercase">Total Faturado BRL</span>
                <p className="font-extrabold text-emerald-600 mt-0.5">R$ {Number(selectedBillingRun.totalAmount).toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-outline-variant/60">
                <span className="text-[10px] text-outline font-bold uppercase">Motoristas Faturados</span>
                <p className="font-bold text-primary mt-0.5">{selectedBillingRun.totalDrivers} motoristas ativos</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left side list */}
              <div className="flex-1 overflow-x-auto border border-outline-variant rounded-xl max-h-[40vh]">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 border-b border-outline-variant sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-outline">Motorista</th>
                      <th className="px-3 py-2 font-semibold text-outline">Regra</th>
                      <th className="px-3 py-2 font-semibold text-outline">Dias Cobr.</th>
                      <th className="px-3 py-2 font-semibold text-outline">Total BRL</th>
                      <th className="px-3 py-2 font-semibold text-outline text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {billingRunItemsList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 bg-white">
                        <td className="px-3 py-2 font-bold text-primary">{item.driverName}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{item.profileName}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{item.daysCharged} cobrados</td>
                        <td className="px-3 py-2 font-bold text-primary">R$ {Number(item.totalAmount).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRunItemDetails(item)}
                            className="px-2 py-1 rounded bg-surface-container font-bold text-[9px] hover:bg-slate-100"
                          >
                            Inspecionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right side breakdown */}
              {selectedRunItemDetails && (
                <div className="w-full lg:w-72 p-4 bg-slate-50 border border-outline-variant rounded-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="font-bold text-xs text-primary border-b border-outline-variant/60 pb-1">{selectedRunItemDetails.driverName}</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold">Perfil de Diária: {selectedRunItemDetails.profileName}</p>
                    
                    <div className="max-h-48 overflow-y-auto divide-y divide-outline-variant/40 border border-outline-variant/60 rounded-lg text-[9px] bg-white">
                      {selectedRunItemDetails.details.map((day: any) => (
                        <div key={day.date} className="flex justify-between items-center p-2 hover:bg-slate-50">
                          <span className="font-mono text-primary font-semibold">
                            {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-on-surface-variant truncate max-w-[120px] text-right" title={day.reason}>{day.reason}</span>
                          <span className={`font-mono font-bold ${day.isCharged ? "text-emerald-600" : "text-amber-600"}`}>
                            {day.isCharged ? `R$ ${day.rate.toFixed(2)}` : "R$ 0,00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-outline-variant/60 text-right mt-3">
                    <p className="text-[10px] text-outline uppercase font-bold">Total Lançado</p>
                    <p className="text-sm font-black text-primary">R$ {Number(selectedRunItemDetails.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => {
                  setSelectedBillingRun(null);
                  setBillingRunItemsList([]);
                  setSelectedRunItemDetails(null);
                }}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md"
              >
                Fechar Lote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
