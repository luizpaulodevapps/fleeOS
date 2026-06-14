"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import "./globals.css";

const queryClient = new QueryClient();

function SidebarContent() {
  const { currentUser, signOutUser, can } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  if (!currentUser) return null;

  const hasPermission = (item: any) => {
    if (item.href === "/settings") {
      return can("settings.view") || can("users.manage");
    }
    if (!item.permission) return true;
    return can(item.permission);
  };

  const menuGroups = [
    {
      title: "Geral",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard", permission: "" }
      ]
    },
    {
      title: "Cadastros",
      items: [
        { name: "Motoristas", href: "/drivers", icon: "person", permission: "drivers.view" },
        { name: "Veículos", href: "/vehicles", icon: "local_shipping", permission: "vehicles.view" }
      ]
    },
    {
      title: "Operações",
      items: [
        { name: "Vínculos", href: "/assignments", icon: "link", permission: "vehicles.edit" },
        { name: "Central Operacional", href: "/operations", icon: "published_with_changes", permission: "vehicles.edit" },
        { name: "Gestão de Sinistros", href: "/claims", icon: "shield", permission: "claims.view" },
        { name: "Manutenção", href: "/maintenance", icon: "build", permission: "maintenance.view" },
        { name: "Centro Regulatório", href: "/dispatcher", icon: "local_taxi", permission: "vehicles.edit" }
      ]
    },
    {
      title: "Financeiro & Precificação",
      items: [
        { name: "Checkout", href: "/cashier", icon: "point_of_sale", permission: "cashier.view" },
        { name: "Extrato Financeiro", href: "/financial", icon: "payments", permission: "financial.view" },
        { name: "Precificação e Regras", href: "/pricing", icon: "price_change", permission: "financial.view" }
      ]
    },
    {
      title: "Contratos & Documentos",
      items: [
        { name: "Contratos", href: "/contracts", icon: "description", permission: "contracts.view" },
        { name: "Documentos", href: "/documents", icon: "article", permission: "contracts.view" },
        { name: "Fila de Vencimentos", href: "/expirations", icon: "notification_important", permission: "expirations.view" },
        { name: "Relatórios & ROI", href: "/reports", icon: "assessment", permission: "reports.view" }
      ]
    },
    {
      title: "Portais Externos",
      items: [
        { name: "Portal da Oficina", href: "/portals/workshop", icon: "build_circle", permission: "maintenance.view" },
        { name: "Portal do Regulador", href: "/portals/adjuster", icon: "gavel", permission: "claims.view" }
      ]
    },
    {
      title: "Sistema",
      items: [
        { name: "Configurações", href: "/settings", icon: "settings", permission: "settings.view" }
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col py-stack-lg border-r border-outline-variant bg-surface-container-lowest w-64 z-50 hidden md:flex">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <h1 className="font-geist font-bold text-3xl tracking-tight text-primary">
          FleetOS
        </h1>
        <p className="font-geist text-xs text-on-surface-variant font-semibold">
          Enterprise Fleet Admin
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
        {menuGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(hasPermission);
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              <span className="block px-3 text-[9px] font-bold uppercase tracking-wider text-outline select-none">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = item.href.includes("?")
                    ? (pathname === item.href.split("?")[0] && tabParam === new URLSearchParams(item.href.split("?")[1]).get("tab"))
                    : (pathname === item.href && !tabParam);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group font-medium text-xs ${
                        isActive
                          ? "bg-surface-container border-r-2 border-primary text-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span className="font-geist">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="mt-auto px-4 pt-4 border-t border-outline-variant space-y-3">
        <div className="flex items-center space-x-3 px-3 py-2 bg-surface-container-low rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-xs text-on-primary-fixed">
            {currentUser.displayName ? currentUser.displayName.substr(0, 2).toUpperCase() : "US"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary truncate">{currentUser.displayName}</p>
            <p className="text-[9px] text-on-surface-variant uppercase truncate font-bold animate-pulse">
              {currentUser.roleId ? currentUser.roleId.replace("role-", "").replace("-", " ") : currentUser.role.replace("_", " ")}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOutUser()}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/10 transition-colors rounded-lg font-semibold text-xs"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-geist">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}

function AcessoNegado({ requiredPermission }: { requiredPermission: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center p-8 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-lg space-y-5 my-12">
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-600">
        <span className="material-symbols-outlined text-[48px] animate-pulse">lock</span>
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-primary font-geist">Acesso Restrito</h2>
        <p className="text-on-surface-variant text-xs mt-2 leading-relaxed">
          O seu perfil de acesso não possui a permissão requerida para esta funcionalidade.
        </p>
      </div>
      <div className="bg-surface-container p-3 rounded-lg border border-outline-variant w-full font-mono text-[10px] text-left text-on-surface-variant">
        <span className="font-bold text-red-600">Permissão Requerida:</span> {requiredPermission}
      </div>
      <p className="text-on-surface-variant text-[11px] leading-relaxed">
        Caso necessite visualizar ou operar esta área, por favor entre em contato com o administrador ou o proprietário da frota.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md w-full justify-center"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Voltar ao Dashboard</span>
      </Link>
    </div>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isMockMode, can, isImpersonating, stopImpersonation } = useAuth();
  const pathname = usePathname();

  // Redirect workshop/adjuster roles to their portals if they try to access standard pages
  useEffect(() => {
    if (currentUser && typeof window !== "undefined") {
      if (currentUser.roleId === "role-workshop") {
        if (pathname === "/dashboard" || pathname === "/" || (!pathname.startsWith("/portals/workshop") && pathname !== "/login")) {
          window.location.href = "/portals/workshop";
        }
      } else if (currentUser.roleId === "role-adjuster") {
        if (pathname === "/dashboard" || pathname === "/" || (!pathname.startsWith("/portals/adjuster") && pathname !== "/login")) {
          window.location.href = "/portals/adjuster";
        }
      }
    }
  }, [currentUser, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant text-xs font-semibold tracking-wide">Carregando FleetOS...</p>
        </div>
      </div>
    );
  }

  // Redirect to login page if not logged in and not already on the login page
  if (!currentUser && pathname !== "/login") {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Route guarding
  const routePermissions: Record<string, string> = {
    "/drivers": "drivers.view",
    "/vehicles": "vehicles.view",
    "/contracts": "contracts.view",
    "/assignments": "vehicles.edit",
    "/operations": "vehicles.edit",
    "/claims": "claims.view",
    "/documents": "contracts.view",
    "/cashier": "cashier.view",
    "/financial": "financial.view",
    "/pricing": "financial.view",
    "/maintenance": "maintenance.view",
    "/expirations": "expirations.view",
    "/reports": "reports.view",
    "/portals/workshop": "maintenance.view",
    "/portals/adjuster": "claims.view",
    "/dispatcher": "vehicles.edit",
  };

  let hasRouteAccess = true;
  let requiredPermission = "";

  if (currentUser && pathname) {
    // Check main operational routes
    if (routePermissions[pathname]) {
      requiredPermission = routePermissions[pathname];
      hasRouteAccess = can(requiredPermission);
    }
    // Check settings sub-routes
    if (pathname.startsWith("/settings")) {
      requiredPermission = "settings.view";
      hasRouteAccess = can("settings.view") || can("users.manage");
    }

    // Role-specific blocks for portals (excluding login/logout/portals)
    if (currentUser.roleId === "role-workshop" && !pathname.startsWith("/portals/workshop") && pathname !== "/login") {
      hasRouteAccess = false;
      requiredPermission = "workshop.portal_only";
    }
    if (currentUser.roleId === "role-adjuster" && !pathname.startsWith("/portals/adjuster") && pathname !== "/login") {
      hasRouteAccess = false;
      requiredPermission = "adjuster.portal_only";
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Impersonation Banner */}
      {currentUser && isImpersonating && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold font-geist z-[999] sticky top-0 shadow-lg border-b border-red-700 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span>
              MODO DE IMPERSONAÇÃO: Visualizando como{" "}
              <span className="underline font-black">{currentUser.displayName}</span> ({currentUser.email}) [
              {currentUser.roleId ? currentUser.roleId.replace("role-", "").toUpperCase() : currentUser.role.toUpperCase()}]
            </span>
          </div>
          <button
            onClick={stopImpersonation}
            className="bg-white text-red-600 hover:bg-slate-100 transition-colors px-3 py-1 rounded-lg font-extrabold uppercase tracking-wider text-[10px] shadow"
          >
            Sair do Modo de Impersonação
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-screen">
        {currentUser && (
          <Suspense fallback={null}>
            <SidebarContent />
          </Suspense>
        )}
        
        <div className={`flex-1 flex flex-col min-h-screen ${currentUser ? "md:pl-64" : ""}`}>
          {currentUser && (
            <header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
              <div className="flex items-center gap-gutter">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-body-md">search</span>
                  <input 
                    className="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 w-64 lg:w-96 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="Pesquisar veículo, motorista..." 
                    type="text"
                  />
                </div>
                <nav className="hidden lg:flex items-center gap-stack-lg">
                  <span className="font-geist text-label-md text-primary font-bold border-b-2 border-primary pb-1 cursor-pointer">Overview</span>
                  <span className="font-geist text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-not-allowed">Mapa ao vivo</span>
                  <span className="font-geist text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-not-allowed">Alertas</span>
                </nav>
              </div>
              
              <div className="flex items-center gap-4">
                {isMockMode && (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold px-2 py-0.5 rounded">
                    Offline Mock
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant flex items-center justify-center font-bold text-xs text-on-primary-fixed">
                  {currentUser.displayName ? currentUser.displayName.substr(0, 2).toUpperCase() : "US"}
                </div>
              </div>
            </header>
          )}
          
          <main className={`flex-1 p-margin-desktop space-y-stack-lg ${currentUser ? "bg-background" : ""}`}>
            {hasRouteAccess ? children : <AcessoNegado requiredPermission={requiredPermission} />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>FleetOS | Enterprise Fleet Manager</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
