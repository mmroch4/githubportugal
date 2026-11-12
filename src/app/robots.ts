import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/metadata";

/**
 * Crawlers de assistentes e motores de resposta com IA. Ficam explicitamente
 * autorizados: queremos que os projetos, o guia e os artigos sejam citados.
 */
const crawlersIA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "MistralAI-User",
  "DuckAssistBot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // O índice da pesquisa só serve o browser; não precisa de ser indexado.
      { userAgent: "*", allow: "/", disallow: ["/pesquisa.json"] },
      { userAgent: crawlersIA, allow: "/", disallow: ["/pesquisa.json"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
