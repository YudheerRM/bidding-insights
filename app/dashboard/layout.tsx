"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Home,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Providers } from "@/app/providers";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Overview", href: "/dashboard" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: FileText, label: "Tenders", href: "/dashboard/tenders" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

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
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
                  <p className="text-xs text-sidebar-foreground/70">admin@namibia.gov</p>
                </div>
              </div>
            </div>
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
