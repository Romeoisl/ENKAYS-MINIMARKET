import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const runtime = "edge";
export const alt = "Enkays Foods & More — Quality foodstuff. Simple ordering. Better living.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #071f15 0%, #0b4631 55%, #10231a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fcd34d",
              color: "#10231a",
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            E
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{SITE_NAME}</div>
            <div style={{ marginTop: 6, fontSize: 20, color: "#a7f3d0" }}>{SITE_TAGLINE}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fcd34d", marginBottom: 18 }}>
            NIGERIAN FOODSTUFF & EVERYDAY ESSENTIALS
          </div>
          <div style={{ fontSize: 58, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2 }}>
            Quality food essentials, made easy.
          </div>
          <div style={{ marginTop: 22, fontSize: 24, lineHeight: 1.4, color: "#d1fae5" }}>
            Shop rice, beans, garri, cooking oils, flour, spices, seafood, meat, poultry and more.
            Order directly through WhatsApp or phone.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, color: "#d1fae5" }}>
          <span>enkays-foods-and-more.vercel.app</span>
          <span style={{ color: "#fcd34d" }}>•</span>
          <span>Built for everyday Nigerian shopping</span>
        </div>
      </div>
    ),
    size,
  );
}
