import { LayoutDashboard, FileText, Users, Car, Package, Settings, LogOut, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Ordens de Serviço", path: "/ordens-servico" },
  { icon: Car, label: "Veículos", path: "/veiculos" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
  { icon: User, label: "Meu Perfil", path: "/perfil" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center justify-start px-6 py-6 border-b border-sidebar-border">
        <Logo className="w-[120px] h-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

    </aside>
  );
};

export default Sidebar;
