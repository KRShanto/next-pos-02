import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const customerData = await request.json()

    const customer = await prisma.customer.create({
      data: {
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        loyaltyPoints: customerData.loyaltyPoints || 0,
        notes: customerData.notes || null,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

