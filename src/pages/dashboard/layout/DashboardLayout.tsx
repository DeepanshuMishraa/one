import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if on mobile on mount and when window size changes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
      />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-[60px]" : "ml-[250px]"
        } overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
}
