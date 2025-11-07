import { AppShell } from "@/components/layout/AppShell";
import { RoleGuard } from "@/components/layout/RoleGuard";
import type { SidebarItem } from "@/components/layout/AppSidebar";
import { createClient } from "@/lib/supabase/server";
import {
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardList,
  FileSpreadsheet,
  Network,
  Users2,
} from "lucide-react";
import { redirect } from "next/navigation";

const NAV_ITEMS: SidebarItem[] = [
  { label: "投手上报", href: "/report/spend", icon: FileSpreadsheet },
  { label: "财务收支", href: "/finance/ledger", icon: CircleDollarSign },
  { label: "自动对账", href: "/reconcile", icon: ClipboardList },
  { label: "数据分析", href: "/analytics", icon: BarChart3 },
  { label: "项目管理", href: "/settings/projects", icon: BriefcaseBusiness },
  { label: "投手管理", href: "/settings/operators", icon: Users2 },
  { label: "渠道管理", href: "/settings/channels", icon: Network },
];

const ROLE_ACCESS: Record<string, string[]> = {
  operator: ["/report/spend"],
  finance: ["/finance/ledger"],
  account_mgr: ["/settings/channels"],
  admin: [
    "/report/spend",
    "/finance/ledger",
    "/reconcile",
    "/analytics",
    "/settings",
    "/settings/projects",
    "/settings/operators",
    "/settings/channels",
  ],
};

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = (user?.app_metadata?.role || user?.user_metadata?.role || "operator") as string;
  const allowed = ROLE_ACCESS[role] ?? ROLE_ACCESS.operator;
  const allowedSet = new Set(allowed);

  const navItems = NAV_ITEMS.filter((item) => allowedSet.has(item.href));
  const fallback = navItems[0]?.href ?? allowed[0] ?? "/report/spend";

  // Ensure base settings path accessible when any settings child allowed
  if (allowedSet.has("/settings/projects") || allowedSet.has("/settings/operators") || allowedSet.has("/settings/channels")) {
    allowedSet.add("/settings");
  }

  return (
    <AppShell user={{ email: user?.email ?? null, role }} navItems={navItems}>
      <RoleGuard allowed={Array.from(allowedSet)} fallback={fallback}>
        {children}
      </RoleGuard>
    </AppShell>
  );
}

