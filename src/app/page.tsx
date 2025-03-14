"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LucideUtensils,
  ShoppingCart,
  BarChart3,
  Users,
  FileText,
  LayoutGrid,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  customer: {
    name: string;
  };
  items: { menuItem: { name: string; price: number }; quantity: number }[];
  total: number;
  status: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
}

interface SalesStats {
  todaySales: number;
  percentChange: number;
}

interface TableStats {
  available: number;
  total: number;
  occupied: number;
  reserved: number;
}

interface OrderStats {
  active: number;
  pending: number;
  inProgress: number;
}

interface Reservation {
  id: string;
  reservationName: string;
  reservationTime: string;
  name: string;
}

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [tableStats, setTableStats] = useState<TableStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent orders
        const ordersResponse = await fetch("/api/orders?limit=4");
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);

        // Fetch inventory items with low stock
        const inventoryResponse = await fetch("/api/inventory/low-stock");
        const inventoryData = await inventoryResponse.json();
        setLowStockItems(inventoryData);

        // Fetch sales statistics
        const salesResponse = await fetch("/api/stats/sales");
        const salesData = await salesResponse.json();
        setSalesStats(salesData);

        // Fetch table statistics
        const tablesResponse = await fetch("/api/stats/tables");
        const tablesData = await tablesResponse.json();
        setTableStats(tablesData);

        // Fetch order statistics
        const orderStatsResponse = await fetch("/api/stats/orders");
        const orderStatsData = await orderStatsResponse.json();
        setOrderStats(orderStatsData);

        // Fetch today's reservations
        const reservationsResponse = await fetch("/api/tables/reservations");
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your restaurant management system
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesStats ? salesStats.todaySales.toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesStats && salesStats.percentChange >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 inline" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 inline" />
              )}
              {salesStats
                ? `${
                    salesStats.percentChange >= 0 ? "+" : ""
                  }${salesStats.percentChange.toFixed(1)}% from yesterday`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStats ? orderStats.active : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {orderStats
                ? `${orderStats.pending} pending, ${orderStats.inProgress} in progress`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 min</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 inline" />
              -2 min from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tables Available
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableStats
                ? `${tableStats.available}/${tableStats.total}`
                : "0/0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {tableStats
                ? `${tableStats.occupied} occupied, ${tableStats.reserved} reserved`
                : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick access */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Frequently used functions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-1 justify-center"
              asChild
            >
              <Link href="/menu">
                <LucideUtensils className="h-6 w-6 mb-1" />
                <span>Menu</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-1 justify-center"
              asChild
            >
              <Link href="/orders">
                <ShoppingCart className="h-6 w-6 mb-1" />
                <span>Orders</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-1 justify-center"
              asChild
            >
              <Link href="/tables">
                <LayoutGrid className="h-6 w-6 mb-1" />
                <span>Tables</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-1 justify-center"
              asChild
            >
              <Link href="/customers">
                <Users className="h-6 w-6 mb-1" />
                <span>Customers</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-1 justify-center"
              asChild
            >
              <Link href="/inventory">
                <Package className="h-6 w-6 mb-1" />
                <span>Inventory</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-1 justify-center"
              asChild
            >
              <Link href="/invoices">
                <FileText className="h-6 w-6 mb-1" />
                <span>Invoices</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <div className="font-medium">Order #{order.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer.name} • {order.items.length} items
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "pending"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {order.status === "completed" && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {order.status === "pending" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {order.status === "in-progress" && (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      )}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Alerts and inventory */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Low Stock Items</span>
                </div>
                <div className="mt-2 space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} {item.unit} / {item.minQuantity}{" "}
                        {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  variant="outline"
                  asChild
                >
                  <Link href="/inventory">Manage Inventory</Link>
                </Button>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>Reservations Today</span>
                </div>
                <div className="mt-2">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="text-sm">
                      {reservation.reservationName} -{" "}
                      {new Date(reservation.reservationTime).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      - {reservation.name}
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  variant="outline"
                  asChild
                >
                  <Link href="/tables">View Tables</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Sales chart would appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
