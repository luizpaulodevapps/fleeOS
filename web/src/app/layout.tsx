"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import "./globals.css";

const queryClient = new QueryClient();

function SidebarContent({ 
  isMobileOpen, 
  onCloseMobile, 
  isCollapsed, 
  onToggleCollapse 
}: { 
  isMobileOpen?: boolean; 
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { currentUser, signOutUser, can } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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
      title: "Painel & Desempenho",
      icon: "monitoring",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard", permission: "" },
        { name: "Relatórios & ROI", href: "/reports", icon: "assessment", permission: "reports.view" }
      ]
    },
    {
      title: "Frota & Cadastros",
      icon: "local_shipping",
      items: [
        { name: "Veículos", href: "/vehicles", icon: "local_shipping", permission: "vehicles.view" },
        { name: "Motoristas", href: "/drivers", icon: "person", permission: "drivers.view" },
        { name: "Vínculos", href: "/assignments", icon: "link", permission: "vehicles.edit" }
      ]
    },
    {
      title: "Central de Operações",
      icon: "published_with_changes",
      items: [
        { name: "Central Operacional", href: "/operations", icon: "published_with_changes", permission: "vehicles.edit" },
        { name: "Manutenção & Oficina", href: "/maintenance", icon: "build", permission: "maintenance.view" },
        { name: "Centro Regulatório", href: "/dispatcher", icon: "local_taxi", permission: "vehicles.edit" },
        { name: "Gestão de Sinistros", href: "/claims", icon: "shield", permission: "claims.view" },
        { name: "Infrações & Multas", href: "/fines", icon: "photo_camera", permission: "fines.view" }
      ]
    },
    {
      title: "Gestão Financeira",
      icon: "account_balance_wallet",
      items: [
        { name: "Caixa / Checkout", href: "/cashier", icon: "point_of_sale", permission: "cashier.view" },
        { name: "Extrato Financeiro", href: "/financial", icon: "payments", permission: "financial.view" },
        { name: "Regras de Tarifação", href: "/pricing", icon: "price_change", permission: "financial.view" }
      ]
    },
    {
      title: "Portais Externos",
      icon: "open_in_new",
      items: [
        { name: "Portal da Oficina", href: "/portals/workshop", icon: "build_circle", permission: "maintenance.view" },
        { name: "Portal do Regulador", href: "/portals/adjuster", icon: "gavel", permission: "claims.view" }
      ]
    },
    {
      title: "Sistema",
      icon: "settings",
      items: [
        { name: "Configurações", href: "/settings", icon: "settings", permission: "settings.view" }
      ]
    }
  ];

  // Auto-expand group containing the active page on mount
  useEffect(() => {
    if (isCollapsed) return;
    const activeIdx = menuGroups.findIndex(group =>
      group.items.some(item => {
        const itemPath = item.href.split("?")[0];
        return pathname === itemPath || pathname.startsWith(itemPath + "/");
      })
    );
    if (activeIdx !== -1) {
      setExpandedGroups(prev => ({ ...prev, [activeIdx]: true }));
    }
  }, [pathname, isCollapsed]);

  const toggleGroup = (idx: number) => {
    setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-obsidian-950/45 backdrop-blur-sm z-45 md:hidden"
        />
      )}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col py-stack-lg border-r border-outline-variant bg-surface-container-lowest z-50 transition-all duration-300 md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:flex ${isCollapsed ? "w-20" : "w-64"}`}>
        {/* Brand Header */}
        <div className={`mb-6 flex items-center ${isCollapsed ? "flex-col gap-4 px-2" : "justify-between px-6"}`}>
          {!isCollapsed ? (
            <div>
              <h1 className="font-geist font-bold text-3xl tracking-tight text-primary">
                FleetOS
              </h1>
              <p className="font-geist text-xs text-on-surface-variant font-semibold">
                Enterprise Fleet Admin
              </p>
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center font-geist font-bold text-xl text-primary" title="FleetOS">
              F
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container items-center justify-center transition-colors"
              title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isCollapsed ? "chevron_right" : "chevron_left"}
              </span>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container flex items-center justify-center transition-colors"
                title="Fechar Menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? "px-2 space-y-1.5" : "px-4 space-y-3"}`}>
          {menuGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter(hasPermission);
            if (visibleItems.length === 0) return null;

            // Icon-only flat links when collapsed
            if (isCollapsed) {
              return (
                <div key={groupIdx} className="space-y-1.5 py-1.5 border-b border-outline-variant/30 last:border-0 flex flex-col items-center">
                  {visibleItems.map((item) => {
                    const isActive = item.href.includes("?")
                      ? (pathname === item.href.split("?")[0] && tabParam === new URLSearchParams(item.href.split("?")[1]).get("tab"))
                      : (pathname === item.href && !tabParam);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.name}
                        onClick={() => onCloseMobile?.()}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600 shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            const isCollapsible = visibleItems.length > 1;
            const isExpanded = expandedGroups[groupIdx];

            return (
              <div key={groupIdx} className="space-y-1 bg-surface-container-lowest rounded-xl p-0.5">
                {isCollapsible ? (
                  <>
                    <button
                      onClick={() => toggleGroup(groupIdx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left group hover:bg-surface-container/60`}
                    >
                      <span className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                        <span className="material-symbols-outlined text-[16px] text-slate-500 group-hover:text-primary transition-colors">{group.icon}</span>
                        <span className="font-geist text-[11px] tracking-wide uppercase">{group.title}</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-800 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="pl-3 border-l border-outline-variant/60 ml-5 mt-1 space-y-0.5 transition-all">
                        {visibleItems.map((item) => {
                          const isActive = item.href.includes("?")
                            ? (pathname === item.href.split("?")[0] && tabParam === new URLSearchParams(item.href.split("?")[1]).get("tab"))
                            : (pathname === item.href && !tabParam);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => onCloseMobile?.()}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${
                                isActive
                                  ? "bg-indigo-50 text-indigo-700 font-bold border-r-2 border-indigo-600 shadow-sm"
                                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                              <span className="font-geist">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  // Simple non-collapsible link
                  visibleItems.map((item) => {
                    const isActive = item.href.includes("?")
                      ? (pathname === item.href.split("?")[0] && tabParam === new URLSearchParams(item.href.split("?")[1]).get("tab"))
                      : (pathname === item.href && !tabParam);
                    return (
                      <div key={item.href} className="space-y-1">
                        <span className="block px-3 text-[9px] font-bold uppercase tracking-wider text-outline select-none">
                          {group.title}
                        </span>
                        <Link
                          href={item.href}
                          onClick={() => onCloseMobile?.()}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group font-medium text-xs ${
                            isActive
                              ? "bg-indigo-50 border-r-2 border-indigo-600 text-indigo-700 font-bold shadow-sm"
                              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="font-geist">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className={`mt-auto pt-4 border-t border-outline-variant ${isCollapsed ? "flex flex-col items-center gap-3 px-2" : "px-4 space-y-3"}`}>
          {isCollapsed ? (
            <>
              <div 
                className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-xs text-on-primary-fixed cursor-pointer"
                title={`${currentUser.displayName} (${currentUser.roleId ? currentUser.roleId.replace("role-", "").toUpperCase() : currentUser.role.toUpperCase()})`}
              >
                {currentUser.displayName ? currentUser.displayName.substr(0, 2).toUpperCase() : "US"}
              </div>
              <button
                onClick={() => signOutUser()}
                title="Sair do Sistema"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-outline hover:text-red-650 hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </>
          ) : (
            <>
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-outline hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-outline-variant/60"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="font-geist">Sair do Sistema</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fleetos_sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("fleetos_sidebar_collapsed", String(next));
      return next;
    });
  };

  const [searchVal, setSearchVal] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const allSearchRoutes = useMemo(() => [
    { name: "Dashboard", href: "/dashboard", description: "Painel de controle e BI", icon: "dashboard" },
    { name: "Relatórios & ROI", href: "/reports", description: "Relatórios gerenciais e custos", icon: "assessment" },
    { name: "Veículos", href: "/vehicles", description: "Cadastro da frota", icon: "local_shipping" },
    { name: "Motoristas", href: "/drivers", description: "Cadastro de motoristas", icon: "person" },
    { name: "Vínculos", href: "/assignments", description: "Vincular motorista a veículo", icon: "link" },
    { name: "Central Operacional", href: "/operations", description: "Status em tempo real", icon: "published_with_changes" },
    { name: "Manutenção & Oficina", href: "/maintenance", description: "Planos de manutenção e O.S.", icon: "build" },
    { name: "Centro Regulatório", href: "/dispatcher", description: "Alvarás, vistorias e venda de ativos", icon: "local_taxi" },
    { name: "Gestão de Sinistros", href: "/claims", description: "Abertura e acompanhamento de sinistros", icon: "shield" },
    { name: "Infrações & Multas", href: "/fines", description: "Controle de multas e condutores", icon: "photo_camera" },
    { name: "Caixa / Checkout", href: "/cashier", description: "Operações de caixa rápido", icon: "point_of_sale" },
    { name: "Extrato Financeiro", href: "/financial", description: "Lançamentos e conciliação", icon: "payments" },
    { name: "Regras de Tarifação", href: "/pricing", description: "Precificação de locações", icon: "price_change" },
    { name: "Contratos", href: "/contracts", description: "Contratos de locação e termos", icon: "description" },
    { name: "Documentação", href: "/documents", description: "Arquivos e certidões", icon: "article" },
    { name: "Fila de Vencimentos", href: "/expirations", description: "Vencimento de CNH e alvará", icon: "notification_important" },
    { name: "Portal da Oficina", href: "/portals/workshop", description: "Acesso externo para oficinas", icon: "build_circle" },
    { name: "Portal do Regulador", href: "/portals/adjuster", description: "Acesso externo para reguladores", icon: "gavel" },
    { name: "Configurações do Sistema", href: "/settings", description: "Configurações gerais", icon: "settings" }
  ], []);

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
    "/fines": "fines.view",
    "/expirations": "expirations.view",
    "/reports": "reports.view",
    "/portals/workshop": "maintenance.view",
    "/portals/adjuster": "claims.view",
    "/dispatcher": "vehicles.edit",
  };

  const filteredRoutes = useMemo(() => {
    if (!searchVal.trim()) return [];
    const term = searchVal.toLowerCase();
    return allSearchRoutes.filter(route => {
      const nameMatch = route.name.toLowerCase().includes(term);
      const descMatch = route.description.toLowerCase().includes(term);
      if (!nameMatch && !descMatch) return false;

      const permission = routePermissions[route.href] || (route.href.startsWith("/settings") ? "settings.view" : "");
      if (!permission) return true;
      if (permission === "settings.view") return can("settings.view") || can("users.manage");
      return can(permission);
    });
  }, [searchVal, can]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
            <SidebarContent 
              isMobileOpen={isMobileMenuOpen} 
              onCloseMobile={() => setIsMobileMenuOpen(false)} 
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </Suspense>
        )}
        
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${currentUser ? (isSidebarCollapsed ? "md:pl-20" : "md:pl-64") : ""}`}>
          {currentUser && (
            <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
              <div className="flex items-center gap-gutter">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container flex items-center justify-center transition-colors"
                  title="Abrir Menu"
                >
                  <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>
                <div className="relative">
                  {showSearchResults && (
                    <div 
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setShowSearchResults(false)}
                    />
                  )}
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-body-md z-50">search</span>
                  <input 
                    className="bg-surface-container-low border-none rounded-lg pl-10 pr-10 py-2 w-48 sm:w-64 lg:w-96 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all relative z-50" 
                    placeholder="Buscar páginas e relatórios..." 
                    type="text"
                    value={searchVal}
                    onChange={(e) => {
                      setSearchVal(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                  />
                  {showSearchResults && searchVal.trim() && (
                    <button 
                      onClick={() => {
                        setSearchVal("");
                        setShowSearchResults(false);
                      }} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 z-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                  {showSearchResults && filteredRoutes.length > 0 && (
                    <div className="absolute left-0 mt-2 w-72 sm:w-80 lg:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {filteredRoutes.map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => {
                            setSearchVal("");
                            setShowSearchResults(false);
                          }}
                          className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px] text-slate-500 mt-0.5">{route.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{route.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{route.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {showSearchResults && searchVal.trim() && filteredRoutes.length === 0 && (
                    <div className="absolute left-0 mt-2 w-72 sm:w-80 lg:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center text-[11px] text-slate-400 z-50 font-medium">
                      Nenhuma página encontrada para "{searchVal}"
                    </div>
                  )}
                </div>
                <nav className="hidden lg:flex items-center gap-stack-lg">
                  <span className="font-geist text-label-md text-primary font-bold border-b-2 border-primary pb-1 cursor-pointer">Overview</span>
                  <span className="font-geist text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-not-allowed">Mapa ao vivo</span>
                  <span className="font-geist text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-not-allowed">Alertas</span>
                </nav>
              </div>
              
              <div className="flex items-center gap-4">
                {isMockMode && (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold px-2 py-0.5 rounded hidden sm:inline-block">
                    Offline Mock
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant flex items-center justify-center font-bold text-xs text-on-primary-fixed">
                  {currentUser.displayName ? currentUser.displayName.substr(0, 2).toUpperCase() : "US"}
                </div>
              </div>
            </header>
          )}
          
          <main className={`flex-1 p-margin-mobile md:p-margin-desktop space-y-stack-lg ${currentUser ? "bg-background" : ""}`}>
            {hasRouteAccess ? children : <AcessoNegado requiredPermission={requiredPermission} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function UnregisterStaleServiceWorkers() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
  }
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>FleetOS | Enterprise Fleet Manager</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(r) { r.unregister(); });
            });
          }
          if ('caches' in window) {
            caches.keys().then(function(names) {
              names.forEach(function(n) { caches.delete(n); });
            });
          }
        `}} />
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
