import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/invoices - Get all invoices
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      customerId,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status,
      issueDate,
      dueDate,
      notes,
    } = body;

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        customerId,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
      },
      include: {
        order: true,
        customer: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
