import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const employeeData = await request.json();

    const employee = await prisma.employee.create({
      data: employeeData,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeData = await request.json();

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: params.id,
      },
      data: employeeData,
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employee.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
