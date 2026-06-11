"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { calculateDriverBillingForPeriod } from "@/lib/billingEngine";
import {
  CompanyForm,
  ProfileForm,
  ProfileFormFields,
  RuleFormFields,
  CalendarFormFields,
  SuspensionFormFields,
  SimIndividual,
  SimBulk,
  NewRoleForm
} from "../_lib/types";

export function useSettings() {
  const { currentUser, getCollection, updateDocument, addDocument, deleteDocument, can, impersonateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);

  // Database seeds & state lists
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Billing Engine states
  const [dailyProfiles, setDailyProfiles] = useState<any[]>([]);
  const [billingRules, setBillingRules] = useState<any[]>([]);
  const [businessCalendar, setBusinessCalendar] = useState<any[]>([]);
  const [billingSuspensions, setBillingSuspensions] = useState<any[]>([]);
  const [billingRuns, setBillingRuns] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [contractsList, setContractsList] = useState<any[]>([]);
  const [billingSubTab, setBillingSubTab] = useState("profiles");

  // Form states - Profiles
  const [profileFormFields, setProfileFormFields] = useState<ProfileFormFields>({
    id: "",
    name: "",
    amount: 150,
    description: "",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: ""
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);

  // Form states - Rules
  const [ruleFormFields, setRuleFormFields] = useState<RuleFormFields>({
    id: "",
    profileId: "",
    calendarId: "default",
    weekdays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    exemptHolidays: true,
    exemptOptionalDays: true,
    active: true
  });
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  // Form states - Calendar
  const [calendarFormFields, setCalendarFormFields] = useState<CalendarFormFields>({
    id: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
    type: "holiday",
    chargeNormally: false
  });
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<any | null>(null);

  // Form states - Suspensions
  const [suspensionFormFields, setSuspensionFormFields] = useState<SuspensionFormFields>({
    id: "",
    driverId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    suspendCharges: true
  });
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [editingSuspension, setEditingSuspension] = useState<any | null>(null);

  // Individual Simulator
  const [simIndividual, setSimIndividual] = useState<SimIndividual>({
    driverId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [simIndividualResults, setSimIndividualResults] = useState<any | null>(null);

  // Bulk Simulator
  const [simBulk, setSimBulk] = useState<SimBulk>({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [simBulkResults, setSimBulkResults] = useState<any | null>(null);
  
  // Selected Billing Run details
  const [selectedBillingRun, setSelectedBillingRun] = useState<any | null>(null);
  const [billingRunItemsList, setBillingRunItemsList] = useState<any[]>([]);
  const [selectedRunItemDetails, setSelectedRunItemDetails] = useState<any | null>(null);

  // Sub-states & modals
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);
  const [auditSearchTerm, setAuditSearchTerm] = useState("");

  // Form states
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    id: "",
    companyName: "",
    document: "",
    phone: "",
    email: "",
    plan: "Pro"
  });

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: "",
    email: ""
  });

  const [dbStats, setDbStats] = useState({
    vehicles: 0,
    drivers: 0,
    contracts: 0,
    payments: 0,
    maintenance: 0
  });

  const [newRoleForm, setNewRoleForm] = useState<NewRoleForm>({
    name: "",
    description: ""
  });

  const [webhookUrl, setWebhookUrl] = useState("https://api.frotas.com/webhook/events");
  const [notificationsConfig, setNotificationsConfig] = useState({
    whatsappCnh: true,
    whatsappOverdue: false,
    emailDailyReport: true
  });

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);

      // Fetch standard company details
      const companies = await getCollection("companies");
      const myCompany = companies.find(c => c.id === currentUser.tenantId) || {
        id: currentUser.tenantId,
        companyName: "Empresa FleetOS",
        document: "00.000.000/0001-00",
        phone: "(11) 99999-9999",
        email: "contato@empresa.com",
        plan: "Pro"
      };

      setCompanyForm(myCompany);
      setProfileForm({
        displayName: currentUser.displayName || "",
        email: currentUser.email || ""
      });

      // Gather database statistics
      const [vehList, drvList, conList, payList, maintList] = await Promise.all([
        getCollection("vehicles"),
        getCollection("drivers"),
        getCollection("contracts"),
        getCollection("payments"),
        getCollection("maintenance")
      ]);

      setDbStats({
        vehicles: vehList.length,
        drivers: drvList.length,
        contracts: conList.length,
        payments: payList.length,
        maintenance: maintList.length
      });

      // Gather RBAC Details
      const [upList, rList, pList, rpList, aList] = await Promise.all([
        getCollection("user_profiles"),
        getCollection("roles"),
        getCollection("permissions"),
        getCollection("role_permissions"),
        getCollection("audit_logs")
      ]);

      setUserProfiles(upList);
      setRoles(rList);
      setPermissions(pList);
      setRolePermissions(rpList);
      setAuditLogs(aList);

      // Fetch Billing Engine data
      const [dpList, brList, bcList, bsList, brunList] = await Promise.all([
        getCollection("daily_rate_profiles"),
        getCollection("billing_rules"),
        getCollection("business_calendar"),
        getCollection("billing_suspensions"),
        getCollection("billing_runs")
      ]);
      setDailyProfiles(dpList);
      setBillingRules(brList);
      setBusinessCalendar(bcList);
      setBillingSuspensions(bsList);
      setBillingRuns(brunList);
      setDriversList(drvList);
      setContractsList(conList);

      if (rList.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rList[0].id);
      }
    } catch (e) {
      console.error("Erro ao carregar configurações", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Billing Engine Actions & Helpers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileFormFields.name,
        amount: Number(profileFormFields.amount),
        description: profileFormFields.description,
        validFrom: profileFormFields.validFrom,
        validTo: profileFormFields.validTo || null
      };

      if (editingProfile) {
        await updateDocument("daily_rate_profiles", editingProfile.id, payload);
        alert("Perfil de diária atualizado!");
      } else {
        await addDocument("daily_rate_profiles", payload);
        alert("Perfil de diária cadastrado!");
      }
      setIsProfileModalOpen(false);
      setEditingProfile(null);
      setProfileFormFields({ id: "", name: "", amount: 150, description: "", validFrom: new Date().toISOString().split("T")[0], validTo: "" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        profileId: ruleFormFields.profileId,
        calendarId: ruleFormFields.calendarId,
        weekdays: ruleFormFields.weekdays,
        exemptHolidays: ruleFormFields.exemptHolidays,
        exemptOptionalDays: ruleFormFields.exemptOptionalDays,
        active: ruleFormFields.active
      };

      if (editingRule) {
        await updateDocument("billing_rules", editingRule.id, payload);
        alert("Regra de cobrança atualizada!");
      } else {
        await addDocument("billing_rules", payload);
        alert("Regra de cobrança cadastrada!");
      }
      setIsRuleModalOpen(false);
      setEditingRule(null);
      setRuleFormFields({
        id: "",
        profileId: "",
        calendarId: "default",
        weekdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
        exemptHolidays: true,
        exemptOptionalDays: true,
        active: true
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        date: calendarFormFields.date,
        name: calendarFormFields.name,
        type: calendarFormFields.type,
        chargeNormally: calendarFormFields.chargeNormally
      };

      if (editingCalendar) {
        await updateDocument("business_calendar", editingCalendar.id, payload);
        alert("Evento de calendário atualizado!");
      } else {
        await addDocument("business_calendar", payload);
        alert("Evento de calendário cadastrado!");
      }
      setIsCalendarModalOpen(false);
      setEditingCalendar(null);
      setCalendarFormFields({ id: "", date: new Date().toISOString().split("T")[0], name: "", type: "holiday", chargeNormally: false });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        driverId: suspensionFormFields.driverId,
        startDate: suspensionFormFields.startDate,
        endDate: suspensionFormFields.endDate,
        reason: suspensionFormFields.reason,
        suspendCharges: suspensionFormFields.suspendCharges
      };

      if (editingSuspension) {
        await updateDocument("billing_suspensions", editingSuspension.id, payload);
        alert("Suspensão de cobrança atualizada!");
      } else {
        await addDocument("billing_suspensions", payload);
        alert("Suspensão de cobrança cadastrada!");
      }
      setIsSuspensionModalOpen(false);
      setEditingSuspension(null);
      setSuspensionFormFields({ id: "", driverId: "", startDate: new Date().toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0], reason: "", suspendCharges: true });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (confirm("Excluir este perfil de diária? Isso não afetará contratos já assinados (preservados via snapshot).")) {
      await deleteDocument("daily_rate_profiles", id);
      loadData();
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm("Excluir esta regra de cobrança?")) {
      await deleteDocument("billing_rules", id);
      loadData();
    }
  };

  const handleDeleteCalendarEvent = async (id: string) => {
    if (confirm("Excluir este evento do calendário corporativo?")) {
      await deleteDocument("business_calendar", id);
      loadData();
    }
  };

  const handleDeleteSuspension = async (id: string) => {
    if (confirm("Excluir esta suspensão temporária?")) {
      await deleteDocument("billing_suspensions", id);
      loadData();
    }
  };

  const handleImportDefaultHolidays = async () => {
    if (!confirm("Deseja importar os feriados nacionais padrão de 2026 para o calendário corporativo?")) {
      return;
    }
    
    const defaultHolidays = [
      { date: "2026-01-01", name: "Confraternização Universal", type: "holiday", chargeNormally: false },
      { date: "2026-02-16", name: "Carnaval (Segunda-feira)", type: "optional", chargeNormally: false },
      { date: "2026-02-17", name: "Carnaval (Terça-feira)", type: "optional", chargeNormally: false },
      { date: "2026-02-18", name: "Quarta-feira de Cenzas", type: "optional", chargeNormally: false },
      { date: "2026-04-03", name: "Sexta-feira Santa", type: "holiday", chargeNormally: false },
      { date: "2026-04-21", name: "Tiradentes", type: "holiday", chargeNormally: false },
      { date: "2026-05-01", name: "Dia do Trabalho", type: "holiday", chargeNormally: false },
      { date: "2026-06-04", name: "Corpus Christi", type: "holiday", chargeNormally: false },
      { date: "2026-09-07", name: "Independência do Brasil", type: "holiday", chargeNormally: false },
      { date: "2026-10-12", name: "Nossa Senhora Aparecida", type: "holiday", chargeNormally: false },
      { date: "2026-11-02", name: "Finados", type: "holiday", chargeNormally: false },
      { date: "2026-11-15", name: "Proclamação da República", type: "holiday", chargeNormally: true },
      { date: "2026-11-20", name: "Dia da Consciência Negra", type: "holiday", chargeNormally: false },
      { date: "2026-12-25", name: "Natal", type: "holiday", chargeNormally: false }
    ];

    try {
      setLoading(true);
      for (const h of defaultHolidays) {
        const exists = businessCalendar.some(c => c.date === h.date);
        if (!exists) {
          await addDocument("business_calendar", h);
        }
      }
      alert("Feriados padrão de 2026 importados com sucesso!");
      loadData();
    } catch (e) {
      console.error("Erro ao importar feriados", e);
    } finally {
      setLoading(false);
    }
  };

  const calculateDriverBillingForPeriodLocal = (driverId: string, startDateStr: string, endDateStr: string) => {
    return calculateDriverBillingForPeriod({
      driverId,
      startDate: startDateStr,
      endDate: endDateStr,
      contracts: contractsList,
      drivers: driversList,
      profiles: dailyProfiles,
      rules: billingRules,
      calendar: businessCalendar,
      suspensions: billingSuspensions,
    });
  };

  const handleRunIndividualSimulation = () => {
    if (!simIndividual.driverId || !simIndividual.startDate || !simIndividual.endDate) return;
    const res = calculateDriverBillingForPeriodLocal(simIndividual.driverId, simIndividual.startDate, simIndividual.endDate);
    setSimIndividualResults(res);
  };

  const handleRunBulkSimulation = () => {
    if (!simBulk.startDate || !simBulk.endDate) return;
    const activeDrivers = driversList.filter(d => d.status === "active");
    const results = activeDrivers.map(drv => calculateDriverBillingForPeriodLocal(drv.id, simBulk.startDate, simBulk.endDate));
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    const totalAmount = successful.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalChargedDays = successful.reduce((sum, r) => sum + r.daysCharged, 0);
    const totalExemptDays = successful.reduce((sum, r) => sum + r.daysExempt, 0);

    setSimBulkResults({
      periodStart: simBulk.startDate,
      periodEnd: simBulk.endDate,
      totalDrivers: activeDrivers.length,
      successfulCount: successful.length,
      failedCount: failed.length,
      totalAmount,
      totalChargedDays,
      totalExemptDays,
      items: results
    });
  };

  const handleProcessBillingRun = async () => {
    if (!simBulkResults) return;
    if (!confirm(`Deseja efetivar a cobrança de R$ ${simBulkResults.totalAmount.toFixed(2)} para ${simBulkResults.successfulCount} motoristas?`)) return;

    try {
      setLoading(true);
      const runPayload = {
        periodStart: simBulkResults.periodStart,
        periodEnd: simBulkResults.periodEnd,
        generatedBy: currentUser?.displayName || "Administrador",
        totalDrivers: simBulkResults.successfulCount,
        totalAmount: simBulkResults.totalAmount
      };
      
      const newRun = await addDocument("billing_runs", runPayload);

      for (const item of simBulkResults.items) {
        if (item.error) continue;

        await addDocument("billing_run_items", {
          runId: newRun.id,
          driverId: item.driverId,
          driverName: item.driverName,
          profileName: item.profileName,
          daysCharged: item.daysCharged,
          daysExempt: item.daysExempt,
          totalAmount: item.totalAmount,
          details: item.details
        });

        if (item.totalAmount > 0) {
          await addDocument("driver_ledger", {
            driverId: item.driverId,
            type: "daily",
            description: `Cobrança automática de diárias: Período ${simBulkResults.periodStart} a ${simBulkResults.periodEnd} (${item.daysCharged} dias cobrados)`,
            amount: -item.totalAmount
          });

          const cashierSessions = await getCollection("cashier_sessions");
          const openSession = cashierSessions.find(s => s.status === "open" || s.status === "active");
          if (openSession) {
            await addDocument("cashier_movements", {
              cashierId: openSession.id,
              type: "DEBIT_LOG",
              amount: item.totalAmount,
              paymentMethod: "Conta Corrente",
              description: `Débito em lote: Diárias ${item.driverName} (${simBulkResults.periodStart} a ${simBulkResults.periodEnd})`
            });
          }
        }
      }

      alert("Faturamento em lote efetivado com sucesso!");
      setSimBulkResults(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao faturar lote.");
    } finally {
      setLoading(false);
    }
  };

  const handleInspectBillingRun = async (run: any) => {
    setSelectedBillingRun(run);
    try {
      const allItems = await getCollection("billing_run_items");
      const filtered = allItems.filter(item => item.runId === run.id);
      setBillingRunItemsList(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  // Actions
  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDocument("companies", companyForm.id, companyForm);
      alert("Configurações da empresa salvas com sucesso!");
      loadData();
    } catch (err) {
      console.error("Erro ao atualizar empresa", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profilesStr = localStorage.getItem("fleetos_user_profiles");
      if (profilesStr && currentUser) {
        const profiles = JSON.parse(profilesStr);
        const index = profiles.findIndex((p: any) => p.uid === currentUser.uid);
        if (index !== -1) {
          profiles[index].displayName = profileForm.displayName;
          localStorage.setItem("fleetos_user_profiles", JSON.stringify(profiles));
        }

        const sessionUser = {
          ...currentUser,
          displayName: profileForm.displayName
        };
        localStorage.setItem("fleetos_current_user", JSON.stringify(sessionUser));
        alert("Perfil de usuário atualizado!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Erro ao atualizar perfil", err);
    }
  };

  // Change user role
  const handleUserRoleChange = async (userId: string, newRoleId: string) => {
    try {
      const user = userProfiles.find(u => u.uid === userId || u.id === userId);
      if (!user) return;

      await updateDocument("user_profiles", user.id || userId, { roleId: newRoleId });
      alert("Perfil do operador atualizado com sucesso!");
      loadData();
    } catch (e) {
      console.error("Erro ao alterar papel de usuário", e);
    }
  };

  // Change user active status
  const handleUserStatusChange = async (userId: string, active: boolean) => {
    try {
      const user = userProfiles.find(u => u.uid === userId || u.id === userId);
      if (!user) return;

      await updateDocument("user_profiles", user.id || userId, { active });
      alert(`Operador ${active ? "ativado" : "suspenso"} com sucesso!`);
      loadData();
    } catch (e) {
      console.error("Erro ao alterar status de usuário", e);
    }
  };

  // Impersonate
  const handleImpersonate = async (email: string) => {
    if (confirm(`Deseja entrar no sistema impersonando o usuário (${email})?`)) {
      try {
        await impersonateUser(email);
        alert("Modo de impersonação ativado! Redirecionando...");
        window.location.href = "/dashboard";
      } catch (e: any) {
        alert(e.message || "Erro ao impersonar usuário.");
      }
    }
  };

  // Create new role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name) return;
    try {
      const newId = `role-${newRoleForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      await addDocument("roles", {
        id: newId,
        name: newRoleForm.name,
        description: newRoleForm.description
      });
      setNewRoleForm({ name: "", description: "" });
      alert("Novo perfil de acesso cadastrado!");
      loadData();
    } catch (e) {
      console.error("Erro ao cadastrar papel", e);
    }
  };

  // Toggle permission mapping
  const handleTogglePermission = async (permId: string, hasIt: boolean) => {
    try {
      if (hasIt) {
        const match = rolePermissions.find(rp => rp.roleId === selectedRoleId && rp.permissionId === permId);
        if (match) {
          await deleteDocument("role_permissions", match.id);
        }
      } else {
        await addDocument("role_permissions", {
          roleId: selectedRoleId,
          permissionId: permId
        });
      }
      loadData();
    } catch (e) {
      console.error("Erro ao alterar permissão do perfil", e);
    }
  };

  const handleResetDatabase = () => {
    if (confirm("ATENÇÃO: Isso irá apagar todas as modificações locais, novos perfis/logs e restaurar os seeds de fábrica. Deseja continuar?")) {
      const keys = ["companies", "user_profiles", "drivers", "vehicles", "contracts", "notifications", "attachments", "payments", "maintenance", "current_user", "roles", "permissions", "role_permissions", "audit_logs", "original_user", "daily_rate_profiles", "billing_rules", "business_calendar", "billing_suspensions", "billing_runs", "billing_run_items", "insurance_claims", "claim_checklists", "claim_evidences", "claim_reports", "claim_third_parties", "claim_damage_items", "damage_price_table", "claim_budgets", "claim_installments", "claim_approvals"];
      keys.forEach(k => {
        localStorage.removeItem(`fleetos_${k}`);
      });
      alert("Banco de dados resetado!");
      window.location.reload();
    }
  };

  // Filtering audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs
      .filter(log => {
        const matchesSearch = 
          log.userName?.toLowerCase().includes(auditSearchTerm.toLowerCase()) || 
          log.action?.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
          log.entityType?.toLowerCase().includes(auditSearchTerm.toLowerCase());
        return matchesSearch;
      })
      .slice()
      .reverse();
  }, [auditLogs, auditSearchTerm]);

  return {
    currentUser,
    activeTab,
    setActiveTab,
    loading,
    userProfiles,
    roles,
    permissions,
    rolePermissions,
    dailyProfiles,
    billingRules,
    businessCalendar,
    billingSuspensions,
    billingRuns,
    driversList,
    contractsList,
    billingSubTab,
    setBillingSubTab,
    
    // Form fields
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
    selectedRoleId,
    setSelectedRoleId,
    selectedAuditLog,
    setSelectedAuditLog,
    auditSearchTerm,
    setAuditSearchTerm,
    companyForm,
    setCompanyForm,
    profileForm,
    setProfileForm,
    dbStats,
    newRoleForm,
    setNewRoleForm,
    webhookUrl,
    setWebhookUrl,
    notificationsConfig,
    setNotificationsConfig,

    // Handlers
    loadData,
    handleSaveProfile,
    handleSaveRule,
    handleSaveCalendarEvent,
    handleSaveSuspension,
    handleDeleteProfile,
    handleDeleteRule,
    handleDeleteCalendarEvent,
    handleDeleteSuspension,
    handleImportDefaultHolidays,
    calculateDriverBillingForPeriodLocal,
    handleRunIndividualSimulation,
    handleRunBulkSimulation,
    handleProcessBillingRun,
    handleInspectBillingRun,
    handleUpdateCompany,
    handleUpdateProfile,
    handleUserRoleChange,
    handleUserStatusChange,
    handleImpersonate,
    handleCreateRole,
    handleTogglePermission,
    handleResetDatabase,
    filteredAuditLogs
  };
}
