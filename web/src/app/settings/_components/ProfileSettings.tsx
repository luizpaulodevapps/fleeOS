"use client";

import React from "react";
import { Save, Lock } from "lucide-react";
import { ProfileForm } from "../_lib/types";

interface ProfileSettingsProps {
  profileForm: ProfileForm;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>;
}

export function ProfileSettings({
  profileForm,
  setProfileForm,
  handleUpdateProfile
}: ProfileSettingsProps) {
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Minha Conta de Acesso</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Configurações de identidade e credenciais do usuário atual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Nome de Exibição</label>
          <input
            type="text"
            required
            value={profileForm.displayName}
            onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-outline" />
            <span>E-mail Corporativo (Login)</span>
          </label>
          <input
            disabled
            type="email"
            value={profileForm.email}
            className="w-full px-4 py-2.5 bg-surface-container/60 border border-outline-variant rounded-lg text-xs outline-none text-on-surface-variant cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-outline-variant">
        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Atualizar Perfil</span>
        </button>
      </div>
    </form>
  );
}
