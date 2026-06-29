"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

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
  // Database Operations (Multi-Tenant automatic filtering)
  getCollection: (collName: string) => Promise<any[]>;
  addDocument: (collName: string, data: any) => Promise<any>;
  updateDocument: (collName: string, docId: string, data: any) => Promise<void>;
  deleteDocument: (collName: string, docId: string) => Promise<void>;
  getNextSequence: (sequenceName: string, minimumValue?: number) => Promise<number>;
  
  // RBAC & Impersonation & Audit Helpers
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

  // Check Supabase configuration on load
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.error("ERRO CRÍTICO: Chaves do Supabase não encontradas ou inválidas no arquivo .env. O sistema está rodando em modo Supabase exclusivo.");
    }
  }, []);

  // Auto login from saved user session in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("fleetos_current_user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Erro ao restaurar sessão salva:", e);
        }
      }
      setLoading(false);
    }
  }, []);

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
        const listRP = await supabase.db.select("role_permissions");
        const matchedPerms = listRP
          .filter((rp: any) => rp.role_id === currentUser.roleId || rp.roleId === currentUser.roleId)
          .map((rp: any) => rp.permission_id || rp.permissionId);
        setUserPermissions(matchedPerms);
      } catch (e) {
        console.error("Erro ao carregar permissões do usuário no Supabase", e);
        setUserPermissions([]);
      }
    };

    loadUserPermissions();
  }, [currentUser]);

  // Load impersonation state on startup if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const orig = localStorage.getItem("fleetos_original_user");
      if (orig) {
        setOriginalUser(JSON.parse(orig));
        setIsImpersonating(true);
      }
    }
  }, []);

  // Direct audit logger
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
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.db.insert("audit_logs", enriched);
    } catch (e) {
      console.error("Erro ao registrar log de auditoria no Supabase", e);
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
    
    // 1. Basic permission check
    if (!hasPermission(action)) return false;
    
    // 2. Resource-level checks
    if (resource) {
      // Isolation check
      if (resource.tenantId && resource.tenantId !== currentUser.tenantId) {
        return false;
      }
      // If user is driver, they can only view or edit their own resources
      if (currentUser.roleId === "role-driver" || currentUser.role === "driver") {
        const resourceDriverId = resource.driverId || resource.id || resource.userId;
        if (resourceDriverId && resourceDriverId !== currentUser.uid && resourceDriverId !== "drv-1") {
          return false;
        }
      }
    }
    
    return true;
  };

  const impersonateUser = async (email: string) => {
    if (!currentUser) return;
    
    if (currentUser.roleId !== "role-super-admin" && currentUser.role !== "super_admin") {
      throw new Error("Apenas super administradores podem impersonar outros usuários.");
    }

    const profiles = await supabase.db.select("user_profiles");
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
      active: targetUser.active
    };

    // Log the start of impersonation using the original user context
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
      createdAt: new Date().toISOString()
    };

    await supabase.db.insert("audit_logs", enriched);

    setOriginalUser(null);
    setIsImpersonating(false);
    setCurrentUser(parsedOriginalUser);
  };

  const signIn = async (email: string, pass: string): Promise<UserProfile> => {
    const session = await supabase.auth.signIn(email, pass);
    const profile = await supabase.db.selectById("user_profiles", session.uid);
    if (!profile) {
      throw new Error("Perfil de usuário não encontrado no Supabase.");
    }
    const userProfile: UserProfile = {
      uid: session.uid,
      email: session.email,
      displayName: profile.displayName || session.displayName || "Usuário",
      role: profile.role || "driver",
      roleId: profile.roleId || "role-readonly",
      tenantId: profile.tenantId || "tenant-1",
      active: profile.active ?? true
    };

    setCurrentUser(userProfile);
    localStorage.setItem("fleetos_current_user", JSON.stringify(userProfile));
    return userProfile;
  };

  const signOutUser = async () => {
    if (currentUser) {
      await logDirect("Efetuou logout do sistema", "auth", currentUser.uid);
    }
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem("fleetos_current_user");
  };

  // MULTI-TENANT FILTERED COLLECTION (Supabase Only)
  const getCollection = async (collName: string): Promise<any[]> => {
    if (!currentUser) return [];
    const tenantId = (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin") ? undefined : currentUser.tenantId;
    return supabase.db.select(collName, tenantId);
  };

  const addDocument = async (collName: string, data: any): Promise<any> => {
    const enrichedData = {
      ...data,
      tenantId: currentUser?.tenantId || "tenant-1",
      createdAt: new Date().toISOString()
    };

    const newDoc = await supabase.db.insert(collName, enrichedData);

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
    const beforeData = await supabase.db.selectById(collName, docId);
    await supabase.db.update(collName, docId, data);
    const afterData = await supabase.db.selectById(collName, docId);

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
    const beforeData = await supabase.db.selectById(collName, docId);
    await supabase.db.delete(collName, docId);

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

    const existing = await supabase.db.selectById("tenant_counters", counterId);
    const currentValue = existing ? Number(existing.value || 0) : 0;
    const nextValue = Math.max(currentValue, minimumValue) + 1;
    
    if (existing) {
      await supabase.db.update("tenant_counters", counterId, { value: nextValue, updatedAt: new Date().toISOString() });
    } else {
      await supabase.db.insert("tenant_counters", {
        id: counterId,
        tenantId,
        sequenceName,
        value: nextValue,
        updatedAt: new Date().toISOString()
      });
    }
    return nextValue;
  };

  return (
    <AuthContext.Provider value={{
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
      logDirect
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado com um AuthProvider");
  return context;
}
