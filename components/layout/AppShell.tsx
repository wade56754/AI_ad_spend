"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar, type SidebarItem } from "@/components/layout/AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    email?: string | null;
    role?: string | null;
  };
  navItems: SidebarItem[];
}

export function AppShell({ children, user, navItems }: AppShellProps): JSX.Element {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen">
        <AppSidebar items={navItems} />
        <div className="flex flex-1 flex-col">
          <AppHeader userEmail={user?.email ?? null} role={user?.role ?? null} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}


