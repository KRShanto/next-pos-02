import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { menuItems, orders, customers, tables, inventoryItems, invoices, restaurantSettings, appSettings } =
      await request.json()

    // Migrate menu items
    if (menuItems && menuItems.length > 0) {
      await prisma.menuItem.createMany({
        data: menuItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description || "",
        })),
        skipDuplicates: true,
      })
    }

    // Migrate customers
    if (customers && customers.length > 0) {
      await prisma.customer.createMany({
        data: customers.map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          address: customer.address || null,
          loyaltyPoints: customer.loyaltyPoints || 0,
          joinDate: new Date(customer.joinDate || Date.now()),
          notes: customer.notes || null,
        })),
        skipDuplicates: true,
      })
    }

    // Migrate tables
    if (tables && tables.length > 0) {
      await prisma.table.createMany({
        data: tables.map((table: any) => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          status: table.status,
          currentOrderId: table.currentOrderId || null,
          reservationTime: table.reservationTime ? new Date(table.reservationTime) : null,
          reservationName: table.reservationName || null,
        })),
        skipDuplicates: true,
      })
    }

    // Migrate inventory items
    if (inventoryItems && inventoryItems.length > 0) {
      await prisma.inventoryItem.createMany({
        data: inventoryItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          minQuantity: item.minQuantity,
          cost: item.cost,
          supplier: item.supplier || null,
          lastRestocked: new Date(item.lastRestocked || Date.now()),
        })),
        skipDuplicates: true,
      })
    }

    // Migrate orders and order items (more complex due to relations)
    if (orders && orders.length > 0) {
      for (const order of orders) {
        const createdOrder = await prisma.order.create({
          data: {
            id: order.id,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod || null,
            tip: order.tip || null,
            customerId: order.customerId || null,
            tableId: order.tableId || null,
            createdAt: new Date(order.createdAt || Date.now()),
          },
        })

        // Create order items
        if (order.items && order.items.length > 0) {
          await prisma.orderItem.createMany({
            data: order.items.map((item: any) => ({
              orderId: createdOrder.id,
              menuItemId: item.menuItem.id,
              quantity: item.quantity,
              price: item.menuItem.price,
            })),
          })
        }
      }
    }

    // Migrate invoices
    if (invoices && invoices.length > 0) {
      await prisma.invoice.createMany({
        data: invoices.map((invoice: any) => ({
          id: invoice.id,
          orderId: invoice.orderId || null,
          customerId: invoice.customerId,
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          status: invoice.status,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          notes: invoice.notes || null,
        })),
        skipDuplicates: true,
      })
    }

    // Migrate restaurant settings
    if (restaurantSettings) {
      await prisma.restaurantSettings.create({
        data: {
          name: restaurantSettings.name,
          address: restaurantSettings.address || null,
          phone: restaurantSettings.phone || null,
          taxRate: restaurantSettings.taxRate || 8.5,
          enableTips: restaurantSettings.enableTips !== undefined ? restaurantSettings.enableTips : true,
          defaultTipPercentages: JSON.stringify(restaurantSettings.defaultTipPercentages || [15, 18, 20]),
        },
      })
    }

    // Migrate app settings
    if (appSettings) {
      await prisma.appSettings.create({
        data: {
          darkMode: appSettings.darkMode || false,
          compactMode: appSettings.compactMode || false,
          receiptFooter: appSettings.receiptFooter || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Data migrated successfully from localStorage to database",
    })
  } catch (error) {
    console.error("Error migrating data:", error)
    return NextResponse.json({ success: false, error: "Failed to migrate data" }, { status: 500 })
  }
}

