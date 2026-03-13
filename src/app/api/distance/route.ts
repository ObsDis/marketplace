import { NextRequest, NextResponse } from "next/server";

async function geocode(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
    })}`,
    { headers: { "User-Agent": "SprintCargo/1.0" } }
  );
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: NextRequest) {
  try {
    const { pickupAddress, dropoffAddress } = await request.json();

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Both addresses required" },
        { status: 400 }
      );
    }

    const [pickup, dropoff] = await Promise.all([
      geocode(pickupAddress),
      geocode(dropoffAddress),
    ]);

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: "Could not geocode one or both addresses" },
        { status: 422 }
      );
    }

    const straightLine = haversineDistance(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng
    );
    // 1.3x multiplier approximates road distance from straight-line
    const estimatedDriving = Math.round(straightLine * 1.3 * 10) / 10;

    return NextResponse.json({
      distance: estimatedDriving,
      unit: "miles",
      pickup: { lat: pickup.lat, lng: pickup.lng },
      dropoff: { lat: dropoff.lat, lng: dropoff.lng },
    });
  } catch (error) {
    console.error("Distance calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate distance" },
      { status: 500 }
    );
  }
}
