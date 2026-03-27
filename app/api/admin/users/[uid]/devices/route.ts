// app/api/admin/users/[uid]/devices/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { uid } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const response = await fetch(`${FASTAPI_URL}/admin/users/${uid}/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
