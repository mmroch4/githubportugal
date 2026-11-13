import { ArchiveIcon, IssueOpenedIcon, StarIcon } from "@primer/octicons-react";
import Link from "next/link";
import { caminhoMantenedor, formatoNumero } from "@/lib/formatar";
import type { ResumoMantenedor } from "@/lib/mantenedores";
import type { Projeto } from "@/lib/projetos";

/**
 * Cartão de um projeto (design v2): nome, categoria e uma linha de dados. A
 * descrição fica no `title` do nome, para não encher o cartão de texto.
 */
export function CartaoProjeto({
  projeto: p,
  mantenedores = [],
  issuesAbertas = 0,
}: {
  projeto: Projeto;
  /** Já não é mostrado; fica para compatibilidade com quem o passa. */
  atualizadoEm?: string;
  mantenedores?: ResumoMantenedor[];
  /** Issues "good first issue" ou "help wanted" sem ninguém atribuído. */
  issuesAbertas?: number;
}) {
  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-xl border border-light-gray-2 bg-white/60 p-5 transition hover:border-light-gray-3 hover:bg-white">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.avatar}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-lg border border-light-gray-2"
        />
        <a
          href={p.site ?? p.url}
          target="_blank"
          rel="noopener noreferrer"
          title={p.descricao}
          className="min-w-0 flex-1 truncate font-semibold hover:underline focus:underline"
        >
          <span className="font-normal text-light-gray-6">{p.dono}/</span>
          {p.nome}
        </a>
        {p.arquivado && (
          <span
            title="Arquivado"
            className="flex shrink-0 items-center rounded-full border border-light-yellow-2 bg-light-yellow-0 p-1 text-light-yellow-8"
          >
            <ArchiveIcon size={12} />
            <span className="sr-only">Arquivado</span>
          </span>
        )}
      </div>

      <span className="self-start rounded-full bg-light-gray-1 px-2.5 py-0.5 font-mono text-xs text-light-gray-8">
        {p.categoria}
      </span>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-light-gray-6">
        {p.linguagem && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.corLinguagem ?? undefined }}
            />
            {p.linguagem}
          </span>
        )}
        {p.estrelas !== null && (
          <span className="flex items-center gap-1">
            <StarIcon size={12} className="fill-current" />
            {formatoNumero.format(p.estrelas)}
            <span className="sr-only">estrelas</span>
          </span>
        )}
        {issuesAbertas > 0 && (
          <Link
            href={`/primeiras-contribuicoes?projeto=${encodeURIComponent(
              p.repositorio.toLowerCase()
            )}`}
            title="Issues marcadas como good first issue ou help wanted"
            className="flex items-center gap-1 text-marca-verde hover:underline focus:underline"
          >
            <IssueOpenedIcon size={12} className="fill-current" />
            {issuesAbertas}
            <span className="sr-only">
              {issuesAbertas === 1
                ? "issue para começar"
                : "issues para começar"}
            </span>
          </Link>
        )}
        {mantenedores.length > 0 && (
          <ul className="ml-auto flex -space-x-1.5" aria-label="Mantido por">
            {mantenedores.map((m) => (
              <li key={m.login}>
                <Link href={caminhoMantenedor(m.login)} title={m.login}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.avatar}
                    alt={m.login}
                    width={22}
                    height={22}
                    loading="lazy"
                    className="h-[22px] w-[22px] rounded-full border-2 border-light-gray-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
