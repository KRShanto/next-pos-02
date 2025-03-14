import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
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

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderData = await request.json()

    // Get the current order to check if table status needs updating
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { table: true },
    })

    // Update the order
    const order = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: {
        status: orderData.status,
        // Only update other fields if provided
        ...(orderData.total && { total: orderData.total }),
        ...(orderData.paymentMethod && { paymentMethod: orderData.paymentMethod }),
        ...(orderData.tip !== undefined && { tip: orderData.tip }),
        ...(orderData.customerId && { customerId: orderData.customerId }),
        ...(orderData.tableId && { tableId: orderData.tableId }),
      },
    })

    // Update table status if order status changed
    if (currentOrder?.tableId && orderData.status && orderData.status !== currentOrder.status) {
      await prisma.table.update({
        where: { id: currentOrder.tableId },
        data: {
          status:
            orderData.status === "completed"
              ? "cleaning"
              : orderData.status === "cancelled"
                ? "available"
                : currentOrder.table?.status,
          ...(orderData.status === "completed" || orderData.status === "cancelled" ? { currentOrderId: null } : {}),
        },
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the order to check if table needs updating
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { table: true },
    })

    // Delete the order (will cascade delete order items)
    await prisma.order.delete({
      where: {
        id: params.id,
      },
    })

    // Update table if needed
    if (order?.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: {
          status: "available",
          currentOrderId: null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}

