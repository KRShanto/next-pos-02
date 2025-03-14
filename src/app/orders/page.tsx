"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Trash2, ShoppingCart, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  customerId?: string;
  tableId?: string;
  paymentMethod?: string;
  tip?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: string;
  currentOrderId?: string;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const preselectedTableId = searchParams.get("tableId");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("guest");
  const [selectedTableId, setSelectedTableId] = useState<string>(
    preselectedTableId || "takeout"
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await fetch("/api/orders");
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);

        // Fetch tables
        const tablesResponse = await fetch("/api/tables");
        const tablesData = await tablesResponse.json();
        setTables(tablesData);

        // Fetch customers
        const customersResponse = await fetch("/api/customers");
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        // Fetch menu items
        const menuItemsResponse = await fetch("/api/menu");
        const menuItemsData = await menuItemsResponse.json();
        setMenuItems(menuItemsData);

        // Extract unique categories from menu items
        const uniqueCategories = Array.from(
          new Set(menuItemsData.map((item: MenuItem) => item.category))
        );
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const addToOrder = (menuItem: MenuItem) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find(
        (item) => item.menuItem.id === menuItem.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { menuItem, quantity: 1 }];
      }
    });
  };

  const removeFromOrder = (menuItemId: string) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.menuItem.id === menuItemId);

      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.menuItem.id !== menuItemId);
      }
    });
  };

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => {
      return total + item.menuItem.price * item.quantity;
    }, 0);
  };

  const placeOrder = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order before placing it.",
        variant: "destructive",
      });
      return;
    }

    setShowPaymentDialog(true);
  };

  const completeOrder = async (paymentMethod: string, tipAmount: number) => {
    // Get tax rate from settings
    let taxRate = 8.5; // Default
    const storedSettings = localStorage.getItem("restaurantSettings");
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (settings.taxRate) {
        taxRate = settings.taxRate;
      }
    }

    // Calculate subtotal and tax
    const subtotal = calculateTotal();
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + tipAmount;

    const newOrder = {
      items: [...currentOrder],
      total: total,
      status: "pending",
      paymentMethod,
      tip: tipAmount,
      customerId: selectedCustomerId !== "guest" ? selectedCustomerId : null,
      tableId: selectedTableId !== "takeout" ? selectedTableId : null,
      // Add invoice data
      createInvoice: true,
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
    };

    try {
      // Make an API call to save the order to the database
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const savedOrder = await response.json();
      const updatedOrders = [...orders, savedOrder];
      setOrders(updatedOrders);

      toast({
        title: "Order Placed",
        description: `Order #${savedOrder.id} has been placed successfully.`,
      });

      setCurrentOrder([]);
      setSelectedCustomerId("guest");
      setSelectedTableId("takeout");
      setShowPaymentDialog(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to place order.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ) => {
    try {
      console.log("Updating order status:", orderId, status);

      // Update order status
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update order status: ${response.statusText}`
        );
      }

      const updatedOrder = await response.json();
      console.log("Order updated successfully:", updatedOrder);

      // Update orders state immediately
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      // If order is being completed, create an invoice
      if (status === "completed") {
        console.log("Creating invoice for order:", orderId);

        // Find the original order to get all necessary data
        const orderToComplete = orders.find((o) => o.id === orderId);
        if (!orderToComplete) {
          throw new Error("Order not found");
        }

        // Calculate invoice amounts
        const subtotal = orderToComplete.items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
        const taxRate = 8.5; // Default tax rate
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount + (orderToComplete.tip || 0);

        console.log("Invoice calculations:", {
          subtotal,
          taxRate,
          taxAmount,
          total,
        });

        // Create invoice
        const invoiceResponse = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            customerId: orderToComplete.customerId,
            subtotal,
            taxRate,
            taxAmount,
            total,
            status: "paid",
            issueDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            notes: "",
          }),
        });

        if (!invoiceResponse.ok) {
          const errorText = await invoiceResponse.text();
          throw new Error(`Failed to create invoice: ${errorText}`);
        }

        const invoice = await invoiceResponse.json();
        console.log("Invoice created successfully:", invoice);
      }

      // If order has a table, update table status
      if (updatedOrder.tableId) {
        console.log("Updating table status for table:", updatedOrder.tableId);

        const tableResponse = await fetch(
          `/api/tables/${updatedOrder.tableId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: status === "completed" ? "cleaning" : "available",
              currentOrderId: null,
            }),
          }
        );

        if (!tableResponse.ok) {
          throw new Error("Failed to update table status");
        }

        const updatedTable = await tableResponse.json();
        console.log("Table updated successfully:", updatedTable);

        // Update tables state
        setTables((prevTables) =>
          prevTables.map((table) =>
            table.id === updatedOrder.tableId ? updatedTable : table
          )
        );
      }

      toast({
        title: "Order Updated",
        description: `Order #${orderId} has been marked as ${status}${
          status === "completed" ? " and invoice has been created" : ""
        }.`,
      });
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return "Guest";
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getTableName = (tableId?: string) => {
    if (!tableId) return "Takeout";
    const table = tables.find((t) => t.id === tableId);
    return table ? table.name : "Unknown Table";
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categories[0] || "all"}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAdd={() => addToOrder(item)}
                      />
                    ))}
                  </div>
                </TabsContent>

                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {menuItems
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onAdd={() => addToOrder(item)}
                          />
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No orders yet
                  </p>
                ) : (
                  orders
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 5)
                    .map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={updateOrderStatus}
                        getCustomerName={getCustomerName}
                        getTableName={getTableName}
                      />
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={setSelectedCustomerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table">Table</Label>
                  <Select
                    value={selectedTableId}
                    onValueChange={setSelectedTableId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a table (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="takeout">Takeout</SelectItem>
                      {tables
                        .filter((table) => table.status === "available")
                        .map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name} (Capacity: {table.capacity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentOrder.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No items in order
                </p>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {currentOrder.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{item.menuItem.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${item.menuItem.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeFromOrder(item.menuItem.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => addToOrder(item.menuItem)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setCurrentOrder((prev) =>
                                prev.filter(
                                  (i) => i.menuItem.id !== item.menuItem.id
                                )
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center font-bold text-lg mb-4">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={placeOrder}
                disabled={currentOrder.length === 0}
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm
            subtotal={calculateTotal()}
            onComplete={completeOrder}
            onCancel={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
              <div className="mt-2">
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </div>
            </div>
            <Button size="sm" onClick={onAdd}>
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderCard({
  order,
  onUpdateStatus,
  getCustomerName,
  getTableName,
}: {
  order: Order;
  onUpdateStatus: (
    id: string,
    status: "pending" | "completed" | "cancelled"
  ) => void;
  getCustomerName: (id?: string) => string;
  getTableName: (id?: string) => string;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold">Order #{order.id}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {getCustomerName(order.customerId)}
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {getTableName(order.tableId)}
              </Badge>
              {order.paymentMethod && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {order.paymentMethod}
                </Badge>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-2 space-y-1">
          {order.items.map((item: OrderItem, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menuItem.name}
              </span>
              <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="font-bold">Total: ${order.total.toFixed(2)}</span>
          <div className="flex space-x-2">
            {order.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(order.id, "completed")}
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(order.id, "cancelled")}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/invoices/view/${order.id}`}>
                <Receipt className="mr-2 h-4 w-4" />
                Receipt
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentFormProps {
  subtotal: number;
  onComplete: (paymentMethod: string, tipAmount: number) => void;
  onCancel: () => void;
}

function PaymentForm({ subtotal, onComplete, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [customTip, setCustomTip] = useState<string>("");
  const [useCustomTip, setUseCustomTip] = useState<boolean>(false);

  // Get restaurant settings for default tip percentages
  const [defaultTipPercentages, setDefaultTipPercentages] = useState<number[]>([
    15, 18, 20,
  ]);

  useEffect(() => {
    const storedSettings = localStorage.getItem("restaurantSettings");
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (settings.defaultTipPercentages) {
        setDefaultTipPercentages(settings.defaultTipPercentages);
      }
    }
  }, []);

  const calculateTipAmount = () => {
    if (useCustomTip) {
      return Number.parseFloat(customTip) || 0;
    } else {
      return (subtotal * tipPercentage) / 100;
    }
  };

  const calculateTotal = () => {
    return subtotal + calculateTipAmount();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <h3 className="font-medium">Payment Method</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={paymentMethod === "cash" ? "default" : "outline"}
            onClick={() => setPaymentMethod("cash")}
            className="w-full"
          >
            Cash
          </Button>
          <Button
            variant={paymentMethod === "credit_card" ? "default" : "outline"}
            onClick={() => setPaymentMethod("credit_card")}
            className="w-full"
          >
            Credit Card
          </Button>
          <Button
            variant={paymentMethod === "mobile_pay" ? "default" : "outline"}
            onClick={() => setPaymentMethod("mobile_pay")}
            className="w-full"
          >
            Mobile Pay
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Add Tip</h3>
        <div className="grid grid-cols-3 gap-2">
          {defaultTipPercentages.map((percentage) => (
            <Button
              key={percentage}
              variant={
                !useCustomTip && tipPercentage === percentage
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                setTipPercentage(percentage);
                setUseCustomTip(false);
              }}
              className="w-full"
            >
              {percentage}%
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={useCustomTip ? "default" : "outline"}
            onClick={() => setUseCustomTip(true)}
            className="whitespace-nowrap"
          >
            Custom
          </Button>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter custom tip amount"
            value={customTip}
            onChange={(e) => {
              setCustomTip(e.target.value);
              setUseCustomTip(true);
            }}
            disabled={!useCustomTip}
          />
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tip:</span>
          <span>${calculateTipAmount().toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onComplete(paymentMethod, calculateTipAmount())}>
          Complete Payment
        </Button>
      </div>
    </div>
  );
}
