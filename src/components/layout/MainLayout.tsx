import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
  showTopBar?: boolean;
  showFooter?: boolean;
}

export const MainLayout = ({
  children,
  className,
  showSidebar = true,
  showTopBar = true,
  showFooter = true,
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showSidebar && <Sidebar />}
      {showTopBar && <TopBar />}
      
      <main className={cn("flex-1 relative ml-0 md:ml-[84px]", className)}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};
