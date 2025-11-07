"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface AppSidebarProps {
  items: SidebarItem[];
}

export function AppSidebar({ items }: AppSidebarProps): JSX.Element {
  const pathname = usePathname();
  const { roles, loading, error } = useCurrentUser();

  const showAdminMenus = roles.includes("admin");
  const filteredItems = showAdminMenus
    ? [
        ...items,
        { label: "用户管理", href: "/settings/users" },
        { label: "角色管理", href: "/settings/roles" },
      ]
    : items;

  return (
    <aside className="hidden h-screen w-64 border-r bg-white/95 px-4 py-6 shadow-sm lg:flex">
      <div className="flex w-full flex-col gap-8">
        <div className="px-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground">
              AI Finance
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              管理后台
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
              菜单加载中...
            </div>
          ) : error ? (
            <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              <span>无法加载用户角色</span>
              <span className="text-[10px] text-red-400">{error}</span>
            </div>
          ) : (
            filteredItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </aside>
  );
}


