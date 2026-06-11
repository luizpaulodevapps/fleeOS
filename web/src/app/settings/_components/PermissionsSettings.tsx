"use client";

import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface PermissionsSettingsProps {
  roles: any[];
  rolePermissions: any[];
  permissions: any[];
  selectedRoleId: string;
  setSelectedRoleId: (roleId: string) => void;
  handleTogglePermission: (permId: string, hasIt: boolean) => Promise<void>;
}

export function PermissionsSettings({
  roles,
  rolePermissions,
  permissions,
  selectedRoleId,
  setSelectedRoleId,
  handleTogglePermission
}: PermissionsSettingsProps) {
  // Grouping permissions by module
  const groupedPermissions: Record<string, any[]> = {};
  permissions.forEach(p => {
    if (!groupedPermissions[p.module]) {
      groupedPermissions[p.module] = [];
    }
    groupedPermissions[p.module].push(p);
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-primary font-geist">Matriz de Permissões</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Associe privilégios específicos de gravação ou leitura aos perfis cadastrados.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-outline uppercase tracking-wider">Perfil Selecionado:</span>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20 font-sans"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedRoleId === "role-super-admin" ? (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Perfil de Suporte (SUPER_ADMIN)</span>
          </p>
          <p className="leading-relaxed">Este cargo possui acesso bypass total do sistema (`*`). Suas permissões não são customizáveis por razões de integridade do sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="bg-surface-container-low border border-outline-variant rounded-xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider border-b border-outline-variant/60 pb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="capitalize">{module.replace("_", " ")}</span>
              </h4>
              <div className="space-y-2">
                {perms.map(p => {
                  const hasIt = rolePermissions.some(rp => rp.roleId === selectedRoleId && rp.permissionId === p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-start gap-2.5 p-2 bg-white border border-outline-variant/60 rounded-lg hover:bg-slate-50 transition-all cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={hasIt}
                        onChange={() => handleTogglePermission(p.id, hasIt)}
                        className="w-4 h-4 accent-primary rounded mt-0.5"
                      />
                      <div className="text-[11px]">
                        <p className="font-bold text-primary">{p.description}</p>
                        <p className="text-[9px] text-outline mt-0.5 font-mono">{p.id}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
