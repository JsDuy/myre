// app/api/admin/users/[uid]/admin/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { uid } = params;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const body = await request.json();
    const { is_admin } = body;

    const response = await fetch(
      `${FASTAPI_URL}/admin/users/${uid}/admin?is_admin=${is_admin}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `FastAPI error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user admin status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
