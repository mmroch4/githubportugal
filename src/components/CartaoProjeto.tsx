import {
  ArchiveIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  RepoForkedIcon,
  StarIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { caminhoMantenedor, formatoNumero, tempoDesde } from "@/lib/formatar";
import type { ResumoMantenedor } from "@/lib/mantenedores";
import type { Projeto } from "@/lib/projetos";

export function CartaoProjeto({
  projeto: p,
  atualizadoEm,
  mantenedores = [],
  issuesAbertas = 0,
}: {
  projeto: Projeto;
  atualizadoEm: string;
  mantenedores?: ResumoMantenedor[];
  /** Issues "good first issue" ou "help wanted" sem ninguém atribuído. */
  issuesAbertas?: number;
}) {
  return (
    <li className="flex flex-col rounded-md border border-light-gray-2 bg-white p-4">
      <div className="mb-2 flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-md border border-light-gray-2"
        />
        <div className="min-w-0 flex-1">
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block break-words font-bold hover:underline focus:underline"
          >
            <span className="font-normal text-light-gray-6">{p.dono}/</span>
            {p.nome}
          </a>
          <span className="text-xs text-light-gray-6">{p.categoria}</span>
        </div>
        {p.arquivado && (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-light-yellow-2 bg-light-yellow-0 px-2 py-0.5 text-xs font-medium text-light-yellow-8">
            <ArchiveIcon size={12} />
            Arquivado
          </span>
        )}
      </div>

      <p className="mb-3 flex-1 text-sm text-light-gray-8 sm:text-base">
        {p.descricao}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-6">
        {p.linguagem && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full border border-light-gray-2"
              style={{ backgroundColor: p.corLinguagem ?? undefined }}
            />
            {p.linguagem}
          </span>
        )}
        {p.estrelas !== null && (
          <span
            className="flex items-center gap-1"
            title={`${p.estrelas} estrelas`}
          >
            <StarIcon className="fill-light-gray-6" />
            {formatoNumero.format(p.estrelas)}
            <span className="sr-only">estrelas</span>
          </span>
        )}
        {p.forks !== null && (
          <span className="flex items-center gap-1" title={`${p.forks} forks`}>
            <RepoForkedIcon className="fill-light-gray-6" />
            {formatoNumero.format(p.forks)}
            <span className="sr-only">forks</span>
          </span>
        )}
        {p.ultimaAtividade && (
          <span>Atualizado {tempoDesde(p.ultimaAtividade, atualizadoEm)}</span>
        )}
        {issuesAbertas > 0 && (
          <Link
            href={`/primeiras-contribuicoes?projeto=${encodeURIComponent(
              p.repositorio.toLowerCase()
            )}`}
            title="Issues marcadas como good first issue ou help wanted"
            className="flex items-center gap-1 font-medium text-light-green-7 hover:underline focus:underline"
          >
            <IssueOpenedIcon className="fill-light-green-6" />
            {issuesAbertas === 1
              ? "1 issue para começar"
              : `${issuesAbertas} issues para começar`}
          </Link>
        )}
        {p.site && (
          <a
            href={p.site}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 font-medium text-light-blue-6 hover:underline focus:underline"
          >
            Site
            <LinkExternalIcon size={12} />
          </a>
        )}
      </div>

      {mantenedores.length > 0 && (
        <div className="mt-3 flex items-center gap-2 border-t border-light-gray-1 pt-3 text-sm text-light-gray-6">
          <span>Mantido por</span>
          <ul className="flex flex-wrap items-center gap-1">
            {mantenedores.map((m) => (
              <li key={m.login}>
                <Link
                  href={caminhoMantenedor(m.login)}
                  title={`Ver perfil de ${m.login}`}
                  className="flex items-center gap-1.5 rounded-full border border-light-gray-2 py-0.5 pl-0.5 pr-2 font-medium text-light-gray-8 hover:border-light-gray-3 hover:bg-light-gray-0 focus:border-light-gray-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.avatar}
                    alt=""
                    width={20}
                    height={20}
                    loading="lazy"
                    className="h-5 w-5 rounded-full"
                  />
                  {m.login}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
