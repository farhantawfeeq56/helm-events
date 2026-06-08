import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json({
      success: true,
      data: { message: "DB Connected" },
    });
  } catch (error) {
    console.error("DB connectivity test failed.", error);

    return NextResponse.json(
      {
        success: false,
        error: "DB Connection Failed",
      },
      { status: 500 }
    );
  }
}
