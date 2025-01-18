import { useState } from "react";
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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Importar botão para mobile
import { Menu, X } from "lucide-react"; // Ícones do menu

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Clientes", icon: Users, path: "/customers" },
  { title: "Produtos", icon: Package, path: "/products" },
  { title: "Categorias", icon: Tags, path: "/categories" },
  { title: "Vendas", icon: ShoppingCart, path: "/sales" },
  { title: "Devedores", icon: AlertCircle, path: "/debtors" },
];

export function AppSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Controla a abertura do menu mobile

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      {/* Botão hamburger (apenas em telas pequenas) */}
      <Button
        className="lg:hidden absolute top-4 right-4 z-50" // Colocar o botão acima da sidebar na lateral direita
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar para Desktop (Agora à direita) */}
      <Sidebar className="lg:block hidden">
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

      {/* Sidebar para Mobile (Agora à direita) */}
      <div
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileMenu} // Fecha o menu ao clicar fora dele
      >
        <div
          className={`absolute top-0 right-0 bg-white p-4 w-64 h-full transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ul>
            {menuItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={item.path}
                  className="block py-2 px-4 text-black hover:bg-gray-200"
                  onClick={toggleMobileMenu} // Fecha o menu ao clicar na opção
                >
                  <item.icon className="h-5 w-5 inline-block" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
