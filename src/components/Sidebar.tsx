import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { menuItems } from "@/constants/navigation";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar hidden lg:flex flex-col z-50 overflow-y-auto border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center justify-center px-4 py-8 border-b border-sidebar-border">
        <Logo className="w-[160px] h-auto" />
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
      {/* Legal Links Footer */}
      <div className="px-6 py-6 border-t border-sidebar-border space-y-2">
        <button 
          onClick={() => navigate("/termos")}
          className="block text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase font-bold tracking-wider"
        >
          Termos de Uso
        </button>
        <button 
          onClick={() => navigate("/privacidade")}
          className="block text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase font-bold tracking-wider"
        >
          Privacidade
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
