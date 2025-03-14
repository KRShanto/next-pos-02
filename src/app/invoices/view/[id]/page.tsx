"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Mail, Printer, ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Invoice {
  id: string;
  orderId?: string;
  customerId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  notes: string;
  order?: {
    items: {
      quantity: number;
      menuItem: {
        name: string;
        price: number;
      };
    }[];
  };
  customer?: Customer;
}

interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  taxRate: number;
  enableTips: boolean;
  defaultTipPercentages: number[];
}

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [restaurantSettings, setRestaurantSettings] =
    useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Try to fetch invoice by ID first
        let invoiceResponse = await fetch(`/api/invoices/${invoiceId}`);

        // If not found, try to fetch by order ID
        if (!invoiceResponse.ok) {
          invoiceResponse = await fetch(`/api/invoices/by-order/${invoiceId}`);
        }

        if (!invoiceResponse.ok) {
          throw new Error("Invoice not found");
        }

        const invoiceData = await invoiceResponse.json();
        setInvoice(invoiceData);

        // Fetch customer data if invoice has a customer
        if (invoiceData.customerId) {
          const customerResponse = await fetch(
            `/api/customers/${invoiceData.customerId}`
          );
          if (!customerResponse.ok) {
            throw new Error("Failed to fetch customer data");
          }
          const customerData = await customerResponse.json();
          setCustomer(customerData);
        }

        // Fetch restaurant settings
        const settingsResponse = await fetch("/api/settings");
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setRestaurantSettings(settingsData.restaurantSettings);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load invoice",
          variant: "destructive",
        });
        router.push("/invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500";
      case "sent":
        return "bg-blue-500";
      case "paid":
        return "bg-green-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice?.id}/pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Handle PDF download (implementation depends on your PDF generation service)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been generated and downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!invoice || !customer?.email) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customer.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast({
        title: "Email Sent",
        description: `Invoice has been emailed to ${customer.email}.`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading invoice...
      </div>
    );
  }

  if (!invoice || !customer) {
    return (
      <div className="container mx-auto py-10 text-center">
        Invoice not found.{" "}
        <Link href="/invoices" className="text-primary underline">
          Return to invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button asChild>
            <Link href={`/invoices/edit/${invoice.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">{restaurantSettings?.name}</h1>
              <p className="text-muted-foreground">
                {restaurantSettings?.address}
              </p>
              <p className="text-muted-foreground">
                {restaurantSettings?.phone}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-xl">{invoice.id}</p>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-muted-foreground mb-2">Bill To:</h3>
              <p className="font-bold">{customer.name}</p>
              <p>{customer.address}</p>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-muted-foreground">
                    Invoice Date:
                  </span>
                  <span>{formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-muted-foreground">
                    Due Date:
                  </span>
                  <span>{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-muted rounded-t-md grid grid-cols-12 gap-4 p-4 font-bold">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="border-x border-b rounded-b-md divide-y">
              {invoice.order?.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-6">{item.menuItem.name}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    ${item.menuItem.price.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax ({invoice.taxRate}%):</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">Notes:</h3>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
