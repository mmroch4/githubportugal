import localFont from "next/font/local";

export const monaSans = localFont({
  display: "swap",
  src: "./Mona-Sans.woff2",
  fallback: ["system-ui"],
});

/** Segunda voz do design: números, etiquetas de secção e comandos. */
export const jetBrainsMono = localFont({
  display: "swap",
  src: "./JetBrainsMono.woff2",
  variable: "--fonte-mono",
  weight: "100 800",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
