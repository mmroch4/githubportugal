import { MetadataRoute } from "next";
import { siteUrl } from "@/config/metadata";
import { caminhoMantenedor } from "@/lib/formatar";
import { listarLogins } from "@/lib/mantenedores";
import { capitulos } from "@/content/guia/capitulos";
import { lerArtigos } from "@/lib/artigos";

type Entrada = MetadataRoute.Sitemap[number];

function pagina(
  caminho: string,
  changeFrequency: Entrada["changeFrequency"],
  priority: number,
  lastModified?: string
): Entrada {
  return {
    url: `${siteUrl}${caminho}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [logins, artigos] = await Promise.all([listarLogins(), lerArtigos()]);
  const ultimoArtigo = artigos
    .map((a) => a.atualizado ?? a.data)
    .sort()
    .at(-1);

  return [
    pagina("/", "weekly", 1),
    pagina("/projetos", "daily", 0.9),
    pagina("/primeiras-contribuicoes", "daily", 0.8),
    pagina("/mantenedores", "weekly", 0.8),
    ...logins.map((login) => pagina(caminhoMantenedor(login), "weekly", 0.5)),
    pagina("/ranking", "weekly", 0.8),
    pagina("/eventos", "daily", 0.8),
    pagina("/comunidades", "monthly", 0.7),
    pagina("/empresas", "weekly", 0.7),
    pagina("/guia", "monthly", 0.8),
    ...capitulos.map((c) => pagina(`/guia/${c.slug}`, "monthly", 0.7)),
    pagina("/artigos", "weekly", 0.7, ultimoArtigo),
    ...artigos.map((a) =>
      pagina(`/artigos/${a.slug}`, "monthly", 0.6, a.atualizado ?? a.data)
    ),
    pagina("/sobre", "monthly", 0.5),
    pagina("/llms.txt", "weekly", 0.3),
  ];
}
