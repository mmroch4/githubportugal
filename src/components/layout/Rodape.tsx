import { MarkGithubIcon, RssIcon } from "@primer/octicons-react";
import Link from "next/link";
import { RiDiscordFill, RiWhatsappFill } from "react-icons/ri";
import { Logo } from "@/components/Logo";
import { links } from "@/config/metadata";
import { colunasRodape } from "@/config/navegacao";

const icone =
  "flex h-9 w-9 items-center justify-center rounded-md border border-light-gray-2 text-light-gray-6 hover:border-light-gray-3 hover:text-light-black";

/** Rodapé de todas as páginas, com o mapa do site e o aviso de não-oficial. */
export function Rodape() {
  return (
    <footer className="relative mt-16 border-t border-light-gray-2/70 print:hidden">
      {/* Linha com as cores do logótipo. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-marca-verde/70 to-transparent [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="mb-3 flex w-fit items-center gap-2.5">
            <Logo size={32} alt="" className="h-8 w-8" />
            <span className="font-bold tracking-tight">GitHub Portugal</span>
          </Link>
          <p className="mb-4 max-w-xs text-sm text-light-gray-6">
            Comunidade portuguesa de programadores e de projetos open source no
            GitHub. De dev para dev.
          </p>
          <div className="flex gap-2">
            <a
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className={icone}
              aria-label="Discord"
            >
              <RiDiscordFill className="h-4 w-4" />
            </a>
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={icone}
              aria-label="WhatsApp"
            >
              <RiWhatsappFill className="h-4 w-4" />
            </a>
            <a
              href={links.repository}
              target="_blank"
              rel="noopener noreferrer"
              className={icone}
              aria-label="Repositório no GitHub"
            >
              <MarkGithubIcon className="fill-current" />
            </a>
            <a
              href="/artigos/feed.xml"
              className={icone}
              aria-label="RSS dos artigos"
            >
              <RssIcon className="fill-current" />
            </a>
          </div>
        </div>

        {colunasRodape.map((coluna) => (
          <nav key={coluna.titulo} aria-label={coluna.titulo}>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-light-gray-5">
              {coluna.titulo}
            </h2>
            <ul className="space-y-2 text-sm">
              {coluna.ligacoes.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-light-gray-7 hover:text-light-black"
                  >
                    {l.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-light-gray-2/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-light-gray-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Projeto da comunidade,{" "}
            <strong className="font-semibold text-light-gray-7">
              não oficial
            </strong>{" "}
            e sem ligação ao GitHub, Inc.{" "}
            <Link href="/sobre" className="underline hover:text-light-black">
              Saber mais
            </Link>
          </p>
          <p className="font-mono">
            feito em <span className="text-marca-verde">Portu</span>
            <span className="text-marca-vermelho">gal</span> · código aberto
          </p>
        </div>
      </div>
    </footer>
  );
}
