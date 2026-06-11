"use client";

import React from "react";
import { useSettings } from "./_hooks/useSettings";
import { CompanySettings } from "./_components/CompanySettings";
import { UserSettings } from "./_components/UserSettings";
import { RolesSettings } from "./_components/RolesSettings";
import { PermissionsSettings } from "./_components/PermissionsSettings";
import { AuditLogsSettings } from "./_components/AuditLogsSettings";
import { IntegrationsSettings } from "./_components/IntegrationsSettings";
import { NotificationsSettings } from "./_components/NotificationsSettings";
import { BillingSettings } from "./_components/BillingSettings";
import { ProfileSettings } from "./_components/ProfileSettings";
import { DatabaseSettings } from "./_components/DatabaseSettings";
import { BillingEngineSettings } from "./_components/BillingEngineSettings";
import { 
  Building, User, Key, ShieldCheck, ShieldAlert, Share2, 
  Bell, Receipt, DollarSign, Database, X 
} from "lucide-react";

export default function SettingsPage() {
  const {
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
  } = useSettings();

  const can = (perm: string) => {
    // Super-admin bypass or check permission
    if (currentUser?.roleId === "role-super-admin" || currentUser?.role === "super_admin") return true;
    return rolePermissions.some(rp => rp.roleId === currentUser?.roleId && rp.permissionId === perm);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-on-surface-variant font-bold">Carregando painel de configurações...</p>
      </div>
    );
  }

  const navItems = [
    { id: "company", label: "Perfil Corporativo", icon: Building, permission: "settings.view" },
    { id: "users", label: "Controle de Usuários", icon: User, permission: "users.manage" },
    { id: "roles", label: "Perfis de Acesso", icon: Key, permission: "users.manage" },
    { id: "permissions", label: "Matriz de Permissões", icon: ShieldCheck, permission: "users.manage" },
    { id: "audit", label: "Logs de Auditoria", icon: ShieldAlert, permission: "users.manage" },
    { id: "integrations", label: "Integrações", icon: Share2, permission: "settings.view" },
    { id: "notifications", label: "Avisos & Notificações", icon: Bell, permission: "settings.view" },
    { id: "billing", label: "Faturamento FleetOS", icon: Receipt, permission: "settings.view" },
    { id: "billing_engine", label: "Motor de Faturamento", icon: DollarSign, permission: "billing.view" },
    { id: "profile", label: "Minha Conta", icon: User },
    { id: "database", label: "Banco de Dados Local", icon: Database, permission: "settings.view" }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist">
          Painel de Configurações
        </h1>
        <p className="text-on-surface-variant text-xs mt-1 font-medium">
          Gerencie permissões, usuários, auditorias, integrações e perfil corporativo da frota.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Navigation Sidebar Tabs */}
        <aside className="w-full md:w-64 flex flex-col gap-1 bg-surface-container-lowest border border-outline-variant p-3 rounded-xl h-fit">
          {navItems.map(item => {
            if (item.permission && !can(item.permission)) return null;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-left transition-all ${
                  activeTab === item.id
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Tab Content Display */}
        <main className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm min-w-0">
          {activeTab === "company" && can("settings.view") && (
            <CompanySettings
              companyForm={companyForm}
              setCompanyForm={setCompanyForm}
              handleUpdateCompany={handleUpdateCompany}
            />
          )}

          {activeTab === "users" && can("users.manage") && (
            <UserSettings
              userProfiles={userProfiles}
              roles={roles}
              currentUser={currentUser}
              handleUserRoleChange={handleUserRoleChange}
              handleUserStatusChange={handleUserStatusChange}
              handleImpersonate={handleImpersonate}
            />
          )}

          {activeTab === "roles" && can("users.manage") && (
            <RolesSettings
              roles={roles}
              newRoleForm={newRoleForm}
              setNewRoleForm={setNewRoleForm}
              handleCreateRole={handleCreateRole}
            />
          )}

          {activeTab === "permissions" && can("users.manage") && (
            <PermissionsSettings
              roles={roles}
              rolePermissions={rolePermissions}
              permissions={permissions}
              selectedRoleId={selectedRoleId}
              setSelectedRoleId={setSelectedRoleId}
              handleTogglePermission={handleTogglePermission}
            />
          )}

          {activeTab === "audit" && can("users.manage") && (
            <AuditLogsSettings
              filteredAuditLogs={filteredAuditLogs}
              auditSearchTerm={auditSearchTerm}
              setAuditSearchTerm={setAuditSearchTerm}
              setSelectedAuditLog={setSelectedAuditLog}
            />
          )}

          {activeTab === "integrations" && can("settings.view") && (
            <IntegrationsSettings
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
            />
          )}

          {activeTab === "notifications" && can("settings.view") && (
            <NotificationsSettings
              notificationsConfig={notificationsConfig}
              setNotificationsConfig={setNotificationsConfig}
            />
          )}

          {activeTab === "billing" && can("settings.view") && (
            <BillingSettings />
          )}

          {activeTab === "profile" && (
            <ProfileSettings
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              handleUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === "database" && can("settings.view") && (
            <DatabaseSettings
              dbStats={dbStats}
              handleResetDatabase={handleResetDatabase}
            />
          )}

          {activeTab === "billing_engine" && can("billing.view") && (
            <BillingEngineSettings
              can={can}
              dailyProfiles={dailyProfiles}
              billingRules={billingRules}
              businessCalendar={businessCalendar}
              billingSuspensions={billingSuspensions}
              billingRuns={billingRuns}
              driversList={driversList}
              billingSubTab={billingSubTab}
              setBillingSubTab={setBillingSubTab}
              profileFormFields={profileFormFields}
              setProfileFormFields={setProfileFormFields}
              isProfileModalOpen={isProfileModalOpen}
              setIsProfileModalOpen={setIsProfileModalOpen}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              ruleFormFields={ruleFormFields}
              setRuleFormFields={setRuleFormFields}
              isRuleModalOpen={isRuleModalOpen}
              setIsRuleModalOpen={setIsRuleModalOpen}
              editingRule={editingRule}
              setEditingRule={setEditingRule}
              calendarFormFields={calendarFormFields}
              setCalendarFormFields={setCalendarFormFields}
              isCalendarModalOpen={isCalendarModalOpen}
              setIsCalendarModalOpen={setIsCalendarModalOpen}
              editingCalendar={editingCalendar}
              setEditingCalendar={setEditingCalendar}
              suspensionFormFields={suspensionFormFields}
              setSuspensionFormFields={setSuspensionFormFields}
              isSuspensionModalOpen={isSuspensionModalOpen}
              setIsSuspensionModalOpen={setIsSuspensionModalOpen}
              editingSuspension={editingSuspension}
              setEditingSuspension={setEditingSuspension}
              simIndividual={simIndividual}
              setSimIndividual={setSimIndividual}
              simIndividualResults={simIndividualResults}
              setSimIndividualResults={setSimIndividualResults}
              simBulk={simBulk}
              setSimBulk={setSimBulk}
              simBulkResults={simBulkResults}
              setSimBulkResults={setSimBulkResults}
              selectedBillingRun={selectedBillingRun}
              setSelectedBillingRun={setSelectedBillingRun}
              billingRunItemsList={billingRunItemsList}
              setBillingRunItemsList={setBillingRunItemsList}
              selectedRunItemDetails={selectedRunItemDetails}
              setSelectedRunItemDetails={setSelectedRunItemDetails}
              handleSaveProfile={handleSaveProfile}
              handleSaveRule={handleSaveRule}
              handleSaveCalendarEvent={handleSaveCalendarEvent}
              handleSaveSuspension={handleSaveSuspension}
              handleDeleteProfile={handleDeleteProfile}
              handleDeleteRule={handleDeleteRule}
              handleDeleteCalendarEvent={handleDeleteCalendarEvent}
              handleDeleteSuspension={handleDeleteSuspension}
              handleImportDefaultHolidays={handleImportDefaultHolidays}
              handleRunIndividualSimulation={handleRunIndividualSimulation}
              handleRunBulkSimulation={handleRunBulkSimulation}
              handleProcessBillingRun={handleProcessBillingRun}
              handleInspectBillingRun={handleInspectBillingRun}
            />
          )}
        </main>
      </div>

      {/* INSPECT AUDIT LOG MODAL */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/65 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-background border border-outline-variant rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-primary font-geist flex items-center gap-1.5 border-b border-outline-variant pb-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-650" />
              <span>Inspecionar Log de Auditoria</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-outline">Operação / Ação</span>
                  <p className="font-bold text-primary text-sm mt-0.5">{selectedAuditLog.action}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-outline">Realizado Por</span>
                  <p className="font-semibold text-primary mt-0.5">{selectedAuditLog.userName} (ID: {selectedAuditLog.userId})</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-outline">Data e Hora</span>
                  <p className="font-mono text-primary mt-0.5">{new Date(selectedAuditLog.createdAt).toLocaleString("pt-BR")}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-outline">Módulo</span>
                    <p className="font-bold text-primary uppercase tracking-wider text-[10px] bg-slate-100 w-fit px-2 py-0.5 rounded border border-outline-variant/60 mt-0.5">{selectedAuditLog.entityType}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-outline">ID do Registro</span>
                    <p className="font-mono text-primary text-[10px] mt-0.5">{selectedAuditLog.entityId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* State compare */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant/60 pb-1.5 font-geist">Comparação de Estado (JSON)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-outline">Estado Anterior (Antes)</span>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono h-48 overflow-y-auto border border-slate-800">
                    {selectedAuditLog.before ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(selectedAuditLog.before, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-500 italic block mt-1">Nenhum dado anterior (Criação de Registro)</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-outline">Estado Posterior (Depois)</span>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono h-48 overflow-y-auto border border-slate-800">
                    {selectedAuditLog.after ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(selectedAuditLog.after, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-500 italic block mt-1">Nenhum dado posterior (Exclusão de Registro)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5 mt-5 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
