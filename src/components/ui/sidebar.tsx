"use client";

import { Dispatch, SetStateAction } from "react";
import { Link } from "react-router";
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
  Settings as SettingsIcon,
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
import { signOut, useSession } from "@/lib/auth.client";
import Image from "next/image";

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

const NavItem = ({
  icon,
  label,
  href,
  isActive,
  isCollapsed,
}: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group flex items-center gap-3 py-1.5 transition-colors",
        isActive
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground",
        isCollapsed ? "justify-center px-0" : "px-3",
      )}
    >
      <div className="flex min-w-[24px] items-center justify-center">
        {icon}
      </div>

      {!isCollapsed && <span className="text-[15px]">{label}</span>}
    </Link>
  );
};

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobile,
}: SidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { data: session } = useSession();

  const navItems = [
    { icon: <Calendar size={20} />, label: "Calendar", href: "/dashboard" },
    {
      icon: <Clock size={20} />,
      label: "Today's Focus",
      href: "/dashboard/focus",
    },
    { icon: <FileText size={20} />, label: "Notes", href: "/dashboard/notes" },
    {
      icon: <MessageSquare size={20} />,
      label: "Chat",
      href: "/dashboard/chat",
    },
    {
      icon: <BellRing size={20} />,
      label: "Reminders",
      href: "/dashboard/reminders",
    },
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
            className="bg-background/80 fixed inset-0 z-30 backdrop-blur-sm"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "bg-background border-border/40 fixed top-0 left-0 z-40 flex h-screen flex-col border-r",
          isCollapsed ? "items-center" : "",
        )}
      >
        <div
          className={cn(
            "border-border/40 flex h-14 items-center border-b",
            isCollapsed ? "w-full justify-center" : "justify-between px-6",
          )}
        >
          {!isCollapsed ? (
            <h1 className="text-xl font-bold">ONE</h1>
          ) : (
            <div className="bg-foreground/10 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-foreground text-lg font-bold">1</span>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="bg-foreground/10 flex h-8 w-8 items-center justify-center rounded-full"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="bg-foreground/10 my-3 flex h-8 w-8 items-center justify-center rounded-full"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} className="text-foreground" />
          </button>
        )}

        {/* Navigation */}
        <div className="flex flex-grow flex-col justify-between py-3">
          <div
            className={cn(
              "flex flex-col",
              isCollapsed ? "items-center space-y-4" : "space-y-1",
            )}
          >
            {navItems.map((item, idx) => (
              <NavItem
                key={idx}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname.includes(item.href.split("/").pop() || "")}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          {/* Footer Nav */}
          <div
            className={cn("flex flex-col", isCollapsed ? "items-center" : "")}
          >
            {/* Settings */}
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              href="/dashboard/settings"
              isActive={pathname.includes("settings")}
              isCollapsed={isCollapsed}
            />

            {/* User Account with Dropdown */}
            <div
              className={cn(
                "border-border/40 mt-3 border-t pt-3",
                isCollapsed ? "flex w-full justify-center" : "px-3",
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "hover:bg-accent/10 flex w-full cursor-pointer items-center gap-3 rounded-lg transition-colors",
                      isCollapsed ? "justify-center p-2" : "p-2",
                    )}
                  >
                    <div className="bg-foreground/10 flex h-8 w-8 items-center justify-center rounded-full">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session?.user?.name?.split(" ")[0] || ""}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-muted-foreground" />
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {session?.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          View Profile
                        </span>
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
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/login");
                          },
                        },
                      });
                    }}
                    className="text-destructive"
                  >
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
          className="bg-primary text-primary-foreground fixed bottom-8 left-6 z-50 rounded-full p-3 shadow-md transition-all hover:shadow-lg active:scale-95"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}
    </>
  );
}
