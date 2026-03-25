// app/api/history/route.ts
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
    const deviceId = searchParams.get("deviceId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const limitParam = searchParams.get("limit");

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }

    let url = `${FASTAPI_URL}/health-data/by-uid/${deviceId}`;
    const params = new URLSearchParams();

    // Nếu có start/end, thêm vào URL
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    // Nếu có limit và KHÔNG có start/end (hiển thị trang), thêm limit
    if (limitParam && !start && !end) {
      params.append("limit", limitParam);
    }

    // Nếu có start/end (export), thêm export=true để lấy toàn bộ
    if (start && end) {
      params.append("export", "true");
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log("📡 Calling FastAPI:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Received ${data.length} records`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedData = data.map((item: any) => ({
      time: item.measured_at || item.timestamp || item.time,
      spo2: item.spo2 || 0,
      heartRate: item.heart_rate || item.heartRate || 0,
      temperature: item.temperature || 0,
      gas: item.gas_level || item.gas || 0,
      humidity: item.humidity || 0,
      bloodPressure: item.blood_pressure || item.bloodPressure || "--/--",
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
