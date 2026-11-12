"use client";

import { useEffect, useRef } from "react";

type Filtros = Record<
  string,
  [valor: string, definir: (valor: string) => void]
>;

/**
 * Liga filtros de uma página aos parâmetros do URL (por exemplo
 * `/projetos?q=pest&linguagem=PHP`): lê-os ao abrir a página e mantém o URL
 * atualizado, para que uma pesquisa possa ser partilhada ou guardada.
 */
export function useFiltrosNoUrl(filtros: Filtros) {
  const lido = useRef(false);
  const atuais = useRef(filtros);

  useEffect(() => {
    atuais.current = filtros;
  });

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    for (const [chave, [, definir]] of Object.entries(atuais.current)) {
      const valor = parametros.get(chave);
      if (valor) definir(valor);
    }
    lido.current = true;
  }, []);

  const assinatura = Object.entries(filtros)
    .map(([chave, [valor]]) => `${chave}=${valor}`)
    .join("&");

  useEffect(() => {
    if (!lido.current) return;
    const url = new URL(window.location.href);
    for (const [chave, [valor]] of Object.entries(atuais.current)) {
      if (valor) url.searchParams.set(chave, valor);
      else url.searchParams.delete(chave);
    }
    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [assinatura]);
}
