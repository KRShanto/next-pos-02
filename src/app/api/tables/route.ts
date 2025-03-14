import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        assignedServer: true,
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableData = await request.json();

    const table = await prisma.table.create({
      data: {
        name: tableData.name,
        capacity: tableData.capacity,
        status: tableData.status || "available",
        assignedServerId: tableData.assignedServerId || null,
        reservationTime: tableData.reservationTime
          ? new Date(tableData.reservationTime)
          : null,
        reservationName: tableData.reservationName || null,
      },
      include: {
        assignedServer: true,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
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

    const updatedTable = await prisma.table.update({
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
      },
      include: {
        assignedServer: true,
      },
    });

    return NextResponse.json(updatedTable);
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
