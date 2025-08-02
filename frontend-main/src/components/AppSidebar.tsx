import { 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  Plus,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Tags
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  
  const isCollapsed = state === "collapsed";

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50";

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
      { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
      { title: "My Tickets", url: "/tickets", icon: Ticket },
      { title: "Create Ticket", url: "/create-ticket", icon: Plus },
    ];

    const agentItems: NavigationItem[] = [
      { title: "All Tickets", url: "/all-tickets", icon: Inbox },
      { title: "Open Tickets", url: "/tickets/open", icon: Clock, badge: "23" },
      { title: "In Progress", url: "/tickets/in-progress", icon: CheckCircle, badge: "8" },
      { title: "Resolved", url: "/tickets/resolved", icon: CheckCircle },
    ];

    const adminItems: NavigationItem[] = [
      { title: "User Management", url: "/admin/users", icon: Users },
      { title: "Categories", url: "/admin/categories", icon: Tags },
      { title: "Agent Management", url: "/admin/agents", icon: Shield },
      { title: "System Settings", url: "/admin/settings", icon: Settings },
    ];

    if (user?.role === 'admin') {
      return [...commonItems, ...agentItems, ...adminItems];
    } else if (user?.role === 'agent') {
      return [...commonItems, ...agentItems];
    } else {
      return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">QuickDesk</h2>
              <p className="text-xs text-sidebar-foreground/60">Help Desk System</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <Ticket className="w-4 h-4 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && user && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/profile" className={getNavClass}>
                      <User className="w-4 h-4" />
                      <span>Profile & Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}