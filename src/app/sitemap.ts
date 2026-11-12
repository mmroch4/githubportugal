import { MetadataRoute } from "next";
import { siteUrl } from "@/config/metadata";
import { caminhoMantenedor } from "@/lib/formatar";
import { listarLogins } from "@/lib/mantenedores";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const logins = await listarLogins();

  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/projetos` },
    { url: `${siteUrl}/mantenedores` },
    ...logins.map((login) => ({
      url: `${siteUrl}${caminhoMantenedor(login)}`,
    })),
    { url: `${siteUrl}/sobre` },
  ];
}
