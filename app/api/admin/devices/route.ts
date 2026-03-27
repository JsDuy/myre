// app/api/admin/devices/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    console.log("=== Admin Devices API ===");
    console.log("Token exists:", !!token);

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const url = `${FASTAPI_URL}/admin/devices`;
    console.log("Calling FastAPI:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("FastAPI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI error response:", errorText);
      return NextResponse.json(
        { error: `FastAPI error: ${response.status}`, details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("Devices fetched:", data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in admin/devices API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
