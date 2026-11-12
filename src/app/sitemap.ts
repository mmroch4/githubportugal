import { MetadataRoute } from "next";
import { siteUrl } from "@/config/metadata";
import { caminhoMantenedor } from "@/lib/formatar";
import { listarLogins } from "@/lib/mantenedores";
import { capitulos } from "@/content/guia/capitulos";
import { lerArtigos } from "@/lib/artigos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [logins, artigos] = await Promise.all([listarLogins(), lerArtigos()]);

  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/projetos` },
    { url: `${siteUrl}/primeiras-contribuicoes` },
    { url: `${siteUrl}/mantenedores` },
    ...logins.map((login) => ({
      url: `${siteUrl}${caminhoMantenedor(login)}`,
    })),
    { url: `${siteUrl}/ranking` },
    { url: `${siteUrl}/eventos` },
    { url: `${siteUrl}/comunidades` },
    { url: `${siteUrl}/guia` },
    ...capitulos.map((c) => ({ url: `${siteUrl}/guia/${c.slug}` })),
    { url: `${siteUrl}/artigos` },
    ...artigos.map((a) => ({
      url: `${siteUrl}/artigos/${a.slug}`,
      lastModified: a.atualizado ?? a.data,
    })),
    { url: `${siteUrl}/sobre` },
  ];
}
