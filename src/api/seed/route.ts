import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST() {
  try {
    // Create restaurant settings
    await prisma.restaurantSettings.create({
      data: {
        name: "My Restaurant",
        address: "123 Main St, City, State",
        phone: "(555) 123-4567",
        taxRate: 8.5,
        enableTips: true,
        defaultTipPercentages: JSON.stringify([15, 18, 20]),
      },
    })

    // Create app settings
    await prisma.appSettings.create({
      data: {
        darkMode: false,
        compactMode: false,
        receiptFooter: "Thank you for your business!",
      },
    })

    // Create menu items
    const menuItems = await prisma.menuItem.createMany({
      data: [
        {
          name: "Margherita Pizza",
          price: 12.99,
          category: "Pizza",
          description: "Classic pizza with tomato sauce, mozzarella, and basil",
        },
        {
          name: "Caesar Salad",
          price: 8.99,
          category: "Salads",
          description: "Romaine lettuce with Caesar dressing, croutons, and parmesan",
        },
        {
          name: "Spaghetti Carbonara",
          price: 14.99,
          category: "Pasta",
          description: "Spaghetti with eggs, cheese, pancetta, and black pepper",
        },
      ],
    })

    // Create inventory items
    await prisma.inventoryItem.createMany({
      data: [
        {
          name: "Flour",
          category: "Baking",
          quantity: 25,
          unit: "kg",
          minQuantity: 10,
          cost: 1.5,
          supplier: "Wholesale Foods Inc.",
        },
        {
          name: "Tomatoes",
          category: "Produce",
          quantity: 8,
          unit: "kg",
          minQuantity: 10,
          cost: 2.99,
          supplier: "Local Farms Co.",
        },
        {
          name: "Mozzarella Cheese",
          category: "Dairy",
          quantity: 15,
          unit: "kg",
          minQuantity: 5,
          cost: 8.5,
          supplier: "Dairy Distributors",
        },
        {
          name: "Olive Oil",
          category: "Oils",
          quantity: 12,
          unit: "liters",
          minQuantity: 5,
          cost: 12.99,
          supplier: "Mediterranean Imports",
        },
      ],
    })

    // Create tables
    await prisma.table.createMany({
      data: [
        {
          name: "Table 1",
          capacity: 4,
          status: "available",
        },
        {
          name: "Table 2",
          capacity: 2,
          status: "available",
        },
        {
          name: "Table 3",
          capacity: 6,
          status: "available",
        },
        {
          name: "Table 4",
          capacity: 8,
          status: "available",
        },
      ],
    })

    // Create customers
    await prisma.customer.createMany({
      data: [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "(555) 123-4567",
          address: "123 Main St, Anytown, USA",
          loyaltyPoints: 150,
          notes: "Regular customer, prefers window seating",
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "(555) 987-6543",
          address: "456 Oak Ave, Somewhere, USA",
          loyaltyPoints: 75,
          notes: "Allergic to nuts",
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}

