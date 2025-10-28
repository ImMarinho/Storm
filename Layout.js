import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  UserCircle,
  FileText,
  ShoppingCart,
  LogOut,
  User,
  Shield,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    roles: ["SUP", "ADMIN", "VENDEDOR"]
  },
  {
    title: "Vendedores",
    url: createPageUrl("Vendedores"),
    icon: Users,
    roles: ["SUP", "ADMIN"]
  },
  {
    title: "Produtos",
    url: createPageUrl("Produtos"),
    icon: Package,
    roles: ["SUP", "ADMIN", "VENDEDOR"]
  },
  {
    title: "Clientes",
    url: createPageUrl("Clientes"),
    icon: UserCircle,
    roles: ["SUP", "ADMIN", "VENDEDOR"]
  },
  {
    title: "Tipos de Negociação",
    url: createPageUrl("Negociacoes"),
    icon: FileText,
    roles: ["SUP", "ADMIN"]
  },
  {
    title: "Nova Venda",
    url: createPageUrl("NovaVenda"),
    icon: ShoppingCart,
    roles: ["SUP", "ADMIN", "VENDEDOR"]
  },
  {
    title: "Consultar Vendas",
    url: createPageUrl("Vendas"),
    icon: FileText,
    roles: ["SUP", "ADMIN", "VENDEDOR"]
  },
  {
    title: "Acessos",
    url: createPageUrl("Acessos"),
    icon: Shield,
    roles: ["SUP", "ADMIN"]
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      window.location.reload();
    }
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Menu */}
            <div className="flex items-center gap-8">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="font-bold text-gray-900 text-lg">Sistema de Vendas</h1>
                  <p className="text-xs text-gray-500">Gestão Comercial</p>
                </div>
              </Link>

              {/* Menu de Navegação */}
              <nav className="hidden lg:flex items-center gap-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === item.url
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Menu do Usuário */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                    <div className="hidden md:block text-right">
                      <p className="font-medium text-gray-900 text-sm">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt="Perfil"
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("Perfil"))}>
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Menu Mobile */}
        <div className="lg:hidden border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm ${
                    location.pathname === item.url
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}