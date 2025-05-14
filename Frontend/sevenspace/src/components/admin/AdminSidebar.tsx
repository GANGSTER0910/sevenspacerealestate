
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building, 
  Users, 
  MessageSquare, 
  BarChart, 
  Settings, 
  HelpCircle 
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon: Icon, 
  children, 
  active 
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        active && "bg-realestate-light text-realestate-primary font-medium"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link 
            to="/admin" 
            className="flex items-center gap-2 font-semibold"
          >
            <Building className="h-6 w-6 text-realestate-primary" />
            <span>SevenSpace Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <SidebarLink 
              href="/admin" 
              icon={Home}
              active={pathname === "/admin"}
            >
              Dashboard
            </SidebarLink>
            <SidebarLink 
              href="/admin/properties" 
              icon={Building}
              active={pathname.startsWith("/admin/properties")}
            >
              Properties
            </SidebarLink>
            <SidebarLink 
              href="/admin/users" 
              icon={Users}
              active={pathname.startsWith("/admin/users")}
            >
              Users
            </SidebarLink>
            <SidebarLink 
              href="/admin/inquiries" 
              icon={MessageSquare}
              active={pathname.startsWith("/admin/inquiries")}
            >
              Inquiries
            </SidebarLink>
            <SidebarLink 
              href="/admin/analytics" 
              icon={BarChart}
              active={pathname.startsWith("/admin/analytics")}
            >
              Analytics
            </SidebarLink>
            <SidebarLink 
              href="/admin/settings" 
              icon={Settings}
              active={pathname.startsWith("/admin/settings")}
            >
              Settings
            </SidebarLink>
            <SidebarLink 
              href="/admin/help" 
              icon={HelpCircle}
              active={pathname.startsWith("/admin/help")}
            >
              Help & Support
            </SidebarLink>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
