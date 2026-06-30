"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured, db } from "@/lib/supabaseClient";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "super_admin" | "fleet_owner" | "driver";
  roleId: string;
  tenantId: string;
  photoURL?: string;
  active: boolean;
  supervisorPin?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signOutUser: () => Promise<void>;
  getCollection: (collName: string) => Promise<any[]>;
  addDocument: (collName: string, data: any) => Promise<any>;
  updateDocument: (collName: string, docId: string, data: any) => Promise<void>;
  deleteDocument: (collName: string, docId: string) => Promise<void>;
  getNextSequence: (sequenceName: string, minimumValue?: number) => Promise<number>;
  hasPermission: (permission: string) => boolean;
  can: (action: string, resource?: any) => boolean;
  impersonateUser: (email: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  isImpersonating: boolean;
  originalUser: UserProfile | null;
  logDirect: (action: string, entityType: string, entityId: string, before?: any, after?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<UserProfile | null>(null);

  // Initialize: check for existing Supabase session, then fall back to localStorage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.error("Supabase não configurado. Verifique as variáveis de ambiente.");
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await buildProfile(session.user.id, session.user.email || "", session.user.user_metadata);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem("fleetos_current_user", JSON.stringify(profile));
          }
        } else {
          // No active session — try localStorage fallback
          const savedUser = localStorage.getItem("fleetos_current_user");
          if (savedUser) {
            try {
              setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
              localStorage.removeItem("fleetos_current_user");
            }
          }
        }
      } catch (e) {
        console.error("Erro ao inicializar sessão:", e);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (login/logout in other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setCurrentUser(null);
        setUserPermissions([]);
        localStorage.removeItem("fleetos_current_user");
        localStorage.removeItem("fleetos_original_user");
        setIsImpersonating(false);
        setOriginalUser(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        const profile = await buildProfile(session.user.id, session.user.email || "", session.user.user_metadata);
        if (profile) {
          setCurrentUser(profile);
          localStorage.setItem("fleetos_current_user", JSON.stringify(profile));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Build a UserProfile from auth user + user_profiles table
  const buildProfile = async (uid: string, email: string, userMetadata?: any): Promise<UserProfile | null> => {
    try {
      const profile = await db.selectById("user_profiles", uid);
      return {
        uid,
        email,
        displayName: profile?.displayName || userMetadata?.displayName || email,
        role: profile?.role || "driver",
        roleId: profile?.roleId || "role-readonly",
        tenantId: profile?.tenantId || "tenant-1",
        active: profile?.active ?? true,
        supervisorPin: profile?.supervisorPin,
      };
    } catch (e) {
      console.error("Erro ao buscar perfil do usuário:", e);
      return {
        uid,
        email,
        displayName: userMetadata?.displayName || email,
        role: "driver",
        roleId: "role-readonly",
        tenantId: "tenant-1",
        active: true,
      };
    }
  };

  // Load permissions when current user changes
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!currentUser) {
        setUserPermissions([]);
        return;
      }

      if (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin") {
        setUserPermissions(["*"]);
        return;
      }

      try {
        const listRP = await db.select("role_permissions");
        const matchedPerms = listRP
          .filter((rp: any) => rp.role_id === currentUser.roleId || rp.roleId === currentUser.roleId)
          .map((rp: any) => rp.permission_id || rp.permissionId);
        setUserPermissions(matchedPerms);
      } catch (e) {
        console.error("Erro ao carregar permissões:", e);
        setUserPermissions([]);
      }
    };

    loadUserPermissions();
  }, [currentUser]);

  // Load impersonation state on startup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const orig = localStorage.getItem("fleetos_original_user");
      if (orig) {
        try {
          setOriginalUser(JSON.parse(orig));
          setIsImpersonating(true);
        } catch (e) {
          localStorage.removeItem("fleetos_original_user");
        }
      }
    }
  }, []);

  const logDirect = async (action: string, entityType: string, entityId: string, before?: any, after?: any) => {
    if (!currentUser) return;

    const enriched = {
      tenantId: currentUser.tenantId,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      action,
      entityType,
      entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : null,
      after: after ? JSON.parse(JSON.stringify(after)) : null,
      createdAt: new Date().toISOString(),
    };

    try {
      await db.insert("audit_logs", enriched);
    } catch (e) {
      console.error("Erro ao registrar log de auditoria:", e);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin" || userPermissions.includes("*")) {
      return true;
    }
    return userPermissions.includes(permission);
  };

  const can = (action: string, resource?: any): boolean => {
    if (!currentUser) return false;
    if (!hasPermission(action)) return false;

    if (resource) {
      if (resource.tenantId && resource.tenantId !== currentUser.tenantId) {
        return false;
      }
      if (currentUser.roleId === "role-driver" || currentUser.role === "driver") {
        const resourceDriverId = resource.driverId || resource.id || resource.userId;
        if (resourceDriverId && resourceDriverId !== currentUser.uid && resourceDriverId !== "drv-1") {
          return false;
        }
      }
    }

    return true;
  };

  const signIn = async (email: string, pass: string): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

    if (error) {
      // Translate common Supabase auth errors
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("E-mail ou senha incorretos.");
      }
      if (error.message.includes("Email not confirmed")) {
        throw new Error("E-mail não confirmado. Verifique sua caixa de entrada.");
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Falha na autenticação.");
    }

    const profile = await buildProfile(data.user.id, data.user.email || "", data.user.user_metadata);
    if (!profile) {
      throw new Error("Perfil de usuário não encontrado no Supabase.");
    }

    setCurrentUser(profile);
    localStorage.setItem("fleetos_current_user", JSON.stringify(profile));
    return profile;
  };

  const signOutUser = async () => {
    if (currentUser) {
      await logDirect("Efetuou logout do sistema", "auth", currentUser.uid);
    }

    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserPermissions([]);
    localStorage.removeItem("fleetos_current_user");
    localStorage.removeItem("fleetos_original_user");
    setIsImpersonating(false);
    setOriginalUser(null);
  };

  const impersonateUser = async (email: string) => {
    if (!currentUser) return;

    if (currentUser.roleId !== "role-super-admin" && currentUser.role !== "super_admin") {
      throw new Error("Apenas super administradores podem impersonar outros usuários.");
    }

    const profiles = await db.select("user_profiles");
    const targetUser = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      throw new Error(`Usuário com o e-mail ${email} não encontrado.`);
    }

    const impersonatedProfile: UserProfile = {
      uid: targetUser.uid || targetUser.id,
      email: targetUser.email,
      displayName: targetUser.displayName,
      role: targetUser.role,
      roleId: targetUser.roleId || "role-readonly",
      tenantId: targetUser.tenantId,
      active: targetUser.active,
    };

    await logDirect(`Impersonou o usuário ${targetUser.displayName} (${email})`, "auth", targetUser.uid, null, impersonatedProfile);

    localStorage.setItem("fleetos_original_user", JSON.stringify(currentUser));
    localStorage.setItem("fleetos_current_user", JSON.stringify(impersonatedProfile));

    setOriginalUser(currentUser);
    setIsImpersonating(true);
    setCurrentUser(impersonatedProfile);
  };

  const stopImpersonation = async () => {
    const orig = localStorage.getItem("fleetos_original_user");
    if (!orig) return;

    const parsedOriginalUser = JSON.parse(orig);

    localStorage.removeItem("fleetos_original_user");
    localStorage.setItem("fleetos_current_user", JSON.stringify(parsedOriginalUser));

    const enriched = {
      tenantId: parsedOriginalUser.tenantId,
      userId: parsedOriginalUser.uid,
      userName: parsedOriginalUser.displayName || parsedOriginalUser.email,
      action: `Parou impersonação do usuário ${currentUser?.displayName}`,
      entityType: "auth",
      entityId: parsedOriginalUser.uid,
      before: currentUser,
      after: parsedOriginalUser,
      createdAt: new Date().toISOString(),
    };

    await db.insert("audit_logs", enriched);

    setOriginalUser(null);
    setIsImpersonating(false);
    setCurrentUser(parsedOriginalUser);
  };

  const getCollection = async (collName: string): Promise<any[]> => {
    if (!currentUser) return [];
    const tenantId = currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin" ? undefined : currentUser.tenantId;
    return db.select(collName, tenantId);
  };

  const addDocument = async (collName: string, data: any): Promise<any> => {
    const enrichedData = {
      ...data,
      tenantId: currentUser?.tenantId || "tenant-1",
      createdAt: new Date().toISOString(),
    };

    const newDoc = await db.insert(collName, enrichedData);

    if (collName !== "audit_logs" && currentUser) {
      let description = `Adicionou registro em ${collName}`;
      if (data.name) description = `Criou motorista/entidade: ${data.name}`;
      else if (data.plate) description = `Criou veículo placa: ${data.plate}`;
      else if (data.description) description = `Criou lançamento/manutenção: ${data.description}`;

      await logDirect(description, collName, newDoc.id, null, newDoc);
    }

    return newDoc;
  };

  const updateDocument = async (collName: string, docId: string, data: any): Promise<void> => {
    const beforeData = await db.selectById(collName, docId);
    await db.update(collName, docId, data);
    const afterData = await db.selectById(collName, docId);

    if (collName !== "audit_logs" && currentUser) {
      let description = `Atualizou registro em ${collName}`;
      if (beforeData) {
        const identifier = beforeData.name || beforeData.plate || beforeData.description || docId;
        description = `Atualizou ${collName}: ${identifier}`;
      }
      await logDirect(description, collName, docId, beforeData, afterData);
    }
  };

  const deleteDocument = async (collName: string, docId: string): Promise<void> => {
    const beforeData = await db.selectById(collName, docId);
    await db.delete(collName, docId);

    if (collName !== "audit_logs" && currentUser) {
      let description = `Excluiu registro em ${collName}`;
      if (beforeData) {
        const identifier = beforeData.name || beforeData.plate || beforeData.description || docId;
        description = `Excluiu ${collName}: ${identifier}`;
      }
      await logDirect(description, collName, docId, beforeData, null);
    }
  };

  const getNextSequence = async (sequenceName: string, minimumValue = 0): Promise<number> => {
    if (!currentUser) throw new Error("Usuário não autenticado.");

    const tenantId = currentUser.tenantId;
    const counterId = `${tenantId}_${sequenceName}`;

    const existing = await db.selectById("tenant_counters", counterId);
    const currentValue = existing ? Number(existing.value || 0) : 0;
    const nextValue = Math.max(currentValue, minimumValue) + 1;

    if (existing) {
      await db.update("tenant_counters", counterId, { value: nextValue, updatedAt: new Date().toISOString() });
    } else {
      await db.insert("tenant_counters", {
        id: counterId,
        tenantId,
        sequenceName,
        value: nextValue,
        updatedAt: new Date().toISOString(),
      });
    }
    return nextValue;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isMockMode: false,
        signIn,
        signOutUser,
        getCollection,
        addDocument,
        updateDocument,
        deleteDocument,
        getNextSequence,
        hasPermission,
        can,
        impersonateUser,
        stopImpersonation,
        isImpersonating,
        originalUser,
        logDirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado com um AuthProvider");
  return context;
}
