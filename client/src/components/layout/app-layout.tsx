import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Organization, OrganizationSchema, Role } from "@shared/schema";

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
        <SidebarTrigger />
        {userOrgs.length > 0 ? children : <>create your org</>}
      </SidebarInset>
    </SidebarProvider>
  );
}
