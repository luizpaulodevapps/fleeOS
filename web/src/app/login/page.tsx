"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, AlertTriangle, ShieldCheck, UserCheck, Car } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (mEmail: string) => {
    setEmail(mEmail);
    setPassword("123456");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-obsidian-950 relative overflow-hidden p-4">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center font-black text-obsidian-950 text-2xl shadow-glass mb-3">
            F
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Acessar <span className="text-brand-500">FleetOS</span>
          </h2>
          <p className="text-sm text-obsidian-400 mt-1">
            Sistema de Gestão de Frotas Multi-Tenant
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-obsidian-400 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-obsidian-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-obsidian-400 mb-2">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-5 h-5 text-obsidian-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 text-obsidian-950 font-bold hover:bg-brand-400 hover:shadow-glass-hover active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>

        {/* Demo Fast Login Access */}
        <div className="mt-6 pt-5 border-t border-obsidian-800">
          <span className="block text-xs font-bold uppercase tracking-wider text-obsidian-400 mb-3 text-center">
            Acesso Rápido para Testes (Senha: 123456)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => fillCredentials("superadmin@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Super Admin</p>
                <p className="text-[9px] text-obsidian-400 truncate">superadmin@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("fleet_owner@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <UserCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Dono (Owner)</p>
                <p className="text-[9px] text-obsidian-400 truncate">fleet_owner@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("financial@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <UserCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Financeiro</p>
                <p className="text-[9px] text-obsidian-400 truncate">financial@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("cashier@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <UserCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Operador Caixa</p>
                <p className="text-[9px] text-obsidian-400 truncate">cashier@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("rh@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <UserCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Recursos Humanos</p>
                <p className="text-[9px] text-obsidian-400 truncate">rh@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("supervisor@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <UserCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Supervisor</p>
                <p className="text-[9px] text-obsidian-400 truncate">supervisor@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("readonly@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <UserCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Somente Leitura</p>
                <p className="text-[9px] text-obsidian-400 truncate">readonly@fleetsos.com</p>
              </div>
            </button>

            <button
              onClick={() => fillCredentials("driver@fleetsos.com")}
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-left hover:border-brand-500/30 transition-all text-[11px]"
            >
              <Car className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">Motorista</p>
                <p className="text-[9px] text-obsidian-400 truncate">driver@fleetsos.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
