import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showSearch?: boolean;
}

const DashboardLayout = ({ children, title, subtitle, showSearch = false }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Barra lateral fixa apenas em desktop */}
      <Sidebar />

      {/* Margem dinâmica: ml-0 no mobile, ml-64 no desktop */}
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <Header title={title} subtitle={subtitle} showSearch={showSearch} />
        
        {/* Padding responsivo para o conteúdo */}
        <div className="p-4 md:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
