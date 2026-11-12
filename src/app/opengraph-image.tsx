import { ImageResponse } from "next/og";

export const alt = "GitHub Portugal: comunidade portuguesa de programadores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1117",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 24px",
            borderRadius: 999,
            background: "#ddf4ff",
            color: "#0969da",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          de DEV para DEV
        </div>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 900 }}>
          GitHub Portugal
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#8b949e",
            marginTop: 24,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Comunidade portuguesa de programadores e de projetos open source
        </div>
        <div style={{ display: "flex", marginTop: 48, height: 12, width: 360 }}>
          <div style={{ display: "flex", flex: 2, background: "#046a38" }} />
          <div style={{ display: "flex", flex: 3, background: "#da291c" }} />
        </div>
      </div>
    ),
    size
  );
}
