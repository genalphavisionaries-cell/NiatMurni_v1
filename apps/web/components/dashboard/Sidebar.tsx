"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getNavForRole, SIDEBAR_WIDTH, type DashboardRole, type NavItem } from "./dashboard-config";

type SidebarProps = {
  role: DashboardRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function Sidebar({ role, collapsed, onToggleCollapse, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const nav = getNavForRole(role);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col border-r border-[var(--border)] bg-white transition-[width,transform] duration-200 ease-out",
          "fixed left-0 top-0 z-30 h-screen",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: collapsed ? 72 : SIDEBAR_WIDTH }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] px-3">
          {!collapsed && (
            <Link
              href={role === "admin" ? "/admin" : role === "tutor" ? "/tutor" : "/participant"}
              className="font-semibold text-gray-900"
            >
              Niat Murni
            </Link>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavItemBlock
              key={item.href + item.label}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              openGroups={openGroups}
              onToggleGroup={toggleGroup}
              onNavigate={onMobileClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavItemBlock({
  item,
  pathname,
  collapsed,
  openGroups,
  onToggleGroup,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  openGroups: Record<string, boolean>;
  onToggleGroup: (label: string) => void;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || (hasChildren && item.children?.some((c) => pathname === c.href));
  const isGroupOpen = openGroups[item.label];

  const linkProps = {
    onClick: () => onNavigate?.(),
  };

  if (hasChildren) {
    return (
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => onToggleGroup(item.label)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Icon className="h-5 w-5 shrink-0 text-gray-500" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isGroupOpen && "rotate-180")} />
            </>
          )}
        </button>
        {!collapsed && isGroupOpen && item.children && (
          <div className="space-y-0.5 pl-4">
            {item.children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  {...linkProps}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    childActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      {...linkProps}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        pathname === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-gray-500" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
