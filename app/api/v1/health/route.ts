import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "ENKAYS MINI-MARKETPLACE API", version: "v1" });
  } catch (error) {
    return toErrorResponse(error);
  }
}
