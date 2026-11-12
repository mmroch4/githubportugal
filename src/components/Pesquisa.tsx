"use client";

import { LinkExternalIcon, SearchIcon, XIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { normalizar } from "@/lib/formatar";
import type { EntradaPesquisa } from "@/lib/pesquisa";

const MAXIMO = 30;

type EntradaPreparada = EntradaPesquisa & {
  _titulo: string;
  _texto: string;
};

function pontuar(e: EntradaPreparada, palavras: string[]) {
  let pontos = 0;
  for (const p of palavras) {
    if (e._titulo.startsWith(p)) pontos += 4;
    else if (e._titulo.includes(p)) pontos += 3;
    else if (e._texto.includes(p)) pontos += 1;
    else return 0;
  }
  return e.tipo === "Página" ? pontos + 1 : pontos;
}

/** Pesquisa global do site, aberta com o botão, Ctrl+K, ⌘K ou "/". */
export function Pesquisa({
  botaoClassName,
  children,
}: {
  botaoClassName?: string;
  /** Conteúdo do botão; por omissão, só o ícone da lupa. */
  children?: React.ReactNode;
}) {
  const [aberta, setAberta] = useState(false);
  const [termo, setTermo] = useState("");
  const [indice, setIndice] = useState<EntradaPreparada[] | null>(null);
  const [erro, setErro] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const id = useId();

  const abrir = useCallback(() => setAberta(true), []);
  const fechar = useCallback(() => {
    setAberta(false);
    setTermo("");
    setAtivo(0);
  }, []);

  // Atalhos de teclado.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const aEscrever =
        alvo?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(alvo?.tagName ?? "");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberta((a) => !a);
      } else if (e.key === "/" && !aEscrever) {
        e.preventDefault();
        abrir();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abrir]);

  // Carrega o índice na primeira abertura.
  useEffect(() => {
    if (!aberta) return;
    campo.current?.focus();
    if (indice) return;
    let cancelado = false;
    fetch("/pesquisa.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<EntradaPesquisa[]>;
      })
      .then((dados) => {
        if (cancelado) return;
        setIndice(
          dados.map((e) => ({
            ...e,
            _titulo: normalizar(e.titulo),
            _texto: normalizar(`${e.titulo} ${e.descricao} ${e.termos ?? ""}`),
          }))
        );
        setErro(false);
      })
      .catch(() => !cancelado && setErro(true));
    return () => {
      cancelado = true;
    };
  }, [aberta, indice]);

  // Impede o scroll da página com a pesquisa aberta.
  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberta]);

  const resultados = useMemo(() => {
    if (!indice) return [];
    const palavras = normalizar(termo.trim()).split(/\s+/).filter(Boolean);
    if (palavras.length === 0) {
      return indice.filter((e) => e.tipo === "Página");
    }
    return indice
      .map((e) => ({ e, pontos: pontuar(e, palavras) }))
      .filter((r) => r.pontos > 0)
      .sort(
        (a, b) =>
          b.pontos - a.pontos || a.e.titulo.localeCompare(b.e.titulo, "pt-PT")
      )
      .slice(0, MAXIMO)
      .map((r) => r.e);
  }, [indice, termo]);

  useEffect(() => {
    lista.current
      ?.querySelector<HTMLElement>(`[data-indice="${ativo}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  const seguir = (e: EntradaPesquisa) => {
    fechar();
    if (e.url.startsWith("/")) router.push(e.url);
    else window.open(e.url, "_blank", "noopener,noreferrer");
  };

  const navegar = (ev: React.KeyboardEvent) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setAtivo((a) => Math.min(a + 1, resultados.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setAtivo((a) => Math.max(a - 1, 0));
    } else if (ev.key === "Enter" && resultados[ativo]) {
      ev.preventDefault();
      seguir(resultados[ativo]);
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      fechar();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className={botaoClassName}
        aria-label="Pesquisar no site (Ctrl+K)"
        title="Pesquisar no site (Ctrl+K)"
      >
        {children ?? <SearchIcon className="fill-light-gray-7" />}
      </button>

      {aberta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-light-black/40 p-4 pt-[10vh] dark:bg-dark-black/70"
          onMouseDown={(e) => e.target === e.currentTarget && fechar()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pesquisar no site"
            className="flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-light-gray-3 bg-white shadow-xl"
            onKeyDown={navegar}
          >
            <div className="flex items-center gap-2 border-b border-light-gray-2 px-4">
              <SearchIcon className="shrink-0 fill-light-gray-5" />
              <input
                ref={campo}
                type="text"
                enterKeyHint="go"
                autoComplete="off"
                value={termo}
                onChange={(e) => {
                  setTermo(e.target.value);
                  setAtivo(0);
                }}
                placeholder="Projetos, pessoas, eventos, comunidades..."
                className="w-full bg-transparent py-4 text-base placeholder:text-light-gray-5 focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls={id}
                aria-activedescendant={
                  resultados[ativo] ? `${id}-${ativo}` : undefined
                }
                aria-autocomplete="list"
              />
              <button
                type="button"
                onClick={fechar}
                className="shrink-0 rounded p-1 hover:bg-light-gray-1"
                aria-label="Fechar pesquisa"
              >
                <XIcon className="fill-light-gray-6" />
              </button>
            </div>

            <ul
              ref={lista}
              id={id}
              role="listbox"
              aria-label="Resultados"
              className="overflow-y-auto p-2"
            >
              {erro ? (
                <li className="p-4 text-center text-light-gray-6">
                  Não foi possível carregar a pesquisa. Tenta outra vez mais
                  tarde.
                </li>
              ) : !indice ? (
                <li className="p-4 text-center text-light-gray-6">
                  A carregar...
                </li>
              ) : resultados.length === 0 ? (
                <li className="p-4 text-center text-light-gray-6">
                  Sem resultados para &ldquo;{termo}&rdquo;.
                </li>
              ) : (
                resultados.map((r, i) => {
                  const externo = !r.url.startsWith("/");
                  return (
                    <li
                      key={`${r.tipo}-${r.url}-${r.titulo}`}
                      id={`${id}-${i}`}
                      role="option"
                      aria-selected={i === ativo}
                      data-indice={i}
                      onMouseMove={() => setAtivo(i)}
                      onClick={() => seguir(r)}
                      className={clsx(
                        "flex cursor-pointer items-start gap-3 rounded-md px-3 py-2",
                        i === ativo && "bg-light-gray-1"
                      )}
                    >
                      <span className="mt-0.5 w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-light-gray-6">
                        {r.tipo}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 font-bold">
                          <span className="truncate">{r.titulo}</span>
                          {externo && (
                            <LinkExternalIcon
                              size={12}
                              className="shrink-0 fill-light-gray-5"
                              aria-label="(abre noutro separador)"
                            />
                          )}
                        </span>
                        <span className="line-clamp-2 text-sm text-light-gray-7">
                          {r.descricao}
                        </span>
                      </span>
                    </li>
                  );
                })
              )}
            </ul>

            <p className="hidden border-t border-light-gray-2 px-4 py-2 text-xs text-light-gray-6 sm:block">
              <kbd className="font-mono">↑</kbd>{" "}
              <kbd className="font-mono">↓</kbd> para navegar,{" "}
              <kbd className="font-mono">Enter</kbd> para abrir,{" "}
              <kbd className="font-mono">Esc</kbd> para fechar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
