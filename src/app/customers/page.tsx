"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  History,
  Receipt,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  joinDate: string;
  notes: string;
}

interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  customerId?: string;
  tableId?: string;
  paymentMethod?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const ordersResponse = await fetch("/api/orders");
      const ordersData = await ordersResponse.json();
      return ordersData;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersResponse = await fetch("/api/customers");
        const customersData = await customersResponse.json();
        setCustomers(customersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddCustomer = async (
    newCustomer: Omit<Customer, "id" | "joinDate" | "loyaltyPoints">
  ) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        throw new Error("Failed to add customer");
      }

      const customer = await response.json();
      setCustomers([...customers, customer]);
      setShowAddForm(false);

      toast({
        title: "Customer Added",
        description: `${newCustomer.name} has been added to the customer database.`,
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      const response = await fetch(`/api/customers/${updatedCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCustomer),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      const customer = await response.json();
      setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
      setEditingCustomer(null);

      toast({
        title: "Customer Updated",
        description: `${updatedCustomer.name}'s information has been updated.`,
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const customerToDelete = customers.find((customer) => customer.id === id);
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(customers.filter((customer) => customer.id !== id));

      toast({
        title: "Customer Deleted",
        description: customerToDelete
          ? `${customerToDelete.name} has been removed from the database.`
          : "Customer has been removed.",
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const updateOrderStatus = async (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ) => {
    try {
      // Update order status
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();

      // If order is being completed, create an invoice
      if (status === "completed") {
        const invoiceResponse = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            createFromOrder: true,
          }),
        });

        if (!invoiceResponse.ok) {
          throw new Error("Failed to create invoice");
        }
      }

      // If order is completed or cancelled and has a table, update table status
      if (updatedOrder.tableId) {
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
          console.error("Failed to update table status");
        }
      }

      toast({
        title: "Order Updated",
        description: `Order #${orderId} has been marked as ${status}${
          status === "completed" ? " and invoice has been created" : ""
        }.`,
      });

      return updatedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm
              onSubmit={handleAddCustomer}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {editingCustomer && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm
              onSubmit={handleUpdateCustomer}
              onCancel={() => setEditingCustomer(null)}
              initialValues={editingCustomer}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <p className="col-span-full text-center py-10 text-muted-foreground">
            {searchTerm
              ? "No customers match your search."
              : "No customers found. Add your first customer!"}
          </p>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {customer.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                    <div className="mt-2 flex items-center">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary"
                      >
                        {customer.loyaltyPoints} Points
                      </Badge>
                      <span className="text-xs ml-2 text-muted-foreground">
                        Joined {formatDate(customer.joinDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCustomer(customer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <History className="mr-2 h-4 w-4" />
                        Order History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          Order History - {customer.name}
                        </DialogTitle>
                      </DialogHeader>
                      <CustomerOrderHistory
                        customerId={customer.id}
                        fetchOrders={fetchOrders}
                        onUpdateStatus={updateOrderStatus}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/invoices/new?customerId=${customer.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      New Invoice
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface CustomerFormProps {
  onSubmit: (customer: Customer) => void;
  onCancel: () => void;
  initialValues?: Customer;
}

function CustomerForm({
  onSubmit,
  onCancel,
  initialValues,
}: CustomerFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [address, setAddress] = useState(initialValues?.address || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customerData = {
      ...(initialValues && {
        id: initialValues.id,
        joinDate: initialValues.joinDate,
        loyaltyPoints: initialValues.loyaltyPoints,
      }),
      name,
      email,
      phone,
      address,
      notes,
    };

    onSubmit(customerData as Customer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter customer name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter customer address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special notes about this customer"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialValues ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}

function CustomerOrderHistory({
  customerId,
  fetchOrders,
  onUpdateStatus,
}: {
  customerId: string;
  fetchOrders: () => Promise<Order[]>;
  onUpdateStatus: (
    id: string,
    status: "pending" | "completed" | "cancelled"
  ) => Promise<Order>;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const ordersData = await fetchOrders();
    setOrders(ordersData);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [customerId]);

  const handleUpdateStatus = async (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ) => {
    try {
      await onUpdateStatus(orderId, status);
      await loadOrders(); // Refresh orders after update
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading orders...
      </div>
    );
  }

  const customerOrders = orders
    .filter((order) => order.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (customerOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No order history found for this customer.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {customerOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onUpdateStatus={handleUpdateStatus}
          getCustomerName={() => ""}
          getTableName={() => ""}
        />
      ))}
    </div>
  );
}

import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

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
