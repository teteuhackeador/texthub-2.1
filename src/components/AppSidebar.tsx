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
  Cloud
} from "lucide-react";
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

const menuCategories = [
  {
    label: "Geral",
    items: [
      { title: "Início", url: "/", icon: Home },
      { title: "Dividir em Partes", url: "/dividir-partes", icon: Split },
      { title: "HAR Reducer", url: "/har-reducer", icon: FileJson },
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

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";

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
    >
      <SidebarContent>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MT</span>
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-foreground">MultiTools</h2>
                <p className="text-xs text-muted-foreground">Processador de texto</p>
              </div>
            )}
          </div>
        </div>

        {menuCategories.map((category) => (
          <SidebarGroup key={category.label} className="px-2">
            <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-muted-foreground">
              {!collapsed && category.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
