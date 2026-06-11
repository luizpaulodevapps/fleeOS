"use client";

import React from "react";

interface UserSettingsProps {
  userProfiles: any[];
  roles: any[];
  currentUser: any;
  handleUserRoleChange: (userId: string, newRoleId: string) => Promise<void>;
  handleUserStatusChange: (userId: string, active: boolean) => Promise<void>;
  handleImpersonate: (email: string) => Promise<void>;
}

export function UserSettings({
  userProfiles,
  roles,
  currentUser,
  handleUserRoleChange,
  handleUserStatusChange,
  handleImpersonate
}: UserSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-primary font-geist">Controle de Usuários</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Gerencie os acessos, status e impersonação de contas operadoras no tenant.</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-outline-variant rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr>
              <th className="px-4 py-3 font-semibold text-outline">Operador</th>
              <th className="px-4 py-3 font-semibold text-outline">E-mail</th>
              <th className="px-4 py-3 font-semibold text-outline">Perfil Associado</th>
              <th className="px-4 py-3 font-semibold text-outline">Status</th>
              <th className="px-4 py-3 font-semibold text-outline text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 bg-white">
            {userProfiles.map(user => (
              <tr key={user.uid || user.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3.5 font-bold text-primary">{user.displayName}</td>
                <td className="px-4 py-3.5 text-on-surface-variant">{user.email}</td>
                <td className="px-4 py-3.5">
                  <select
                    value={user.roleId || ""}
                    onChange={(e) => handleUserRoleChange(user.id || user.uid, e.target.value)}
                    className="px-2.5 py-1 bg-white border border-outline-variant rounded text-[11px] font-bold text-primary focus:ring-1 focus:ring-primary/20 outline-none"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => handleUserStatusChange(user.id || user.uid, !user.active)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      user.active 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-650 border-red-500/20"
                    }`}
                  >
                    {user.active ? "Ativo" : "Suspenso"}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right">
                  {(currentUser?.roleId === "role-super-admin" || currentUser?.role === "super_admin") && user.email !== currentUser.email ? (
                    <button
                      onClick={() => handleImpersonate(user.email)}
                      className="px-2 py-1 rounded bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition-all shadow-sm"
                    >
                      Impersonar
                    </button>
                  ) : (
                    <span className="text-[10px] text-outline font-semibold italic">Nenhuma</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
