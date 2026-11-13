"use client";

import { IssueOpenedIcon, SearchIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { normalizar } from "@/lib/formatar";
import type { Issue, TipoIssue } from "@/lib/issues";

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
  /** Já não é mostrado; fica para compatibilidade. */
  atualizadoEm?: string;
};

const campoClassName =
  "min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

const NOMES_TIPO: Record<TipoIssue, string> = {
  primeira: "good first issue",
  ajuda: "help wanted",
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
  projetoInicial = "",
  tipoInicial = "",
}: Props & { projetoInicial?: string; tipoInicial?: TipoIssue | "" }) {
  const [pesquisa, setPesquisa] = useState("");
  const [tipo, setTipo] = useState<TipoIssue | "">(tipoInicial);
  const [projeto, setProjeto] = useState(projetoInicial);
  const [linguagem, setLinguagem] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("atualizadas");


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

  const chip = (ativo: boolean) =>
    clsx(
      "inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
      ativo
        ? "border-marca-verde bg-marca-verde/10"
        : "border-light-gray-3 hover:bg-light-gray-1"
    );
  const tipos: { id: TipoIssue | ""; nome: string }[] = [
    { id: "", nome: "Todas" },
    { id: "primeira", nome: NOMES_TIPO.primeira },
    { id: "ajuda", nome: NOMES_TIPO.ajuda },
  ];

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Procurar issues</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Procurar"
            className={clsx(campoClassName, "pl-9")}
          />
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

      <div role="group" aria-label="Tipo" className="mb-6 flex flex-wrap gap-2">
        {tipos.map((t) => (
          <button
            key={t.id || "todas"}
            type="button"
            aria-pressed={tipo === t.id}
            onClick={() => setTipo(t.id)}
            className={chip(tipo === t.id)}
          >
            {t.nome}
            <span className="font-mono text-light-gray-6">
              {t.id
                ? issues.filter((i) => i.tipo === t.id).length
                : issues.length}
            </span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visiveis.length === 1 ? "1 issue" : `${visiveis.length} issues`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhuma issue corresponde à pesquisa.
        </p>
      ) : (
        <ul className="divide-y divide-light-gray-2 overflow-hidden rounded-xl border border-light-gray-2 bg-white/60">
          {visiveis.map((i) => (
            <LinhaIssue key={i.url} issue={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LinhaIssue({ issue: i }: { issue: Issue }) {
  return (
    <li>
      <a
        href={i.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 px-4 py-4 hover:bg-white sm:px-5"
      >
        <IssueOpenedIcon className="shrink-0 fill-marca-verde" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="break-words font-semibold">{i.titulo}</span>
          <span className="truncate font-mono text-xs text-light-gray-6">
            {i.repositorio}#{i.numero}
          </span>
        </span>
        <span className="hidden shrink-0 rounded-full bg-marca-verde/10 px-2.5 py-0.5 font-mono text-xs text-marca-verde sm:inline">
          {NOMES_TIPO[i.tipo]}
        </span>
      </a>
    </li>
  );
}
