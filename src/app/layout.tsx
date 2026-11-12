import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Cabecalho } from "@/components/layout/Cabecalho";
import { Rodape } from "@/components/layout/Rodape";
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
    <html
      lang="pt-PT"
      // Escuro por omissão; o script do tema troca para claro se for o caso.
      className="dark scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body
        className={clsx(
          monaSans.className,
          "flex min-h-screen flex-col bg-light-gray-0 text-light-black antialiased"
        )}
      >
        <DadosEstruturados dados={dadosEstruturadosSite} />
        <Cabecalho />

        <div className="flex flex-1 flex-col pt-4 sm:pt-6">{children}</div>

        <Rodape />
        {/* Estatísticas de visitas sem cookies (Vercel Web Analytics e Speed Insights). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
