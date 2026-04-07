import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import OrdensServico from "./pages/OrdensServico.tsx";
import Clientes from "./pages/Clientes.tsx";
import Veiculos from "./pages/Veiculos.tsx";
import Financeiro from "./pages/Financeiro.tsx";
import Estoque from "./pages/Estoque.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ordens-servico" element={<OrdensServico />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/estoque" element={<Estoque />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
