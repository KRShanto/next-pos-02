import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
        table: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    // Create the order
    const order = await prisma.order.create({
      data: {
        total: orderData.total,
        status: orderData.status,
        paymentMethod: orderData.paymentMethod || null,
        tip: orderData.tip || null,
        customerId: orderData.customerId || null,
        tableId: orderData.tableId || null,
      },
    })

    // Create order items
    if (orderData.items && orderData.items.length > 0) {
      await prisma.orderItem.createMany({
        data: orderData.items.map((item: any) => ({
          orderId: order.id,
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.price,
        })),
      })
    }

    // Update customer loyalty points if applicable
    if (orderData.customerId) {
      const pointsToAdd = Math.floor(orderData.total / 10)
      await prisma.customer.update({
        where: { id: orderData.customerId },
        data: {
          loyaltyPoints: {
            increment: pointsToAdd,
          },
        },
      })
    }

    // Update table status if applicable
    if (orderData.tableId) {
      await prisma.table.update({
        where: { id: orderData.tableId },
        data: {
          status: "occupied",
          currentOrderId: order.id,
        },
      })
    }

    // Create invoice if needed
    if (orderData.createInvoice) {
      await prisma.invoice.create({
        data: {
          orderId: order.id,
          customerId: orderData.customerId || "guest",
          subtotal: orderData.subtotal,
          taxRate: orderData.taxRate,
          taxAmount: orderData.taxAmount,
          total: orderData.total,
          status: "paid",
          issueDate: new Date(),
          dueDate: new Date(),
          notes: `Payment method: ${orderData.paymentMethod}${orderData.tip ? `, Tip: $${orderData.tip.toFixed(2)}` : ""}`,
        },
      })
    }

    // Fetch the complete order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
        table: true,
      },
    })

    return NextResponse.json(completeOrder)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

