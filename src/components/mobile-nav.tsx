"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideUtensils,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  LayoutGrid,
  Package,
  Home,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const routes = [
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
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold text-xl">RestaurantPOS</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="mt-6 flex flex-col space-y-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              className="justify-start"
              asChild
              onClick={() => setOpen(false)}
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
                <route.icon className="mr-2 h-5 w-5" />
                {route.label}
              </Link>
            </Button>
          ))}
          <div className="mt-4 flex items-center">
            <ThemeToggle />
            <span className="ml-2 text-sm font-medium">Toggle theme</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
