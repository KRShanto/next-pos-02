import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        category: "asc",
      },
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const menuItem = await request.json()

    const newMenuItem = await prisma.menuItem.create({
      data: {
        name: menuItem.name,
        price: menuItem.price,
        category: menuItem.category,
        description: menuItem.description || null,
      },
    })

    return NextResponse.json(newMenuItem)
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
  }
}

