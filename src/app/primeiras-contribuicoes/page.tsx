import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={
          issues.length === 1
            ? "1 issue aberta"
            : `${issues.length} issues abertas`
        }
        titulo="Primeiras contribuições"
      >
        <Link href="/guia/primeira-contribuicao" className="botao-secundario">
          Como começar
        </Link>
        <a
          href={links.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-primario"
        >
          Pedir ajuda
        </a>
      </CabecalhoPagina>

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
        Manténs um projeto? Usa as etiquetas <code>good first issue</code> ou{" "}
        <code>help wanted</code>.
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
