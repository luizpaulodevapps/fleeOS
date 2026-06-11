"use client";

import React from "react";
import { Plus, Key } from "lucide-react";
import { NewRoleForm } from "../_lib/types";

interface RolesSettingsProps {
  roles: any[];
  newRoleForm: NewRoleForm;
  setNewRoleForm: React.Dispatch<React.SetStateAction<NewRoleForm>>;
  handleCreateRole: (e: React.FormEvent) => Promise<void>;
}

export function RolesSettings({
  roles,
  newRoleForm,
  setNewRoleForm,
  handleCreateRole
}: RolesSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Perfis de Acesso (Cargos)</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Cadastre ou visualize os cargos disponíveis para controle RBAC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form to create new role */}
        <form onSubmit={handleCreateRole} className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-4 h-fit">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Criar Novo Perfil</h4>
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Nome do Cargo</label>
            <input
              type="text"
              required
              placeholder="Ex: Supervisor Geral"
              value={newRoleForm.name}
              onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Descrição</label>
            <textarea
              rows={2}
              placeholder="Ex: Responsável por aprovar CNHs..."
              value={newRoleForm.description}
              onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-1 py-2 bg-primary text-on-primary rounded text-xs font-bold hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Cargo</span>
          </button>
        </form>

        {/* List of roles */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Cargos Cadastrados</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map(r => (
              <div key={r.id} className="p-4 bg-white border border-outline-variant rounded-xl shadow-sm space-y-1">
                <p className="font-bold text-primary text-xs flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-outline" />
                  <span>{r.name}</span>
                </p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
