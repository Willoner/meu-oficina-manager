import React, { createContext, useContext, useState } from 'react';

interface LayoutState {
  title: string;
  subtitle: string;
  showSearch: boolean;
  hideSidebarOnPrint: boolean;
  hideHeaderOnPrint: boolean;
}

interface LayoutContextType extends LayoutState {
  setLayoutProps: (props: Partial<LayoutState>) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LayoutState>({
    title: '',
    subtitle: '',
    showSearch: false,
    hideSidebarOnPrint: false,
    hideHeaderOnPrint: false,
  });

  const setLayoutProps = (props: Partial<LayoutState>) => {
    setState((prev) => {
      let changed = false;
      for (const key in props) {
        if ((prev as any)[key] !== (props as any)[key]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        return { ...prev, ...props };
      }
      return prev;
    });
  };

  return (
    <LayoutContext.Provider value={{ ...state, setLayoutProps }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
