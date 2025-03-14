"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
}

interface OrderItem {
  menuItem: MenuItem
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily")
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [] as { name: string; quantity: number }[],
  })

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders)
      setOrders(parsedOrders)
      calculateStats(parsedOrders, timeframe)
    }
  }, [timeframe])

  const calculateStats = (orders: Order[], timeframe: "daily" | "weekly" | "monthly") => {
    // Filter orders based on timeframe
    const now = new Date()
    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)

      switch (timeframe) {
        case "daily":
          return orderDate.toDateString() === now.toDateString()
        case "weekly":
          const weekAgo = new Date()
          weekAgo.setDate(now.getDate() - 7)
          return orderDate >= weekAgo
        case "monthly":
          const monthAgo = new Date()
          monthAgo.setMonth(now.getMonth() - 1)
          return orderDate >= monthAgo
        default:
          return true
      }
    })

    // Calculate total sales and orders
    const completedOrders = filteredOrders.filter((order) => order.status === "completed")
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = completedOrders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Calculate top selling items
    const itemCounts: Record<string, number> = {}

    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const itemName = item.menuItem.name
        if (itemCounts[itemName]) {
          itemCounts[itemName] += item.quantity
        } else {
          itemCounts[itemName] = item.quantity
        }
      })
    })

    const topSellingItems = Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    setStats({
      totalSales,
      totalOrders,
      averageOrderValue,
      topSellingItems,
    })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      <Tabs
        defaultValue="daily"
        value={timeframe}
        onValueChange={(value) => setTimeframe(value as "daily" | "weekly" | "monthly")}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <StatsCards stats={stats} timeframe="Today" />
        </TabsContent>

        <TabsContent value="weekly">
          <StatsCards stats={stats} timeframe="This Week" />
        </TabsContent>

        <TabsContent value="monthly">
          <StatsCards stats={stats} timeframe="This Month" />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSellingItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No data available</p>
            ) : (
              <div className="space-y-4">
                {stats.topSellingItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span>{item.quantity} sold</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                  <p className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCards({
  stats,
  timeframe,
}: {
  stats: {
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    topSellingItems: { name: string; quantity: number }[]
  }
  timeframe: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <DollarSign className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl mb-2">Total Sales</CardTitle>
            <p className="text-3xl font-bold">${stats.totalSales.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{timeframe}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <ShoppingCart className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl mb-2">Orders</CardTitle>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">{timeframe}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl mb-2">Avg. Order</CardTitle>
            <p className="text-3xl font-bold">${stats.averageOrderValue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{timeframe}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

