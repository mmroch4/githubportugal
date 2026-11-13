import { CommentDiscussionIcon, RepoIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Suspense } from "react";
import { links } from "@/config/metadata";
import { obterPrimeirasContribuicoes } from "@/lib/issues";
import { obterDiretorio } from "@/lib/projetos";
import {
  ListaIssues,
  ListaIssuesComParametros,
  type ResumoProjeto,
} from "./ListaIssues";

// Volta a pedir as issues ao GitHub, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const description =
  "Issues marcadas como “good first issue” ou “help wanted” nos projetos open source portugueses: o sítio certo para fazeres a tua primeira contribuição.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Primeiras contribuições em projetos open source portugueses",
  descricao: description,
  caminho: "/primeiras-contribuicoes",
});

export default async function PrimeirasContribuicoes() {
  const { projetos, atualizadoEm } = await obterDiretorio();
  const { issues, dadosGitHubDisponiveis } = await obterPrimeirasContribuicoes(
    projetos,
    atualizadoEm
  );

  const resumos: Record<string, ResumoProjeto> = Object.fromEntries(
    projetos.map((p) => [
      p.repositorio.toLowerCase(),
      {
        repositorio: p.repositorio,
        avatar: p.avatar,
        url: p.url,
        linguagem: p.linguagem,
        corLinguagem: p.corLinguagem,
      },
    ])
  );

  const props = { issues, projetos: resumos, atualizadoEm };

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <header className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Primeiras contribuições
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Queres contribuir para open source e não sabes por onde começar?
            Estas issues dos projetos portugueses foram marcadas pelos
            mantenedores como boas para quem está a começar ou como pedidos de
            ajuda.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/projetos"
            className="botao-secundario"
          >
            <RepoIcon className="fill-light-black" />
            Projetos
          </Link>
          <a
            href={links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-primario"
          >
            <CommentDiscussionIcon className="fill-current" />
            Pedir ajuda no Discord
          </a>
        </div>
      </header>

      <section
        aria-labelledby="como-comecar"
        className="mb-6 rounded-md border border-marca-verde/40 bg-marca-verde/5 p-4 text-sm text-light-gray-8 sm:text-base"
      >
        <h2 id="como-comecar" className="mb-2 font-bold">
          Como começar
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Escolhe uma issue e lê-a até ao fim, incluindo os comentários.
          </li>
          <li>
            Comenta na issue a dizer que queres trabalhar nela, para ninguém
            fazer o mesmo, e espera pela resposta de quem mantém o projeto.
          </li>
          <li>
            Lê o <code>CONTRIBUTING.md</code> do projeto, se existir, antes de
            abrires o pull request.
          </li>
          <li>
            Ficaste preso? Pergunta na issue ou fala connosco no{" "}
            <a
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-marca-verde underline"
            >
              Discord
            </a>
            .
          </li>
        </ol>
      </section>

      {dadosGitHubDisponiveis ? (
        <Suspense fallback={<ListaIssues {...props} />}>
          <ListaIssuesComParametros {...props} />
        </Suspense>
      ) : (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Não foi possível obter as issues do GitHub neste momento. Volta a
          tentar mais tarde.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-light-gray-6">
        Manténs um projeto do diretório? Marca as issues com as etiquetas{" "}
        <code>good first issue</code> ou <code>help wanted</code> e elas
        aparecem aqui.{" "}
        <a
          href={`${links.repository}/blob/main/CONTRIBUTING.md#primeiras-contribuições`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-marca-verde underline"
        >
          Saber mais
        </a>
      </p>
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Primeiras contribuições em projetos open source portugueses",
          descricao: description,
          caminho: "/primeiras-contribuicoes",
        })}
      />
    </main>
  );
}
