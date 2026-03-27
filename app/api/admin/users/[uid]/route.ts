// app/api/admin/users/[uid]/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { uid } = params;

    console.log("=== Delete User API ===");
    console.log("UID to delete:", uid);
    console.log("Token exists:", !!token);

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const url = `${FASTAPI_URL}/admin/users/${uid}`;
    console.log("Calling FastAPI:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("FastAPI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI error:", errorText);
      return NextResponse.json(
        { error: `FastAPI error: ${response.status}`, details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
