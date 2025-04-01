import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/services/auth-service";
import { Organization } from "@shared/types";
import { dbService } from "@/services/db-service";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);

  async function loadOrgs() {
    if (!user) return;
    const org = await dbService.getUserOrganization(user.uid);
    if (org) {
      setUserOrgs([org]);
    }
  }
  useEffect(() => {
    loadOrgs();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar organizations={userOrgs} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <SidebarTrigger className="ml-" />
          <div className="flex flex-1 items-center gap-2 px-3">
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          {/* If you want to add an actions area on the right */}
          <div className="ml-auto px-3">
            {/* <NavActions /> or something similar */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 py-10">
          {userOrgs.length >= 0 ? children : <>create your org</>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
