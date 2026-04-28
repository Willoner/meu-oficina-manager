import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { History, FileText, TrendingUp, Package, PenTool, CheckCircle2, Calendar, AlertTriangle } from "lucide-react";

// Componente base para o Card do Instagram (formato quadrado 1:1)
const InstagramPost = ({ title, subtitle, icon: Icon, children, isDark = true }: any) => {
  return (
    <div className="flex flex-col items-center mb-12">
      <div 
        className={`w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden relative shadow-2xl flex flex-col p-8 border ${
          isDark ? "bg-[#1A1F2C] border-primary/20 text-white" : "bg-white border-border text-foreground"
        }`}
      >
        {/* Header do Post */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? "bg-primary/20" : "bg-primary/10"}`}>
            <Icon className={`w-6 h-6 ${isDark ? "text-primary" : "text-primary"}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">{title}</h2>
            {subtitle && <p className={`text-sm mt-1 ${isDark ? "text-primary/80" : "text-muted-foreground"}`}>{subtitle}</p>}
          </div>
        </div>

        {/* Área do Mockup UI */}
        <div className="flex-1 w-full flex items-center justify-center relative z-10">
          {children}
        </div>

        {/* Footer do Post */}
        <div className="mt-6 flex justify-between items-end w-full">
          <div className={`text-xs font-bold tracking-widest uppercase opacity-50`}>
            Oficina em Ordem
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#1A1F2C]" />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4 font-medium text-center max-w-[400px]">
        💡 Dica: Tire um print da área do quadrado acima e recorte para postar no Instagram.
      </p>
    </div>
  );
};

const Marketing = () => {
  return (
    <DashboardLayout title="Marketing Studio" subtitle="Gerador automático de posts para suas redes sociais">
      <div className="max-w-4xl mx-auto py-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Seu Arsenal de Vendas 🚀</h1>
          <p className="text-muted-foreground text-lg">
            Abaixo estão 5 posts prontos com a interface real (simulada com dados perfeitos) do seu sistema. 
            Isso gera extrema autoridade para a sua oficina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          
          {/* POST 1: Histórico */}
          <InstagramPost 
            title="O 'Prontuário Médico' do seu carro." 
            subtitle="Quem conhece o passado, cuida do futuro."
            icon={History}
          >
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-sm relative">
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-primary text-[#1A1F2C] hover:bg-primary font-bold">Placa: ABC-1234</Badge>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(130,233,222,0.8)]"></div>
                  <div className="w-0.5 h-14 bg-gradient-to-b from-primary to-white/20 my-1"></div>
                  <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                </div>
                <div className="flex flex-col gap-6 w-full">
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Hoje
                    </p>
                    <p className="text-sm font-bold text-white">Revisão Preventiva</p>
                    <p className="text-xs text-white/60 mt-1">Troca de óleo, filtros e velas.</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">Há 6 meses</p>
                    <p className="text-sm font-bold text-white/80">Manutenção Freios</p>
                  </div>
                </div>
              </div>
            </div>
          </InstagramPost>

          {/* POST 2: O.S. Digital */}
          <InstagramPost 
            title="Sua O.S. 100% Digital." 
            subtitle="Fim do papel. Transparência total."
            icon={FileText}
            isDark={false}
          >
            <div className="w-full bg-[#1A1F2C] rounded-xl p-4 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-sm">Ordem #1042</h3>
                  <p className="text-xs text-white/50">Cliente: João Silva</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">Aprovada</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Mão de Obra</span>
                  <span className="font-medium text-white">R$ 250,00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Kit Embreagem LUK</span>
                  <span className="font-medium text-white">R$ 890,00</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold text-white/80">Total</span>
                  <span className="text-lg font-bold text-primary">R$ 1.140,00</span>
                </div>
              </div>
            </div>
          </InstagramPost>

          {/* POST 3: Financeiro */}
          <InstagramPost 
            title="Gestão Baseada em Dados." 
            subtitle="Saúde financeira na palma da mão."
            icon={TrendingUp}
          >
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-5 shadow-2xl">
              <h3 className="text-xs text-white/60 font-bold uppercase mb-4">Movimentação (Últimos Meses)</h3>
              <div className="flex items-end gap-2 h-24 mt-4">
                {[40, 60, 45, 80, 55, 100].map((height, i, arr) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                    <div 
                      className={`w-full rounded-t-sm ${i === arr.length - 1 ? "bg-primary" : "bg-white/20"}`} 
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/40">Out</span>
                <span className="text-[10px] text-primary font-bold">Mar (Atual)</span>
              </div>
            </div>
          </InstagramPost>

          {/* POST 4: Estoque */}
          <InstagramPost 
            title="Estoque Inteligente." 
            subtitle="A peça certa, na hora certa."
            icon={Package}
            isDark={false}
          >
             <div className="w-full bg-white rounded-xl border border-border shadow-xl overflow-hidden">
              <div className="bg-muted/50 p-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Controle de Peças</span>
              </div>
              <div className="p-0">
                <div className="flex justify-between items-center p-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">OL</div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Óleo Sintético 5W40</p>
                      <p className="text-xs text-muted-foreground">Cód: OL-5W40</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">24 un</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Estoque Ideal</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center text-destructive font-bold text-xs">PD</div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Pastilha de Freio</p>
                      <p className="text-xs text-muted-foreground">Cód: FRE-01</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">2 un</p>
                    <p className="text-[10px] text-destructive font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Repor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </InstagramPost>

          {/* POST 5: Assinatura */}
          <InstagramPost 
            title="Profissionalismo Absoluto." 
            subtitle="Assinatura digital e garantia."
            icon={PenTool}
          >
            <div className="w-full bg-white text-[#1A1F2C] rounded-xl p-5 shadow-2xl relative">
              <div className="absolute top-2 right-2 opacity-10">
                <CheckCircle2 className="w-20 h-20" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-widest">Termo de Aceite</p>
              
              <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center bg-primary/5 h-24 mb-3 relative overflow-hidden">
                <svg className="absolute w-full h-full opacity-60 text-primary drop-shadow-md" viewBox="0 0 200 50" preserveAspectRatio="none">
                  <path d="M 10 30 Q 30 10 50 30 T 90 30 T 130 20 T 180 35" fill="transparent" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-bold border-t border-border pt-2 mx-4">Assinatura do Cliente</p>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 mt-2">Documento Assinado ✓</Badge>
              </div>
            </div>
          </InstagramPost>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketing;
