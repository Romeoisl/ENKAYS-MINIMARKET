import { ImageResponse } from "next/og";
import { BRAND_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f5ec",
          color: "#173b2b",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#16824b" }}>{SITE_NAME}</div>
          <div style={{ fontSize: 22, color: "#6b7280" }}>{SITE_TAGLINE}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
          <div style={{ fontSize: 25, fontWeight: 800, color: "#d49b16", letterSpacing: "2px" }}>
            NIGERIAN FOODSTUFF & EVERYDAY ESSENTIALS
          </div>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08 }}>
            Quality food essentials, made easy.
          </div>
          <div style={{ fontSize: 24, lineHeight: 1.4, color: "#4b5563" }}>{BRAND_DESCRIPTION}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, color: "#6b7280" }}>
          <span>enkays-foods-and-more.vercel.app</span>
          <span>Order directly through WhatsApp or phone</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
