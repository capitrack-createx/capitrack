import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
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
        <div className="flex flex-1 flex-col gap-4 px-4 py-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
