import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: {
        id: params.id,
      },
      include: {
        assignedServer: true,
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error fetching table:", error);
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tableData = await request.json();

    const table = await prisma.table.update({
      where: {
        id: params.id,
      },
      data: {
        name: tableData.name,
        capacity: tableData.capacity,
        status: tableData.status,
        assignedServerId: tableData.assignedServerId || null,
        reservationTime: tableData.reservationTime
          ? new Date(tableData.reservationTime)
          : null,
        reservationName: tableData.reservationName || null,
        currentOrderId: tableData.currentOrderId || null,
      },
      include: {
        assignedServer: true,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.table.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    );
  }
}
