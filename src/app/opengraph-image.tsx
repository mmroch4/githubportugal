import { ImageResponse } from "next/og";
import {
  CORES_LOGOTIPO,
  desenhoLogotipo,
  LOGOTIPO_VIEWBOX,
} from "@/lib/logotipo";

export const alt = "GitHub Portugal: o open source português, num só sítio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** O logótipo (chavetas e quinas) sem fundo, para o tema escuro. */
const logo = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGOTIPO_VIEWBOX}">${desenhoLogotipo(
    CORES_LOGOTIPO.quinasEscuro
  )}</svg>`
).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: "#0d1117",
          backgroundImage:
            "radial-gradient(ellipse 700px 420px at 0% 0%, rgba(54,201,90,0.16), transparent 70%), radial-gradient(ellipse 700px 420px at 100% 100%, rgba(248,82,74,0.12), transparent 70%)",
          color: "#e6edf3",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logo} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: CORES_LOGOTIPO.verde,
              fontFamily: "monospace",
              marginBottom: 20,
            }}
          >
            {"// githubportugal.com"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            GitHub Portugal
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#9198a1",
              marginTop: 28,
            }}
          >
            <span>O open source&nbsp;</span>
            <span style={{ color: CORES_LOGOTIPO.verde }}>portugu</span>
            {/* O satori separa os dois spans: aproximamo-los. */}
            <span style={{ color: CORES_LOGOTIPO.vermelho, marginLeft: -11 }}>
              ês
            </span>
            <span>, num só sítio.</span>
          </div>
          <div
            style={{ display: "flex", marginTop: 48, height: 10, width: 300 }}
          >
            <div style={{ display: "flex", flex: 2, background: "#046a38" }} />
            <div style={{ display: "flex", flex: 3, background: "#da291c" }} />
          </div>
        </div>
      </div>
    ),
    size
  );
}
