import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const inventoryItems = await prisma.inventoryItem.findMany({
      orderBy: {
        category: "asc",
      },
    })

    return NextResponse.json(inventoryItems)
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const itemData = await request.json()

    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        name: itemData.name,
        category: itemData.category,
        quantity: itemData.quantity,
        unit: itemData.unit,
        minQuantity: itemData.minQuantity,
        cost: itemData.cost,
        supplier: itemData.supplier || null,
      },
    })

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
}

