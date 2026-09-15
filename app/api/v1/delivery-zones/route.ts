import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ state: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(80) });
export async function GET(request: NextRequest) { const parsed = schema.safeParse({ state: request.nextUrl.searchParams.get("state"), city: request.nextUrl.searchParams.get("city") }); if (!parsed.success) return NextResponse.json({ data: [] }); const zones = await db.deliveryZone.findMany({ where: { state: { equals: parsed.data.state, mode: "insensitive" }, city: { equals: parsed.data.city, mode: "insensitive" }, active: true }, orderBy: { fee: "asc" } }); return NextResponse.json({ data: zones }); }
