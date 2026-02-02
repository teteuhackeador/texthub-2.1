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
import { useMemo, useState } from "react";
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
    label: "Adicionar",
    items: [
      { title: "Adicionar Sufixo", url: "/add-suffix", icon: Plus },
    ]
  },
  {
    label: "Manter",
    items: [
      { title: "Manter Palavra-chave", url: "/keep-keyword", icon: Eye },
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
];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const collapsed = state === "collapsed";

  const defaultOpenByCategory = useMemo(
    () => Object.fromEntries(menuCategories.map((c) => [c.label, true])) as Record<string, boolean>,
    [],
  );
  const [openByCategory, setOpenByCategory] = useState<Record<string, boolean>>(defaultOpenByCategory);

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
                    transition-[height] duration-300 ease-in-out
                    data-[state=closed]:pointer-events-none
                  "
                >
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {category.items.map((item, index) => {
                        const delayIndex = open
                          ? index
                          : (category.items.length - 1 - index);
                        const delayMs = delayIndex * STAGGER_MS;

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
