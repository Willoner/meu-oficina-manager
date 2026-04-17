import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showSearch?: boolean;
  hideSidebarOnPrint?: boolean;
  hideHeaderOnPrint?: boolean;
}

const DashboardLayout = ({ 
  children, 
  title, 
  subtitle, 
  showSearch = false,
  hideSidebarOnPrint = false,
  hideHeaderOnPrint = false
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className={hideSidebarOnPrint ? "print:hidden" : ""}>
        <Sidebar />
      </div>

      {/* Margem dinâmica: ml-0 no mobile, ml-64 no desktop */}
      <main className={`lg:ml-64 min-h-screen transition-all duration-300 ${hideSidebarOnPrint ? "print:ml-0" : ""}`}>
        <div className={hideHeaderOnPrint ? "print:hidden" : ""}>
          <Header title={title} subtitle={subtitle} showSearch={showSearch} />
        </div>
        
        {/* Padding responsivo para o conteúdo */}
        <div className="p-4 md:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
