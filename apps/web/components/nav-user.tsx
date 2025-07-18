import {
  RiExpandUpDownLine,
  RiUserLine,
  RiGroupLine,
  RiSparklingLine,
  RiLogoutCircleLine,
} from "@remixicon/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@repo/auth/client";
import { useRouter } from "next/navigation";
export function NavUser() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>svg]:size-5"
            >
              <Avatar className="size-8">
                <AvatarImage src={session?.user?.image as string} alt={session?.user?.name} />
                <AvatarFallback className="rounded-lg">{session?.user?.name?.split(" ")[0]?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{session?.user?.name}</span>
              </div>
              <RiExpandUpDownLine className="ml-auto size-5 text-muted-foreground/80" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) dark bg-sidebar"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-3 focus:bg-sidebar-accent">
                <RiUserLine
                  size={20}
                  className="size-5 text-muted-foreground/80"
                />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 focus:bg-sidebar-accent">
                <RiGroupLine
                  size={20}
                  className="size-5 text-muted-foreground/80"
                />
                Accounts
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 focus:bg-sidebar-accent">
                <RiSparklingLine
                  size={20}
                  className="size-5 text-muted-foreground/80"
                />
                Upgrade
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    }
                  }
                })
              }} className="gap-3 focus:bg-sidebar-accent">
                <RiLogoutCircleLine
                  size={20}
                  className="size-5 text-muted-foreground/80"
                />
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
