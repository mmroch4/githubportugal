import { gerarSelo, varianteDoFicheiro } from "@/lib/gerar-selo";
import { FICHEIROS_SELO } from "@/lib/selo";

// Os selos são gerados uma vez, no build; outros nomes dão 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(FICHEIROS_SELO).map((ficheiro) => ({ ficheiro }));
}

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ ficheiro: string }> }
) {
  const { ficheiro } = await params;
  const variante = varianteDoFicheiro(ficheiro);
  if (!variante) return new Response("Selo não encontrado", { status: 404 });

  return new Response(await gerarSelo(variante), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Um dia no browser e no proxy de imagens do GitHub, uma semana na CDN.
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
