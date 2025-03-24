"use client";

import { ChevronDown, Plus } from "lucide-react";

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

import { Organization } from "@shared/schema";
import { useEffect } from "react";
import React from "react";

export function TeamSwitcher({ teams }: { teams: Organization[] }) {
  const [activeTeam, setActiveTeam] = React.useState<Organization>(teams[0]);
  useEffect(() => {
    if (teams.length > 0) {
      setActiveTeam(teams[0]);
    }
  }, [teams]);

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
              teams.map((team, index) => (
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
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">New Org</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
