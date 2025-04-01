import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useEffect, useState } from "react";
import { Organization, OrganizationSchema, Role } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const sampleOrganization = {
    uid: "123e4567-e89b-12d3-a456-426614174000",
    name: "Acme Corporation",
    description: "Leading provider of widgets and gizmos.",
    createdAt: new Date(),
    roles: {
      "user-uuid-1": "owner" as Role,
      "user-uuid-2": "admin" as Role,
      "user-uuid-3": "member" as Role,
    },
  };
  const org: Organization = OrganizationSchema.parse(sampleOrganization);

  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
  useEffect(() => {
    // TODO: Fetch userOrgs
    setUserOrgs([org]);
  }, [org]);

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
