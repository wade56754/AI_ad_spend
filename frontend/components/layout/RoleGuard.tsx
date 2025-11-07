"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

interface RoleGuardProps {
  allowed: string[];
  fallback: string;
  children: React.ReactNode;
}

export function RoleGuard({ allowed, fallback, children }: RoleGuardProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!allowed.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      router.replace(fallback);
    }
  }, [allowed, fallback, pathname, router]);

  return <>{children}</>;
}


