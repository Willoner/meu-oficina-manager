import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import OrdensServico from "./pages/OrdensServico.tsx";
import Clientes from "./pages/Clientes.tsx";
import Veiculos from "./pages/Veiculos.tsx";
import Financeiro from "./pages/Financeiro.tsx";
import Estoque from "./pages/Estoque.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Perfil from "./pages/Perfil.tsx";
import Login from "./pages/Login.tsx";
import PublicOS from "./pages/PublicOS.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import VisualizarOS from "./pages/VisualizarOS.tsx";
import EditarOS from "./pages/EditarOS.tsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.tsx";
import CheckoutCancel from "./pages/CheckoutCancel.tsx";
import TermosUso from "./pages/TermosUso.tsx";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade.tsx";
import Agenda from "./pages/Agenda.tsx";
import Marketing from "./pages/Marketing.tsx";
import NotFound from "./pages/NotFound.tsx";

import { Analytics } from "@vercel/analytics/react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const AuthEventsHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // RASTREADOR DE DEBUG (Pode ver no console F12)
    console.log("DEBUG URL HASH:", window.location.hash);
    console.log("DEBUG URL SEARCH:", window.location.search);

    const checkRecovery = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      const isRecovery = hash.includes("recovery") || 
                         hash.includes("access_token=") || 
                         search.includes("recovery") || 
                         search.includes("type=recovery");

      if (isRecovery) {
        console.log("RASTREADOR: Link de recuperação detectado! Redirecionando para /reset-password...");
        // Pequeno delay para garantir que o Supabase inicializou a sessão
        setTimeout(() => {
          navigate("/reset-password");
        }, 800);
      }
    };
    checkRecovery();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("EVENTO SUPABASE:", event);
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password");
      }
      
      // Captura caso o Supabase já tenha limpado a URL mas o evento SIGNED_IN seja fruto de recovery
      if (event === "SIGNED_IN" && (window.location.hash.includes("recovery") || window.location.search.includes("recovery"))) {
        navigate("/reset-password");
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthEventsHandler />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/public/os/:id" element={<PublicOS />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/termos" element={<TermosUso />} />
          <Route path="/privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/ordens-servico" element={<ProtectedRoute><OrdensServico /></ProtectedRoute>} />
          <Route path="/ordens-servico/:id/visualizar" element={<ProtectedRoute><VisualizarOS /></ProtectedRoute>} />
          <Route path="/ordens-servico/:id/editar" element={<ProtectedRoute><EditarOS /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
          <Route path="/veiculos" element={<ProtectedRoute><Veiculos /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    <Analytics />
  </QueryClientProvider>
);

export default App;
