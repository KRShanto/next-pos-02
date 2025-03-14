"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { DatePicker } from "@/components/ui/date-picker"

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomerId || "",
  );
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState<string>("Thank you for your business!");
  const [taxRate, setTaxRate] = useState<number>(8.5);
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });

  useEffect(() => {
    // Load customers from localStorage
    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }

    // Load menu items from localStorage
    const storedMenuItems = localStorage.getItem("menuItems");
    if (storedMenuItems) {
      setMenuItems(JSON.parse(storedMenuItems));
    }

    // Load restaurant settings for tax rate
    const storedSettings = localStorage.getItem("restaurantSettings");
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (settings.taxRate) {
        setTaxRate(settings.taxRate);
      }
    }
  }, []);

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateInvoiceItem = (
    id: string,
    field: keyof InvoiceItem,
    value: any,
  ) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total if quantity or unitPrice changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleMenuItemSelect = (itemId: string, invoiceItemId: string) => {
    const menuItem = menuItems.find((item) => item.id === itemId);
    if (menuItem) {
      updateInvoiceItem(invoiceItemId, "description", menuItem.name);
      updateInvoiceItem(invoiceItemId, "unitPrice", menuItem.price);
      updateInvoiceItem(
        invoiceItemId,
        "total",
        menuItem.price *
          (invoiceItems.find((item) => item.id === invoiceItemId)?.quantity ||
            1),
      );
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxAmount = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const generateInvoiceNumber = () => {
    // Get existing invoices to determine the next number
    const storedInvoices = localStorage.getItem("invoices");
    let nextNumber = 1;

    if (storedInvoices) {
      const invoices = JSON.parse(storedInvoices);
      const invoiceNumbers = invoices.map((inv: any) => {
        const match = inv.id.match(/INV-(\d+)/);
        return match ? Number.parseInt(match[1]) : 0;
      });

      if (invoiceNumbers.length > 0) {
        nextNumber = Math.max(...invoiceNumbers) + 1;
      }
    }

    return `INV-${nextNumber.toString().padStart(3, "0")}`;
  };

  const saveInvoice = (status: "draft" | "sent") => {
    if (!selectedCustomerId) {
      toast({
        title: "Customer Required",
        description: "Please select a customer for this invoice.",
        variant: "destructive",
      });
      return;
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "Items Required",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    // Check if all items have descriptions and prices
    const invalidItems = invoiceItems.filter(
      (item) => !item.description || item.unitPrice <= 0,
    );
    if (invalidItems.length > 0) {
      toast({
        title: "Invalid Items",
        description:
          "All items must have a description and price greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const newInvoice = {
      id: generateInvoiceNumber(),
      customerId: selectedCustomerId,
      items: invoiceItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: calculateSubtotal(),
      taxRate: taxRate,
      taxAmount: calculateTaxAmount(),
      total: calculateTotal(),
      status,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      notes,
    };

    // Save to localStorage
    const storedInvoices = localStorage.getItem("invoices");
    let updatedInvoices = [];

    if (storedInvoices) {
      updatedInvoices = [...JSON.parse(storedInvoices), newInvoice];
    } else {
      updatedInvoices = [newInvoice];
    }

    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));

    toast({
      title: "Invoice Created",
      description: `Invoice ${newInvoice.id} has been ${
        status === "draft" ? "saved as a draft" : "created and marked as sent"
      }.`,
    });

    // Redirect to invoice view
    router.push(`/invoices/view/${newInvoice.id}`);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => saveInvoice("draft")}>
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={() => saveInvoice("sent")}>
            <Send className="mr-2 h-4 w-4" />
            Create & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="datetime-local"
                    value={issueDate.toISOString().slice(0, 16)}
                    onChange={(e) => setIssueDate(new Date(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate.toISOString().slice(0, 16)}
                    onChange={(e) => setDueDate(new Date(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Invoice Items</h3>
                  <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {invoiceItems.length === 0 ? (
                  <div className="rounded-md border py-8 text-center text-muted-foreground">
                    No items added. Click &quot;Add Item&quot; to start building
                    your invoice.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoiceItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 items-end gap-2"
                      >
                        <div className="col-span-12 md:col-span-5">
                          <Label
                            htmlFor={`item-${index}-desc`}
                            className="text-xs"
                          >
                            Description
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`item-${index}-desc`}
                              value={item.description}
                              onChange={(e) =>
                                updateInvoiceItem(
                                  item.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Item description"
                            />
                            <Select
                              onValueChange={(value) =>
                                handleMenuItemSelect(value, item.id)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Menu" />
                              </SelectTrigger>
                              <SelectContent>
                                {menuItems.map((menuItem) => (
                                  <SelectItem
                                    key={menuItem.id}
                                    value={menuItem.id}
                                  >
                                    {menuItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <Label
                            htmlFor={`item-${index}-qty`}
                            className="text-xs"
                          >
                            Quantity
                          </Label>
                          <Input
                            id={`item-${index}-qty`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateInvoiceItem(
                                item.id,
                                "quantity",
                                Number.parseInt(e.target.value) || 1,
                              )
                            }
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <Label
                            htmlFor={`item-${index}-price`}
                            className="text-xs"
                          >
                            Unit Price
                          </Label>
                          <Input
                            id={`item-${index}-price`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateInvoiceItem(
                                item.id,
                                "unitPrice",
                                Number.parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <Label
                            htmlFor={`item-${index}-total`}
                            className="text-xs"
                          >
                            Total
                          </Label>
                          <div className="flex items-center">
                            <Input
                              id={`item-${index}-total`}
                              value={item.total.toFixed(2)}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-end md:col-span-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInvoiceItem(item.id)}
                            className="self-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional notes for this invoice"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={taxRate}
                    onChange={(e) =>
                      setTaxRate(Number.parseFloat(e.target.value) || 0)
                    }
                    className="h-8 w-16 text-right"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <span>${calculateTaxAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <div className="pt-6">
                <Button className="w-full" onClick={() => saveInvoice("sent")}>
                  <Send className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
