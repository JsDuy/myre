// app/api/admin/devices/[deviceUid]/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { deviceUid: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { deviceUid } = params;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const response = await fetch(`${FASTAPI_URL}/admin/devices/${deviceUid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `FastAPI error: ${response.status}` },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
