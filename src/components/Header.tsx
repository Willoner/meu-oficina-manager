import { useState, useEffect } from "react";
import { Search, Bell, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle: string;
  showSearch?: boolean;
}

const Header = ({ title, subtitle, showSearch = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [officeName, setOfficeName] = useState("");
  const [initials, setInitials] = useState("OF");

  useEffect(() => {
    const fetchOfficeName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("nome_oficina")
          .eq("id", user.id)
          .single();
        
        if (data?.nome_oficina) {
          setOfficeName(data.nome_oficina);
          setInitials(getInitials(data.nome_oficina));
        }
      }
    };

    fetchOfficeName();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "OF";
    const names = name.trim().split(/\s+/);
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 w-64" />
            </div>
          )}

          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Bell className="w-5 h-5 text-secondary-foreground" />
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                  2
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-default">
                  <span className="font-semibold text-sm">Bem-vindo ao Oficina em Ordem</span>
                  <span className="text-xs text-muted-foreground">Comece cadastrando seus primeiros clientes e veículos.</span>
                  <span className="text-[10px] text-primary mt-1">Agora</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-default">
                  <span className="font-semibold text-sm">Nova versão disponível</span>
                  <span className="text-xs text-muted-foreground">A versão MVP v1.0 já está ativa com novos recursos.</span>
                  <span className="text-[10px] text-primary mt-1">2 horas atrás</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar e Menu de Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="w-10 h-10 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer">
                  <AvatarFallback className="gradient-primary text-primary-foreground font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{officeName || "Sua Oficina"}</p>
                  <p className="text-xs leading-none text-muted-foreground italic">Gestor</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
