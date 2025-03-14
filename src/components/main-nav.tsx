"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideUtensils,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  LayoutGrid,
  Home,
  MenuIcon,
  Package,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MainNav() {
  const pathname = usePathname();

  // Primary navigation items that are always visible
  const primaryRoutes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/menu",
      label: "Menu",
      icon: LucideUtensils,
      active: pathname === "/menu",
    },
    {
      href: "/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: pathname === "/orders",
    },
    {
      href: "/tables",
      label: "Tables",
      icon: LayoutGrid,
      active: pathname === "/tables",
    },
  ];

  // Secondary navigation items that go in the dropdown
  const secondaryRoutes = [
    {
      href: "/customers",
      label: "Customers",
      icon: Users,
      active: pathname === "/customers",
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: Package,
      active: pathname === "/inventory",
    },
    {
      href: "/reports",
      label: "Reports",
      icon: BarChart3,
      active: pathname === "/reports",
    },
    {
      href: "/employees",
      label: "Employees",
      icon: Users,
      active: pathname === "/employees",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: Receipt,
      active: pathname === "/invoices",
    },
  ];

  return (
    <nav className="flex items-center space-x-2 lg:space-x-4 mx-4">
      <div className="font-bold text-lg mr-4 hidden sm:block">
        RestaurantPOS
      </div>

      {primaryRoutes.map((route) => (
        <Button
          key={route.href}
          variant={route.active ? "default" : "ghost"}
          asChild
          size="sm"
          className="h-9"
        >
          <Link
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors",
              route.active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <route.icon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{route.label}</span>
          </Link>
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9">
            <MenuIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {secondaryRoutes.map((route) => (
            <DropdownMenuItem key={route.href} asChild>
              <Link href={route.href} className="flex items-center">
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}
