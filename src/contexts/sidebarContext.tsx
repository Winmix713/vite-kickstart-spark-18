import { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import useScrollLock from '../hooks/useScrollLock';

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const setIsLocked = useScrollLock();

  // close sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (open) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }

    return () => {
      setIsLocked(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};