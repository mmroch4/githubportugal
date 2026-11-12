import { createPublicKey, verify } from "node:crypto";

/** Verde do GitHub Portugal, usado na barra lateral das mensagens. */
export const COR = 0x2ea043;

// Prefixo DER de uma chave pública Ed25519 (SubjectPublicKeyInfo).
const PREFIXO_ED25519 = Buffer.from("302a300506032b6570032100", "hex");

/**
 * Confirma que um pedido veio mesmo do Discord: a assinatura Ed25519 tem de
 * corresponder a `timestamp + corpo` e à chave pública da aplicação.
 */
export function assinaturaValida(
  corpo: string,
  assinatura: string | null,
  timestamp: string | null,
  chavePublica: string
) {
  if (!assinatura || !timestamp) return false;
  if (!/^[0-9a-f]{128}$/i.test(assinatura)) return false;
  if (!/^[0-9a-f]{64}$/i.test(chavePublica)) return false;

  try {
    const chave = createPublicKey({
      key: Buffer.concat([PREFIXO_ED25519, Buffer.from(chavePublica, "hex")]),
      format: "der",
      type: "spki",
    });
    return verify(
      null,
      Buffer.from(timestamp + corpo),
      chave,
      Buffer.from(assinatura, "hex")
    );
  } catch {
    return false;
  }
}

/** Tira acentos e passa a minúsculas, para comparar texto escrito à mão. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Corta um texto para caber num campo do Discord. */
export function cortar(texto: string, maximo: number) {
  return texto.length <= maximo ? texto : `${texto.slice(0, maximo - 1)}…`;
}

/** Escapa a formatação Markdown do Discord em texto vindo de fora. */
export function escapar(texto: string) {
  return texto.replace(/([\\*_~`|>\[\]()])/g, "\\$1");
}

export type Embed = {
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  thumbnail?: { url: string };
};
