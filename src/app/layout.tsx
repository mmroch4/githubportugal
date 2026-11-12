import { Ferramentas } from "@/components/Ferramentas";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { NonOfficialWarning } from "@/components/NonOfficialWarning";
import { scriptTema } from "@/components/Tema";
import { monaSans } from "@/config/fonts";
import { metadata as m, viewport as v } from "@/config/metadata";
import { dadosEstruturadosSite } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import clsx from "clsx";
import "./globals.css";

export const metadata = { ...m };
export const viewport = { ...v };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body
        className={clsx(
          monaSans.className,
          "grid min-h-screen grid-cols-1 grid-rows-layout bg-light-gray-0 text-light-black"
        )}
      >
        <DadosEstruturados dados={dadosEstruturadosSite} />
        <NonOfficialWarning />

        {children}

        <Ferramentas />
        {/* Estatísticas de visitas sem cookies (Vercel Web Analytics e Speed Insights). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
