import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const menuItem = await request.json()

    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: params.id,
      },
      data: {
        name: menuItem.name,
        price: menuItem.price,
        category: menuItem.category,
        description: menuItem.description || null,
      },
    })

    return NextResponse.json(updatedMenuItem)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.menuItem.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}

