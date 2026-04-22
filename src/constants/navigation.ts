import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Car, 
  Package, 
  Settings, 
  LogOut, 
  User,
  Calendar
} from "lucide-react";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: FileText, label: "Ordens de Serviço", path: "/ordens-servico" },
  { icon: Car, label: "Veículos", path: "/veiculos" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
  { icon: User, label: "Meu Perfil", path: "/perfil" },
];
