"use client";

import {
  CommentIcon,
  IssueOpenedIcon,
  SearchIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { normalizar, tempoDesde } from "@/lib/formatar";
import type { Etiqueta, Issue, TipoIssue } from "@/lib/issues";

export type ResumoProjeto = {
  repositorio: string;
  avatar: string;
  url: string;
  linguagem: string | null;
  corLinguagem: string | null;
};

type Ordenacao = "atualizadas" | "recentes" | "comentarios";

type Props = {
  issues: Issue[];
  projetos: Record<string, ResumoProjeto>;
  atualizadoEm: string;
};

const campoClassName =
  "w-full rounded border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

const NOMES_TIPO: Record<TipoIssue, string> = {
  primeira: "Boa primeira issue",
  ajuda: "Pedem ajuda",
};

/** Lê `?projeto=dono/nome` e `?tipo=` do endereço, para as ligações dos cartões de projeto. */
export function ListaIssuesComParametros(props: Props) {
  const parametros = useSearchParams();
  const projeto = parametros.get("projeto")?.toLowerCase() ?? "";
  const tipo = parametros.get("tipo") ?? "";

  return (
    <ListaIssues
      {...props}
      projetoInicial={props.projetos[projeto] ? projeto : ""}
      tipoInicial={tipo === "primeira" || tipo === "ajuda" ? tipo : ""}
    />
  );
}

export function ListaIssues({
  issues,
  projetos,
  atualizadoEm,
  projetoInicial = "",
  tipoInicial = "",
}: Props & { projetoInicial?: string; tipoInicial?: TipoIssue | "" }) {
  const [pesquisa, setPesquisa] = useState("");
  const [tipo, setTipo] = useState<TipoIssue | "">(tipoInicial);
  const [projeto, setProjeto] = useState(projetoInicial);
  const [linguagem, setLinguagem] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("atualizadas");

  const projetoDe = (i: Issue) => projetos[i.repositorio.toLowerCase()];

  const projetosComIssues = useMemo(
    () =>
      Array.from(new Set(issues.map((i) => i.repositorio.toLowerCase())))
        .map((chave) => ({
          chave,
          nome: projetos[chave]?.repositorio ?? chave,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-PT")),
    [issues, projetos]
  );

  const linguagens = useMemo(
    () =>
      Array.from(
        new Set(
          issues
            .map((i) => projetos[i.repositorio.toLowerCase()]?.linguagem)
            .filter(Boolean) as string[]
        )
      ).sort((a, b) => a.localeCompare(b, "pt-PT")),
    [issues, projetos]
  );

  const visiveis = useMemo(() => {
    const termo = normalizar(pesquisa.trim());

    const filtradas = issues.filter((i) => {
      const chave = i.repositorio.toLowerCase();
      if (tipo && i.tipo !== tipo) return false;
      if (projeto && chave !== projeto) return false;
      if (linguagem && projetos[chave]?.linguagem !== linguagem) return false;
      if (!termo) return true;
      return normalizar(
        `${i.titulo} ${i.repositorio} ${i.etiquetas
          .map((e) => e.nome)
          .join(" ")}`
      ).includes(termo);
    });

    return [...filtradas].sort((a, b) => {
      if (ordenacao === "comentarios") {
        return a.comentarios - b.comentarios;
      }
      const campo = ordenacao === "recentes" ? "criadaEm" : "atualizadaEm";
      return new Date(b[campo]).getTime() - new Date(a[campo]).getTime();
    });
  }, [issues, projetos, pesquisa, tipo, projeto, linguagem, ordenacao]);

  if (issues.length === 0) {
    return (
      <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
        Neste momento não há issues abertas à procura de ajuda nos projetos do
        diretório. Volta mais tarde!
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2 lg:col-span-4">
          <span className="sr-only">Pesquisar issues</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar issues"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoIssue | "")}
            className={campoClassName}
          >
            <option value="">Todos os tipos</option>
            <option value="primeira">Boas primeiras issues</option>
            <option value="ajuda">Pedem ajuda</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Filtrar por projeto</span>
          <select
            value={projeto}
            onChange={(e) => setProjeto(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todos os projetos</option>
            {projetosComIssues.map((p) => (
              <option key={p.chave} value={p.chave}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filtrar por linguagem</span>
          <select
            value={linguagem}
            onChange={(e) => setLinguagem(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todas as linguagens</option>
            {linguagens.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Ordenar</span>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className={campoClassName}
          >
            <option value="atualizadas">Atualizadas recentemente</option>
            <option value="recentes">Mais recentes</option>
            <option value="comentarios">Menos comentários</option>
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-light-gray-6" aria-live="polite">
        {visiveis.length === 1 ? "1 issue" : `${visiveis.length} issues`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhuma issue corresponde à pesquisa.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visiveis.map((i) => (
            <CartaoIssue
              key={i.url}
              issue={i}
              projeto={projetoDe(i)}
              atualizadoEm={atualizadoEm}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CartaoIssue({
  issue: i,
  projeto,
  atualizadoEm,
}: {
  issue: Issue;
  projeto: ResumoProjeto | undefined;
  atualizadoEm: string;
}) {
  const [dono, nome] = i.repositorio.split("/");

  return (
    <li className="flex gap-3 rounded-xl border border-light-gray-2 bg-white/60 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={projeto?.avatar ?? `https://github.com/${dono}.png?size=80`}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        className="h-10 w-10 shrink-0 rounded-md border border-light-gray-2"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-light-gray-6">
          <a
            href={projeto?.url ?? `https://github.com/${i.repositorio}`}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words hover:underline focus:underline"
          >
            {dono}/<span className="font-bold text-light-gray-8">{nome}</span>
          </a>
          {projeto?.linguagem && (
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full border border-light-gray-2"
                style={{ backgroundColor: projeto.corLinguagem ?? undefined }}
              />
              {projeto.linguagem}
            </span>
          )}
          <span
            className={clsx(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              i.tipo === "primeira"
                ? "border-light-green-2 bg-light-green-0 text-light-green-8"
                : "border-light-purple-2 bg-light-purple-0 text-light-purple-8"
            )}
          >
            {NOMES_TIPO[i.tipo]}
          </span>
        </div>

        <a
          href={i.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-2 flex items-start gap-2 font-bold hover:underline focus:underline sm:text-lg"
        >
          <IssueOpenedIcon className="mt-1 shrink-0 fill-light-green-6" />
          <span className="break-words">
            {i.titulo}{" "}
            <span className="font-normal text-light-gray-5">#{i.numero}</span>
          </span>
        </a>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-light-gray-6">
          {i.etiquetas.length > 0 && (
            <ul className="flex flex-wrap gap-1">
              {i.etiquetas.map((e) => (
                <li key={e.nome}>
                  <ChipEtiqueta etiqueta={e} />
                </li>
              ))}
            </ul>
          )}
          <span
            className="flex items-center gap-1"
            title={`${i.comentarios} comentários`}
          >
            <CommentIcon className="fill-light-gray-6" />
            {i.comentarios}
            <span className="sr-only">comentários</span>
          </span>
          <span>Aberta {tempoDesde(i.criadaEm, atualizadoEm)}</span>
        </div>
      </div>
    </li>
  );
}

/** Etiqueta com a cor definida no GitHub e texto legível por cima. */
function ChipEtiqueta({ etiqueta }: { etiqueta: Etiqueta }) {
  const cor = /^[0-9a-f]{6}$/i.test(etiqueta.cor) ? etiqueta.cor : "d0d7de";
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(cor.slice(k, k + 2), 16));
  const clara = (r * 299 + g * 587 + b * 114) / 1000 > 150;

  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `#${cor}`,
        color: clara ? "#1f2328" : "#ffffff",
      }}
    >
      {etiqueta.nome}
    </span>
  );
}
