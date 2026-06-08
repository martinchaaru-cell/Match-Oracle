// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  Link2,
  Wallet,
  BarChart3,
  Globe,
  Settings,
  Calendar,
  Zap,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/legs", label: "All Legs", icon: ListChecks },
  { href: "/top-picks", label: "Top Picks", icon: TrendingUp },
  { href: "/parlays", label: "Parlays", icon: Link2 },
  { href: "/bankroll", label: "Bankroll", icon: Wallet },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/countries", label: "Explorer", icon: Globe },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Match Oracle</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">AI Football Intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3 w-3 text-green-500 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
