import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// You'll need to install and import an email library
// For example: import nodemailer from "nodemailer";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // TODO: Implement email sending using a library like Nodemailer
    // This is a placeholder that just returns success
    console.log(`Would send invoice ${invoice.id} to ${email}`);

    return NextResponse.json({
      message: "Email sent successfully",
      sentTo: email,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
