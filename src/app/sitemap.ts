import { MetadataRoute } from "next";
import { siteUrl } from "@/config/metadata";
import { caminhoMantenedor } from "@/lib/formatar";
import { listarLogins } from "@/lib/mantenedores";
import { capitulos } from "@/content/guia/capitulos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const logins = await listarLogins();

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
    { url: `${siteUrl}/sobre` },
  ];
}
