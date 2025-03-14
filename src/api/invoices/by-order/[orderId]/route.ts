import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/invoices/by-order/[orderId] - Get invoice by order ID
export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { orderId: params.orderId },
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
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
