import { gerarLlmsFullTxt } from "@/lib/llms";

// Resumo do site para assistentes de IA (https://llmstxt.org/).
export const revalidate = 86400;

export async function GET() {
  return new Response(await gerarLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
