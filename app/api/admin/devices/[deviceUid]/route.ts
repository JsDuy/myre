// app/api/admin/devices/[deviceUid]/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://192.168.191.1:8000";

console.log("✅ Admin Device Dynamic Route loaded");

// PUT - Sửa thiết bị
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ deviceUid: string }> },
) {
  const { deviceUid } = await context.params;

  console.log("🔥🔥🔥 PUT HANDLER IS BEING CALLED 🔥🔥🔥");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);

  console.log(`🔄 PUT request for deviceUid: ${deviceUid}`);

  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const body = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const fastApiResponse = await fetch(
      `${FASTAPI_URL}/admin/devices/${deviceUid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text();
      console.error(`FastAPI Error ${fastApiResponse.status}:`, errorText);
      return NextResponse.json(
        {
          error: `FastAPI error: ${fastApiResponse.status}`,
          details: errorText,
        },
        { status: fastApiResponse.status },
      );
    }

    const data = await fastApiResponse.json();
    console.log(`✅ Device ${deviceUid} updated successfully`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ deviceUid: string }> },
) {
  const { deviceUid } = await context.params;

  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const response = await fetch(`${FASTAPI_URL}/admin/devices/${deviceUid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to delete", details: errorText },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("DELETE route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
