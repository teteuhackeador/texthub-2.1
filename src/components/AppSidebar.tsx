import {
  Copy,
  Search,
  Link,
  Eye,
  CreditCard,
  Mail,
  User,
  Home,
  CheckCheck,
  Split,
  Hash,
  Binary,
  AtSign,
  FileJson,
  Ruler,
  Plus,
  FileSearch,
  Cloud,
  ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const STAGGER_MS = 70;
const ITEM_ANIM_MS = 280;
const OPEN_STATE_STORAGE_KEY = "texthub.sidebar.openByCategory.v1";

const menuCategories = [
  {
    label: "Geral",
    items: [
      { title: "Início", url: "/", icon: Home },
      { title: "Dividir em Partes", url: "/dividir-partes", icon: Split },
      { title: "Reduzir HAR", url: "/har-reducer", icon: FileJson },
    ]
  },
  {
    label: "Manter",
    items: [
      { title: "Manter Palavra-chave", url: "/keep-keyword", icon: Eye },
    ]
  },
  {
    label: "Filtrar",
    items: [
      { title: "Filtrar 123...", url: "/filter-numeric", icon: Binary },
      { title: "Filtrar Cloud", url: "/filter-cloud", icon: Cloud },
      { title: "Filtrar IntelX", url: "/filter-intelx", icon: FileSearch },
      { title: "Filtrar Log CPF", url: "/filter-cpf", icon: CreditCard },
      { title: "Filtrar Log Email", url: "/filter-email", icon: Mail },
      { title: "Filtrar Log User", url: "/filter-user", icon: User },
      { title: "Filtrar por Tamanho", url: "/filter-by-length", icon: Ruler },
    ]
  },
  {
    label: "Remover",
    items: [
      { title: "Remover Checados", url: "/remove-checked", icon: CheckCheck },
      { title: "Remover Domínio", url: "/remove-domain", icon: AtSign },
      { title: "Remover Duplicatas", url: "/remove-duplicates", icon: Copy },
      { title: "Remover Palavra-chave", url: "/remove-keyword", icon: Search },
      { title: "Remover Símbolos CPF", url: "/remove-cpf-symbols", icon: Hash },
      { title: "Remover URL", url: "/remove-urls", icon: Link },
    ]
  },
  {
    label: "Adicionar",
    items: [
      { title: "Adicionar Sufixo", url: "/add-suffix", icon: Plus },
    ]
  },
];

export function AppSidebar() {
  const { state, setOpenMobile, openMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const collapsed = state === "collapsed";

  const motionRaf1Ref = useRef<number | null>(null);
  const motionRaf2Ref = useRef<number | null>(null);

  // While toggling desktop sidebar (mini <-> normal), we must prevent *any* category
  // animations from running. useLayoutEffect below sets this before paint.
  const isSidebarTransitioningRef = useRef(false);
  const [sidebarTransitioning, setSidebarTransitioning] = useState(false);

  const suppressMotionForATick = useCallback(() => {
    // Cancel any pending re-enable.
    if (motionRaf1Ref.current) cancelAnimationFrame(motionRaf1Ref.current);
    if (motionRaf2Ref.current) cancelAnimationFrame(motionRaf2Ref.current);

    setMotionReady(false);
    // Two rAFs to ensure the DOM applied the new layout/state before re-enabling transitions.
    motionRaf1Ref.current = requestAnimationFrame(() => {
      motionRaf2Ref.current = requestAnimationFrame(() => {
        setMotionReady(true);
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (motionRaf1Ref.current) cancelAnimationFrame(motionRaf1Ref.current);
      if (motionRaf2Ref.current) cancelAnimationFrame(motionRaf2Ref.current);
    };
  }, []);

  // When switching from collapsed (mini) -> expanded, the UI used to force all categories open.
  // If the user had categories saved as closed, expanding would immediately animate a mass-close.
  // We disable animations for a single frame on that transition.
  const prevCollapsedRef = useRef(collapsed);

  // Desktop: kill animations BEFORE the browser paints the new collapsed state.
  useLayoutEffect(() => {
    if (isMobile) return;

    const wasCollapsed = prevCollapsedRef.current;
    prevCollapsedRef.current = collapsed;

    // Any toggle of the sidebar (collapsed <-> expanded) should NOT re-run category animations.
    if (wasCollapsed !== collapsed) {
      // Cancel any pending re-enable.
      if (motionRaf1Ref.current) cancelAnimationFrame(motionRaf1Ref.current);
      if (motionRaf2Ref.current) cancelAnimationFrame(motionRaf2Ref.current);

      isSidebarTransitioningRef.current = true;
      setSidebarTransitioning(true);
      setMotionReady(false);

      // Two rAFs to ensure the DOM applied the new layout/state before re-enabling transitions.
      motionRaf1Ref.current = requestAnimationFrame(() => {
        motionRaf2Ref.current = requestAnimationFrame(() => {
          isSidebarTransitioningRef.current = false;
          setSidebarTransitioning(false);
          setMotionReady(true);
        });
      });
    }
  }, [collapsed, isMobile]);

  const defaultOpenByCategory = useMemo(
    () => Object.fromEntries(menuCategories.map((c) => [c.label, true])) as Record<string, boolean>,
    [],
  );

  const readOpenStateFromStorage = (): Record<string, boolean> => {
    try {
      const raw = localStorage.getItem(OPEN_STATE_STORAGE_KEY);
      if (!raw) return defaultOpenByCategory;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      // Ensure all categories exist (handles future label changes safely)
      return { ...defaultOpenByCategory, ...parsed };
    } catch {
      return defaultOpenByCategory;
    }
  };

  const [openByCategory, setOpenByCategory] = useState<Record<string, boolean>>(() => readOpenStateFromStorage());

  // Prevent “startup” animations when the sidebar remounts / reopens (ex: mobile close/open).
  const [motionReady, setMotionReady] = useState(false);

  // First mount: enable animations only after the initial paint.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMotionReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mobile: when the Sheet opens, re-hydrate categories and keep animations disabled for this open.
  // This avoids the “everything appears open then closes” glitch.
  useEffect(() => {
    if (!isMobile) return;
    if (!openMobile) return;

    setMotionReady(false);
    setOpenByCategory(readOpenStateFromStorage());

    suppressMotionForATick();
  }, [isMobile, openMobile, suppressMotionForATick]);

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_STATE_STORAGE_KEY, JSON.stringify(openByCategory));
    } catch {
      // ignore
    }
  }, [openByCategory]);

  const handleNavClick = () => {
    // Close mobile sidebar when a nav item is clicked
    setOpenMobile(false);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      collapsible="icon"
      side="right"
      className={
        [
          // O componente ui/sidebar aplica `bg-sidebar` no container interno
          // `[data-sidebar=sidebar]`. Para garantir transparência, estilizamos
          // esse elemento explicitamente.
          "[&_[data-sidebar=sidebar]]:bg-sidebar/35",
          "supports-[backdrop-filter]:[&_[data-sidebar=sidebar]]:bg-sidebar/20",
          // Mantém o wrapper sem fundo para não ficar opaco
          "bg-transparent",
        ].join(" ")
      }
    >
      <SidebarContent className="gap-1">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TH</span>
            </div>
            {!collapsed && (
              <div>
                  <h2 className="font-bold text-foreground">TextHub</h2>
                <p className="text-xs text-muted-foreground">Processador de texto</p>
              </div>
            )}
          </div>
        </div>

        {menuCategories.map((category) => {
          const open = collapsed ? true : (openByCategory[category.label] ?? true);
          const itemCount = category.items.length;

          // Keep the container (height) transition long enough so the last staggered
          // item can finish animating before the content gets clipped.
          const openDurationMs = 300;
          const closeCollapseMs = 260;
          const totalCloseMs = Math.max(0, (itemCount - 1) * STAGGER_MS + ITEM_ANIM_MS);
          // Delay the height collapse so items can fade out bottom->top without being clipped.
          const closeDelayMs = Math.max(0, totalCloseMs - closeCollapseMs);

           const animationsEnabled = motionReady && !sidebarTransitioning && !isSidebarTransitioningRef.current;

          return (
            <Collapsible
              key={category.label}
              open={open}
              onOpenChange={(nextOpen) => {
                if (collapsed) return;
                setOpenByCategory((prev) => ({ ...prev, [category.label]: nextOpen }));
              }}
            >
              <SidebarGroup className="px-2">
                {collapsed ? (
                  <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-muted-foreground">
                    {/* No modo mini, não há clique; manter comportamento atual */}
                  </SidebarGroupLabel>
                ) : (
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground [&[data-state=open]>svg]:rotate-180"
                      aria-label={`Alternar categoria ${category.label}`}
                    >
                      <span>{category.label}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </button>
                  </CollapsibleTrigger>
                )}

                <CollapsibleContent
                  forceMount
                  className="
                    group/cat
                    overflow-hidden
                    h-0
                    data-[state=open]:h-[var(--radix-collapsible-content-height)]
                    transition-[height] ease-in-out
                    data-[state=closed]:pointer-events-none
                  "
                  style={{
                    transitionDuration: animationsEnabled
                      ? `${open ? openDurationMs : closeCollapseMs}ms`
                      : "0ms",
                    transitionDelay: animationsEnabled ? `${open ? 0 : closeDelayMs}ms` : "0ms",
                  }}
                >
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {category.items.map((item, index) => {
                        const delayIndex = open
                          ? index
                          : (category.items.length - 1 - index);
                        const delayMs = animationsEnabled ? delayIndex * STAGGER_MS : 0;

                        return (
                        <SidebarMenuItem
                          key={item.title}
                          className={
                            [
                              // Minimal stagger: slide+fade, one-by-one.
                              "transition-[transform,opacity] duration-280 ease-out will-change-transform",
                              "group-data-[state=open]/cat:translate-y-0 group-data-[state=open]/cat:opacity-100",
                              "group-data-[state=closed]/cat:-translate-y-1 group-data-[state=closed]/cat:opacity-0",
                            ].join(" ")
                          }
                          style={{ transitionDelay: `${delayMs}ms` }}
                        >
                          <SidebarMenuButton asChild className="w-full">
                            <NavLink
                              to={item.url}
                              end
                              onClick={handleNavClick}
                              className={({ isActive }) =>
                                `group/navitem flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavCls({ isActive })} !overflow-visible`
                              }
                            >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              {!collapsed && (
                                <div className="relative z-10 min-w-0 text-sm font-medium origin-bottom inline-block will-change-transform transition-transform duration-200 group-hover/navitem:scale-110">
                                  <span className="block truncate">{item.title}</span>
                                </div>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
