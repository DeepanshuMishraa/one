"use client";

import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  BellRing,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  LogOut,
  UserCircle,
  Settings as SettingsIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth.client";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed: boolean;
  index?: number;
}

const NavItem = ({ icon, label, href, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 transition-colors py-1.5",
        isActive
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground",
        isCollapsed ? "justify-center px-0" : "px-3"
      )}
    >
      <div className="flex min-w-[24px] items-center justify-center">
        {icon}
      </div>

      {!isCollapsed && (
        <span className="text-[15px]">{label}</span>
      )}
    </Link>
  );
};

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile }: SidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter()

  const navItems = [
    { icon: <Calendar size={20} />, label: "Calendar", href: "/dashboard" },
    { icon: <Clock size={20} />, label: "Today's Focus", href: "/dashboard/focus" },
    { icon: <FileText size={20} />, label: "Notes", href: "/dashboard/notes" },
    { icon: <MessageSquare size={20} />, label: "Conversations", href: "/dashboard/conversations" },
    { icon: <BellRing size={20} />, label: "Reminders", href: "/dashboard/reminders" },
  ];

  return (
    <>
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col bg-background border-r border-border/40",
          isCollapsed ? "items-center" : ""
        )}
      >
        <div className={cn(
          "flex h-14 items-center border-b border-border/40",
          isCollapsed ? "justify-center w-full" : "px-6 justify-between"
        )}>
          {!isCollapsed ? (
            <h1 className="text-xl font-bold">ONE</h1>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/10">
              <span className="text-foreground text-lg font-bold">1</span>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 my-3"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} className="text-foreground" />
          </button>
        )}

        {/* Navigation */}
        <div className="flex flex-col flex-grow justify-between py-3">
          <div className={cn(
            "flex flex-col",
            isCollapsed ? "items-center space-y-4" : "space-y-1"
          )}>
            {navItems.map((item, idx) => (
              <NavItem
                key={idx}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname.includes(item.href.split('/').pop() || '')}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          {/* Footer Nav */}
          <div className={cn(
            "flex flex-col",
            isCollapsed ? "items-center" : ""
          )}>
            {/* Settings */}
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              href="/dashboard/settings"
              isActive={pathname.includes('settings')}
              isCollapsed={isCollapsed}
            />

            {/* User Account with Dropdown */}
            <div className={cn(
              "mt-3 border-t border-border/40 pt-3",
              isCollapsed ? "w-full flex justify-center" : "px-3"
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-lg hover:bg-accent/10 transition-colors w-full",
                    isCollapsed ? "justify-center p-2" : "p-2"
                  )}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
                      <User size={18} className="text-foreground" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">cato</span>
                        <span className="text-xs text-muted-foreground">View Profile</span>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isCollapsed ? "center" : "start"}
                  side={isCollapsed ? "right" : "bottom"}
                  className="w-56"
                >
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async() => {
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/login")
                        }
                      }
                    })
                  }} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.aside>

      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed bottom-8 left-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg active:scale-95 transition-all"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}
    </>
  );
} 
