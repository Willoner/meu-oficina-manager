import { useState, useEffect } from "react";
import { Search, Bell, User, Settings, LogOut, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { menuItems } from "@/constants/navigation";
import { Logo } from "@/components/Logo";
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
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string;
  lida: boolean;
  created_at: string;
}

interface HeaderProps {
  title: string;
  subtitle: string;
  showSearch?: boolean;
}

const Header = ({ title, subtitle, showSearch = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [officeName, setOfficeName] = useState("");
  const [initials, setInitials] = useState("OF");
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchOfficeAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch Office Name
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("nome_oficina")
          .eq("id", user.id)
          .single();
        
        if (usuario?.nome_oficina) {
          setOfficeName(usuario.nome_oficina);
          setInitials(getInitials(usuario.nome_oficina));
        }

        // Fetch Notifications
        fetchNotifications(user.id);
        
        // Setup Realtime with robust handling
        // Usar um sufixo de tempo garante que cada montagem do componente tenha um canal novo
        const channelName = `notificacoes-${user.id}-${new Date().getTime()}`;
        console.log("Iniciando inscrição Realtime:", channelName);
        
        const userChannel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notificacoes',
              filter: `usuario_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Nova notificação recebida:', payload);
              setNotificacoes(prev => [payload.new as Notificacao, ...prev].slice(0, 10));
              setUnreadCount(prev => prev + 1);
              toast({
                title: payload.new.titulo,
                description: payload.new.mensagem,
              });
            }
          )
          .subscribe((status, error) => {
            console.log(`Status do Canal [${channelName}]:`, status);
            if (error) {
              console.error("Erro no Canal Realtime:", error.message);
            }
          });

        return () => {
          console.log("Limpando canal Realtime:", userChannel.topic);
          supabase.removeChannel(userChannel);
        };
      }
    };

    fetchOfficeAndNotifications();
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) {
        // Tratar 404/406 graciosamente
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
          console.warn("Tabela 'notificacoes' não encontrada. Verifique se executou o script SQL.");
          return;
        }
        throw error;
      }
      
      if (data) {
        setNotificacoes(data);
        const unread = data.filter(n => !n.lida).length;
        setUnreadCount(unread);
      }
    } catch (err: any) {
      console.error("Erro ao buscar notificações:", err.message);
    }
  };

  const handleMarkAsRead = async (notif: Notificacao) => {
    if (!notif.lida) {
      await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", notif.id);
      
      setNotificacoes(prev => 
        prev.map(n => n.id === notif.id ? { ...n, lida: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && unreadCount > 0) {
      await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("usuario_id", user.id)
        .eq("lida", false);
      
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setUnreadCount(0);
    }
  };

  const { toast } = useToast();

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
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Menu Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Menu className="w-5 h-5 text-secondary-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border">
              <div className="flex items-center justify-center px-4 py-8 border-b border-sidebar-border">
                <Logo className="w-[160px] h-auto" />
              </div>
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
            </SheetContent>
          </Sheet>

          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-bold text-foreground line-clamp-1">{title}</h1>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
          </div>
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
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center bg-destructive animate-in fade-in zoom-in">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
                  >
                    Ler todas
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    Nenhuma notificação por enquanto.
                  </div>
                ) : (
                  notificacoes.map((n) => (
                    <DropdownMenuItem 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n)}
                      className={`flex flex-col items-start gap-1 p-4 cursor-pointer border-b last:border-0 transition-colors ${!n.lida ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-semibold text-sm ${!n.lida ? 'text-primary' : 'text-foreground'}`}>
                          {n.titulo}
                        </span>
                        {!n.lida && <span className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">{n.mensagem}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
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
