"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Home,
  Menu,
  Settings,
  X,
  User,
  LogOut,
  Shield,
  Building2,
  Eye,
  Users,
  Gavel,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Providers } from "@/app/providers";

interface NavItem {
  icon: React.ForwardRefExoticComponent<any>;
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { icon: Home, label: "Overview", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    ];

    if (!session?.user) return [...baseItems, { icon: FileText, label: "Tenders", href: "/dashboard/tenders" }];

    const userType = session.user.userType;

    // Add user-type specific navigation items
    switch (userType) {
      case 'admin':
        return [
          ...baseItems,
          { 
            icon: FileText, 
            label: "Tenders", 
            href: "/dashboard/tenders",
            children: [
              { label: "My Applications", href: "/dashboard/tenders/applications" },
              { label: "Add Tender", href: "/dashboard/tenders/add" },
            ]
          },
          { icon: Shield, label: "Admin Panel", href: "/dashboard/admin" },
          { icon: Settings, label: "Settings", href: "/dashboard/settings" },
        ];
      case 'government_official':
        return [
          ...baseItems,
          { 
            icon: FileText, 
            label: "Tenders", 
            href: "/dashboard/tenders",
            children: [
              { label: "My Applications", href: "/dashboard/tenders/applications" },
              { label: "Add Tender", href: "/dashboard/tenders/add" },
            ]
          },
          { icon: Gavel, label: "Manage Tenders", href: "/dashboard/manage" },
          { icon: Settings, label: "Settings", href: "/dashboard/settings" },
        ];
      case 'bidder':
        return [
          ...baseItems,
          { 
            icon: FileText, 
            label: "Tenders", 
            href: "/dashboard/tenders",
            children: [
              { label: "My Applications", href: "/dashboard/tenders/applications" },
              { label: "Add Tender", href: "/dashboard/tenders/add" },
            ]
          },
          { icon: FileText, label: "My Bids", href: "/dashboard/bids" },
          { icon: Settings, label: "Settings", href: "/dashboard/settings" },
        ];
      case 'viewer':
        return [
          ...baseItems,
          { 
            icon: FileText, 
            label: "Tenders", 
            href: "/dashboard/tenders",
            children: [
              { label: "My Applications", href: "/dashboard/tenders/applications" },
              { label: "Add Tender", href: "/dashboard/tenders/add" },
            ]
          },
          { icon: Settings, label: "Settings", href: "/dashboard/settings" },
        ];
      default:
        return [
          ...baseItems,
          { icon: FileText, label: "Tenders", href: "/dashboard/tenders" },
          { icon: Settings, label: "Settings", href: "/dashboard/settings" },
        ];
    }
  };

  const navItems = getNavItems();

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'government_official':
        return <Shield className="w-4 h-4" />;
      case 'bidder':
        return <Building2 className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'government_official':
        return 'Government Official';
      case 'bidder':
        return 'Bidder';
      case 'admin':
        return 'Administrator';
      case 'viewer':
        return 'Viewer';
      default:
        return userType;
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/sign-in' });
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push('/sign-in');
    return null;
  }

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar for desktop */}
        <aside
          className={cn(
            "fixed inset-y-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:relative",
            sidebarOpen ? "left-0" : "-left-64 lg:left-0"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold text-xl text-sidebar-primary"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Bidding Insights</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => (
              <div key={item.href}>
                {/* Main menu item */}
                <div
                  className={cn(
                    "group flex items-center px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer",
                    pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                  onClick={() => {
                    if (item.children) {
                      setExpandedMenus(prev => ({
                        ...prev,
                        [item.href]: !prev[item.href]
                      }));
                    } else {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.children && (
                    <div className="ml-2">
                      {expandedMenus[item.href] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Submenu items */}
                {item.children && expandedMenus[item.href] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child: { label: string; href: string }) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                          pathname === child.href && "bg-sidebar-primary text-sidebar-primary-foreground"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-2">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-sidebar-foreground line-clamp-1">
                        {session?.user?.name || "User"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {session?.user?.userType && getUserTypeIcon(session.user.userType)}
                        <p className="text-xs text-sidebar-foreground/70 line-clamp-1">
                          {session?.user?.userType && getUserTypeLabel(session.user.userType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    {session?.user?.userType && (
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getUserTypeIcon(session.user.userType)}
                          <span className="ml-1">{getUserTypeLabel(session.user.userType)}</span>
                        </Badge>
                        {session.user.userType === 'bidder' && session.user.subscriptionTier && (
                          <Badge variant="secondary" className="text-xs">
                            {session.user.subscriptionTier.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile menu button - positioned absolutely in top-left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-40 bg-white/80 backdrop-blur-sm shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page content - now takes full height */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
