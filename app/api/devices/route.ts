// app/api/devices/route.ts
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const deviceName = searchParams.get("name");

    // Gọi FastAPI để lấy danh sách devices
    const response = await fetch(`${FASTAPI_URL}/devices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status}`);
    }

    const devices = await response.json();

    // Nếu có deviceName, trả về device_id tương ứng
    if (deviceName) {
      const device = devices.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.name === deviceName || d.device_name === deviceName,
      );
      if (!device) {
        return NextResponse.json(
          { error: `Device not found: ${deviceName}` },
          { status: 404 },
        );
      }
      return NextResponse.json({
        deviceId: device.id,
        deviceName: device.name,
      });
    }

    // Trả về danh sách tất cả devices
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
