import {
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  PieChart,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "wouter";
import { TeamSwitcher } from "@/components/ui/team-switcher";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    url: "/app/members",
    icon: Users,
  },
  {
    title: "Fees",
    url: "/app/fees",
    icon: DollarSign,
  },
  {
    title: "Budgets",
    url: "/app/budgets",
    icon: PieChart,
  },
  {
    title: "Reports",
    url: "/app/reports",
    icon: FileText,
  },
  {
    title: "Transactions",
    url: "/app/transactions",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" side="left" collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>capitrack</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
