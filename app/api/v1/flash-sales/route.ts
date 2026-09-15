import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 30;
export async function GET() { const now = new Date(); const sales = await db.flashSale.findMany({ where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } }, include: { items: { include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } } } }, orderBy: { endsAt: "asc" } }); return NextResponse.json({ data: sales }); }
