"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/services/auth-service";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Organization } from "@shared/types";
import { useEffect } from "react";
import React from "react";
import { useOrganization } from "@/context/OrganizationContext";

export function TeamSwitcher() {
  const { organization } = useOrganization();
  const { logout } = useAuth();

  const [activeTeam, setActiveTeam] = React.useState<Organization>();
  const [teams, setTeams] = React.useState<Organization[]>();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (organization) {
      setActiveTeam(organization);
      setTeams([organization]);
    }
  }, [organization]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <SidebarMenuButton className="w-fit px-1.5">
                <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* TODO: <activeTeam.logo className="size-3" /> */}
                </div>
                <span className="truncate font-semibold">
                  {activeTeam ? activeTeam.name : <></>}
                </span>
                <ChevronDown className="opacity-50" />
              </SidebarMenuButton>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Your Orgs
            </DropdownMenuLabel>
            {teams && teams.length > 0 ? (
              teams.map((team) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {/* <team.logo className="size-4 shrink-0" /> */}
                  </div>
                  {team.name}
                </DropdownMenuItem>
              ))
            ) : (
              <></>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="gap-2 p-2 text-red-600 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center">
                <LogOut className="size-4" />
              </div>
              <div className="font-medium">Logout</div>
            </DropdownMenuItem>
            {/* <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">New Org</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
