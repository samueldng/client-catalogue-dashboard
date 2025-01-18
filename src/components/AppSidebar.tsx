import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  AlertCircle,
  Tags,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile"; // Importando o hook useIsMobile

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Clientes", icon: Users, path: "/customers" },
  { title: "Produtos", icon: Package, path: "/products" },
  { title: "Categorias", icon: Tags, path: "/categories" },
  { title: "Vendas", icon: ShoppingCart, path: "/sales" },
  { title: "Devedores", icon: AlertCircle, path: "/debtors" },
];

export function AppSidebar() {
  const isMobile = useIsMobile();  // Verifica se o dispositivo é móvel
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar o menu lateral

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`flex ${isMobile && !isSidebarOpen ? "hidden" : "block"} lg:block`}>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Botão hamburger para dispositivos móveis */}
      {isMobile && (
        <button
          className="lg:hidden fixed top-4 left-4 p-3 bg-primary text-white rounded-full"
          onClick={toggleSidebar}
        >
          ☰
        </button>
      )}
    </div>
  );
}
