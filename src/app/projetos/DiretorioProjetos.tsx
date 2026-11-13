"use client";

import { SearchIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { CartaoProjeto } from "@/components/CartaoProjeto";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import { normalizar } from "@/lib/formatar";
import type { ResumoMantenedor } from "@/lib/mantenedores";
import type { Projeto } from "@/lib/projetos";

type Ordenacao = "estrelas" | "atividade" | "nome";

const campoClassName =
  "min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

export function DiretorioProjetos({
  projetos,
  categorias,
  mantenedoresPorProjeto,
  issuesPorProjeto,
}: {
  projetos: Projeto[];
  categorias: string[];
  mantenedoresPorProjeto: Record<string, ResumoMantenedor[]>;
  issuesPorProjeto: Record<string, number>;
}) {
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState("");
  const [linguagem, setLinguagem] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("estrelas");

  useFiltrosNoUrl({
    q: [pesquisa, setPesquisa],
    categoria: [categoria, setCategoria],
    linguagem: [linguagem, setLinguagem],
    ordem: [
      ordenacao === "estrelas" ? "" : ordenacao,
      (v) => setOrdenacao(v === "atividade" || v === "nome" ? v : "estrelas"),
    ],
  });

  const linguagens = useMemo(
    () =>
      Array.from(
        new Set(projetos.map((p) => p.linguagem).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b, "pt-PT")),
    [projetos]
  );

  const categoriasUsadas = useMemo(
    () => categorias.filter((c) => projetos.some((p) => p.categoria === c)),
    [categorias, projetos]
  );

  const visiveis = useMemo(() => {
    const termo = normalizar(pesquisa.trim());

    const filtrados = projetos.filter((p) => {
      if (categoria && p.categoria !== categoria) return false;
      if (linguagem && p.linguagem !== linguagem) return false;
      if (!termo) return true;
      return normalizar(
        `${p.repositorio} ${p.descricao} ${p.linguagem ?? ""} ${p.categoria} ${(
          mantenedoresPorProjeto[p.repositorio.toLowerCase()] ?? []
        )
          .map((m) => m.login)
          .join(" ")}`
      ).includes(termo);
    });

    return [...filtrados].sort((a, b) => {
      if (ordenacao === "nome") {
        return a.nome.localeCompare(b.nome, "pt-PT");
      }
      if (ordenacao === "atividade") {
        return (
          new Date(b.ultimaAtividade ?? 0).getTime() -
          new Date(a.ultimaAtividade ?? 0).getTime()
        );
      }
      return (b.estrelas ?? -1) - (a.estrelas ?? -1);
    });
  }, [
    projetos,
    pesquisa,
    categoria,
    linguagem,
    ordenacao,
    mantenedoresPorProjeto,
  ]);

  const contagemCategoria = (c: string) =>
    projetos.filter((p) => p.categoria === c).length;
  const chip = (ativo: boolean) =>
    clsx(
      "inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
      ativo
        ? "border-marca-verde bg-marca-verde/10"
        : "border-light-gray-3 hover:bg-light-gray-1"
    );

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Procurar projetos</span>
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
            <option value="estrelas">Mais estrelas</option>
            <option value="atividade">Atividade recente</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </label>
      </div>

      <div
        role="group"
        aria-label="Categoria"
        className="mb-6 flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={categoria === ""}
          onClick={() => setCategoria("")}
          className={chip(categoria === "")}
        >
          Todos
          <span className="font-mono text-light-gray-6">{projetos.length}</span>
        </button>
        {categoriasUsadas.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={categoria === c}
            onClick={() => setCategoria(categoria === c ? "" : c)}
            className={chip(categoria === c)}
          >
            {c}
            <span className="font-mono text-light-gray-6">
              {contagemCategoria(c)}
            </span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visiveis.length === 1 ? "1 projeto" : `${visiveis.length} projetos`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhum projeto corresponde à pesquisa.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p) => (
            <CartaoProjeto
              key={p.repositorio}
              projeto={p}
              mantenedores={mantenedoresPorProjeto[p.repositorio.toLowerCase()]}
              issuesAbertas={issuesPorProjeto[p.repositorio.toLowerCase()]}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
