import { construirIndice } from "@/lib/pesquisa";

// Os eventos passados saem do índice; basta regenerá-lo uma vez por dia.
export const revalidate = 86400;

/** Índice usado pela pesquisa global (Ctrl+K). */
export async function GET() {
  return Response.json(await construirIndice());
}
