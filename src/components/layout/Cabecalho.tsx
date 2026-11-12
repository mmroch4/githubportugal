"use client";

import {
  ChevronDownIcon,
  SearchIcon,
  ThreeBarsIcon,
  XIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RiDiscordFill } from "react-icons/ri";
import { Logo } from "@/components/Logo";
import { Pesquisa } from "@/components/Pesquisa";
import { BotaoTema } from "@/components/Tema";
import { links } from "@/config/metadata";
import {
  estaAtiva,
  navegacaoPrincipal,
  navegacaoSecundaria,
} from "@/config/navegacao";

const botaoIcone =
  "flex h-9 w-9 items-center justify-center rounded-md text-light-gray-7 hover:bg-light-gray-1 hover:text-light-black focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde";

/** "⌘K" em Mac, "Ctrl K" nos restantes (no servidor, "Ctrl K"). */
function useAtalho() {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K"
  );
}

/** Fecha um painel ao clicar fora dele ou ao carregar em Esc. */
function useFecharFora(
  aberto: boolean,
  fechar: () => void,
  ref: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!aberto) return;
    const clique = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fechar();
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("mousedown", clique);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", clique);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto, fechar, ref]);
}

function MenuMais({ caminho }: { caminho: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fechar = () => setAberto(false);
  useFecharFora(aberto, fechar, ref);
  const ativo = navegacaoSecundaria.some((l) => estaAtiva(caminho, l.href));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        className={clsx(
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium hover:text-light-black focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
          ativo ? "text-light-black" : "text-light-gray-6"
        )}
      >
        Mais
        <ChevronDownIcon
          size={12}
          className={clsx("fill-current transition", aberto && "rotate-180")}
        />
      </button>
      {aberto && (
        <ul className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-light-gray-2 bg-white p-1.5 shadow-xl">
          {navegacaoSecundaria.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={fechar}
                className={clsx(
                  "block rounded-md px-3 py-2 hover:bg-light-gray-1",
                  estaAtiva(caminho, l.href) && "bg-light-gray-1"
                )}
              >
                <span className="block text-sm font-medium">{l.nome}</span>
                {l.descricao && (
                  <span className="block text-xs text-light-gray-6">
                    {l.descricao}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MenuMovel({ caminho }: { caminho: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fechar = () => setAberto(false);
  useFecharFora(aberto, fechar, ref);

  return (
    <div ref={ref} className="lg:hidden">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        className={botaoIcone}
      >
        {aberto ? (
          <XIcon className="fill-current" />
        ) : (
          <ThreeBarsIcon className="fill-current" />
        )}
      </button>
      {aberto && (
        <nav
          aria-label="Menu"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-light-gray-2 bg-light-gray-0 px-4 pb-6 pt-2 shadow-xl"
        >
          <ul className="grid gap-1 sm:grid-cols-2">
            {[...navegacaoPrincipal, ...navegacaoSecundaria].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={fechar}
                  aria-current={estaAtiva(caminho, l.href) ? "page" : undefined}
                  className={clsx(
                    "block rounded-md px-3 py-2.5 font-medium hover:bg-light-gray-1",
                    estaAtiva(caminho, l.href)
                      ? "bg-light-gray-1 text-light-black"
                      : "text-light-gray-7"
                  )}
                >
                  {l.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

/** Cabeçalho fixo em todas as páginas: marca, navegação, pesquisa e tema. */
export function Cabecalho() {
  const caminho = usePathname() ?? "/";
  const atalho = useAtalho();

  return (
    <header className="sticky top-0 z-40 border-b border-light-gray-2/70 bg-light-gray-0/80 backdrop-blur-md print:hidden">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="mr-2 flex shrink-0 items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde"
        >
          <Logo size={32} alt="" className="h-8 w-8" />
          <span className="font-bold tracking-tight">GitHub Portugal</span>
          <span className="hidden rounded border border-light-gray-2 px-1.5 py-0.5 font-mono text-[11px] text-light-gray-6 sm:inline">
            pt-PT
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center lg:flex">
          {navegacaoPrincipal.map((l) => {
            const ativa = estaAtiva(caminho, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={ativa ? "page" : undefined}
                className={clsx(
                  "relative rounded-md px-3 py-2 text-sm font-medium hover:text-light-black focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
                  ativa ? "text-light-black" : "text-light-gray-6"
                )}
              >
                {l.nome}
                {ativa && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-marca-verde to-marca-vermelho"
                  />
                )}
              </Link>
            );
          })}
          <MenuMais caminho={caminho} />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Uma só instância: cada uma regista os atalhos de teclado. */}
          <Pesquisa botaoClassName="flex h-9 w-9 items-center justify-center gap-2 rounded-md text-light-gray-7 hover:bg-light-gray-1 hover:text-light-black focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde sm:w-auto sm:justify-start sm:border sm:border-light-gray-2 sm:bg-white/60 sm:pl-3 sm:pr-1.5 sm:text-sm sm:text-light-gray-6 sm:hover:border-light-gray-3 sm:hover:bg-white/60">
            <SearchIcon className="fill-current" />
            <span className="hidden pr-6 sm:inline">Pesquisar…</span>
            <kbd className="hidden rounded border border-light-gray-2 bg-light-gray-0 px-1.5 py-0.5 font-mono text-[11px] sm:inline">
              {atalho}
            </kbd>
          </Pesquisa>
          <a
            href={links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className={botaoIcone}
            aria-label="Discord do GitHub Portugal"
            title="Discord"
          >
            <RiDiscordFill className="h-5 w-5" />
          </a>
          <BotaoTema className={botaoIcone} />
          <MenuMovel caminho={caminho} />
        </div>
      </div>
    </header>
  );
}
