import { ImageResponse } from "next/og";
import { brand, location } from "@/config/brand";

export const alt = `${brand.name} — Coastal Flavours. Street Soul.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, generated at build time from the brand config. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background:
            "radial-gradient(60% 70% at 85% 85%, rgba(215,158,72,0.45), transparent 70%), linear-gradient(160deg, #0a120b 0%, #101B12 50%, #192719 100%)",
          color: "#F5EBD7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ position: "absolute", inset: 28, border: "1px solid rgba(215,182,106,0.4)", borderRadius: 24, display: "flex" }} />
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "#D7B66A", fontFamily: "sans-serif" }}>
          AUTHENTIC COASTAL FLAVOURS
        </div>
        <div style={{ display: "flex", fontSize: 96, marginTop: 28, lineHeight: 1 }}>Coastal Flavours.</div>
        <div style={{ display: "flex", fontSize: 96, marginTop: 8, lineHeight: 1, color: "#D7B66A", fontStyle: "italic" }}>
          Street Soul.
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 28, color: "#D6D0C1", fontFamily: "sans-serif", letterSpacing: 4 }}>
          {`${brand.name}  ·  ${location.city.toUpperCase()}`}
        </div>
      </div>
    ),
    size
  );
}
