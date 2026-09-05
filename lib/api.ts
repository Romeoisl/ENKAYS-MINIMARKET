import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public code: string, message: string, public status = 400, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export function requestId() {
  return randomUUID();
}

export function apiError(error: unknown, id = requestId()) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message, details: error.details }, requestId: id }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten() }, requestId: id }, { status: 400 });
  }
  console.error("Unhandled API error", { requestId: id, error });
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." }, requestId: id }, { status: 500 });
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}
