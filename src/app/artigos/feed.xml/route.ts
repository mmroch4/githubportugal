import { siteUrl } from "@/config/metadata";
import { EQUIPA, lerArtigos } from "@/lib/artigos";

export const dynamic = "force-static";

const escapar = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const dataRss = (data: string) => new Date(`${data}T09:00:00Z`).toUTCString();

/** Feed RSS dos artigos da comunidade. */
export async function GET() {
  const artigos = await lerArtigos();

  const itens = artigos
    .map((a) => {
      const url = `${siteUrl}/artigos/${a.slug}`;
      return `    <item>
      <title>${escapar(a.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapar(a.descricao)}</description>
      <pubDate>${dataRss(a.data)}</pubDate>
      <dc:creator>${escapar(a.autor ? `@${a.autor}` : EQUIPA)}</dc:creator>
${a.etiquetas.map((e) => `      <category>${escapar(e)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Artigos | GitHub Portugal</title>
    <link>${siteUrl}/artigos</link>
    <atom:link href="${siteUrl}/artigos/feed.xml" rel="self" type="application/rss+xml" />
    <description>Artigos escritos pela comunidade GitHub Portugal.</description>
    <language>pt-PT</language>
${
  artigos[0]
    ? `    <lastBuildDate>${dataRss(artigos[0].data)}</lastBuildDate>\n`
    : ""
}${itens}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
