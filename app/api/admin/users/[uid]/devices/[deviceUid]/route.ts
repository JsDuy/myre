// app/api/admin/users/[uid]/devices/[deviceUid]/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// Cấp quyền truy cập (POST)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; deviceUid: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { uid, deviceUid } = await params;
    const body = await request.json();
    const { role } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const url = `${FASTAPI_URL}/admin/users/${uid}/devices/${deviceUid}?role=${role}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error granting device access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Gỡ quyền truy cập (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; deviceUid: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { uid, deviceUid } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const response = await fetch(
      `${FASTAPI_URL}/admin/users/${uid}/devices/${deviceUid}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error revoking device access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Cập nhật role (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; deviceUid: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    const { uid, deviceUid } = await params;
    const body = await request.json();
    const { role } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const url = `${FASTAPI_URL}/admin/users/${uid}/devices/${deviceUid}?role=${role}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating device role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
