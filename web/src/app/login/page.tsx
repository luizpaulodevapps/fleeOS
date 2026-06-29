"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Mail,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Car,
  ChevronRight,
  Truck,
  BarChart3,
  MapPin,
  Eye,
  EyeOff,
  Wrench,
  User,
} from "lucide-react";

const QUICK_USERS = [
  { email: "superadmin@fleetsos.com",  label: "Super Admin",       icon: ShieldCheck, color: "#f59e0b" },
  { email: "fleet_owner@fleetsos.com", label: "Dono (Owner)",      icon: UserCheck,   color: "#10b981" },
  { email: "manager@fleetsos.com",     label: "Gestor",            icon: User,        color: "#a855f7" },
  { email: "financial@fleetsos.com",   label: "Financeiro",        icon: UserCheck,   color: "#3b82f6" },
  { email: "cashier@fleetsos.com",     label: "Operador Caixa",    icon: UserCheck,   color: "#8b5cf6" },
  { email: "rh@fleetsos.com",          label: "Recursos Humanos",  icon: UserCheck,   color: "#ec4899" },
  { email: "supervisor@fleetsos.com",  label: "Supervisor",        icon: UserCheck,   color: "#06b6d4" },
  { email: "readonly@fleetsos.com",    label: "Somente Leitura",   icon: UserCheck,   color: "#6b7280" },
  { email: "driver@fleetsos.com",      label: "Motorista",         icon: Car,         color: "#f97316" },
  { email: "oficina_parceira@fleetsos.com", label: "Oficina",        icon: Wrench,      color: "#14b8a6" },
  { email: "mecanico@fleetsos.com",    label: "Mecânico Líder",    icon: Wrench,      color: "#f43f5e" },
  { email: "ajudante@fleetsos.com",     label: "Ajudante Oficina",  icon: Wrench,      color: "#84cc16" },
];

const FEATURES = [
  { icon: Truck,      label: "Gestão de Frota",      desc: "Controle total da sua frota" },
  { icon: BarChart3,  label: "Relatórios em Tempo Real", desc: "Dashboards analíticos" },
  { icon: MapPin,     label: "Rastreamento GPS",     desc: "Localização em tempo real" },
];

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  const { signIn } = useAuth();
  const router     = useRouter();

  useEffect(() => { setMounted(true); }, []);

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

  const fill = (mEmail: string) => {
    setEmail(mEmail);
    setPassword("123456");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0d1117 0%, #0f1e2e 40%, #0d1117 100%)",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Animated background orbs ── */}
      <div style={{
        position: "absolute", top: "-10%", left: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
        animation: "floatOrb 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "5%", right: "-5%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "floatOrb 10s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "30%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        filter: "blur(40px)",
        animation: "floatOrb 12s ease-in-out infinite 2s",
        pointerEvents: "none",
      }} />

      {/* ── Grid pattern ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      {/* ─────────────────── LEFT PANEL ─────────────────── */}
      <div style={{
        display: "none",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 64px",
        position: "relative",
        zIndex: 1,
      }}
        className="hidden lg:flex"
      >
        {/* Logo mark */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 56,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(16,185,129,0.4)",
            fontWeight: 900, color: "#fff", fontSize: 20,
          }}>F</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}>FleetOS</span>
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.15,
          letterSpacing: "-1px",
          marginBottom: 20,
        }}>
          Gerencie sua frota<br />
          <span style={{
            background: "linear-gradient(90deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>com inteligência</span>
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 16,
          lineHeight: 1.7,
          maxWidth: 360,
          marginBottom: 56,
        }}>
          Plataforma multi-tenant completa para gestão de frotas, motoristas, documentos e financeiro em um único painel.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 20px",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              transition: "border-color 0.2s",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(16,185,129,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={18} color="#10b981" />
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{label}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "2px 0 0" }}>{desc}</p>
              </div>
              <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────── RIGHT PANEL (login card) ─────────────────── */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        margin: "auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
      }}
        className="lg:flex-none lg:w-[480px]"
      >
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 32px rgba(16,185,129,0.45)",
              fontWeight: 900, color: "#fff", fontSize: 24,
            }}>F</div>
            <h2 style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: 800,
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
            }}>
              Acessar <span style={{
                background: "linear-gradient(90deg,#10b981,#34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>FleetOS</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, margin: 0 }}>
              Sistema de Gestão de Frotas Multi-Tenant
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 12,
              marginBottom: 20,
              color: "#fca5a5",
              fontSize: 13,
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email field */}
            <div>
              <label style={{
                display: "block",
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>E-mail</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="rgba(255,255,255,0.3)" style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  style={{
                    display: "block",
                    width: "100%",
                    paddingLeft: 40,
                    paddingRight: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(16,185,129,0.6)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label style={{
                display: "block",
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>Senha</label>
              <div style={{ position: "relative" }}>
                <KeyRound size={16} color="rgba(255,255,255,0.3)" style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    display: "block",
                    width: "100%",
                    paddingLeft: 40,
                    paddingRight: 44,
                    paddingTop: 12,
                    paddingBottom: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(16,185,129,0.6)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", padding: 4,
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                marginTop: 4,
                borderRadius: 12,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading
                  ? "rgba(16,185,129,0.4)"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.01em",
                boxShadow: loading ? "none" : "0 4px 20px rgba(16,185,129,0.4)",
                transition: "all 0.2s",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(16,185,129,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(16,185,129,0.4)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Autenticando...
                </>
              ) : "Entrar no Painel →"}
            </button>
          </form>

          {/* Quick access */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}>
              Acesso Rápido — Senha: 123456
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {QUICK_USERS.map(({ email: mEmail, label, icon: Icon, color }) => (
                <button
                  key={mEmail}
                  onClick={() => fill(mEmail)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}55`;
                    (e.currentTarget as HTMLButtonElement).style.background = `${color}12`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <Icon size={13} color={color} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 11, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9.5, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mEmail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(15,30,46,0.95) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
      `}</style>
    </div>
  );
}
