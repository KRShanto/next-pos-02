import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        restaurantSettings: {
          name: "My Restaurant",
          address: "123 Main St, City, State",
          phone: "(555) 123-4567",
          taxRate: 8.5,
          enableTips: true,
          defaultTipPercentages: [15, 18, 20],
        },
        appSettings: {
          darkMode: false,
          compactMode: false,
          receiptFooter: "Thank you for your business!",
        },
      };
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json({
      restaurantSettings: settings.restaurantSettings,
      appSettings: settings.appSettings,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantSettings, appSettings } = body;

    // Upsert settings (update if exists, create if doesn't)
    const settings = await prisma.settings.upsert({
      where: {
        // There should only be one settings record
        id: "1",
      },
      update: {
        restaurantSettings,
        appSettings,
      },
      create: {
        id: "1",
        restaurantSettings,
        appSettings,
      },
    });

    return NextResponse.json({
      restaurantSettings: settings.restaurantSettings,
      appSettings: settings.appSettings,
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
