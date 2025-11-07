"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface AppHeaderProps {
  userEmail?: string | null;
  role?: string | null;
}

export function AppHeader({ userEmail, role }: AppHeaderProps): JSX.Element {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur">
      <div className="flex flex-col">
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          AI 财务与投手管理系统
        </span>
        <span className="text-xs text-muted-foreground">高效协同 · 实时掌控 · 数据驱动</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeSwitcher />
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            {userEmail ? userEmail.charAt(0).toUpperCase() : "AI"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden flex-col text-right text-xs text-muted-foreground sm:flex">
          <span>{userEmail ?? "未登录"}</span>
          {role ? <span className="capitalize">角色：{role}</span> : null}
        </div>
      </div>
    </header>
  );
}


