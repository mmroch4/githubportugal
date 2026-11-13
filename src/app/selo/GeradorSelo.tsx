"use client";

import { AlertIcon, CheckIcon, CopyIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { useId, useMemo, useState } from "react";
import { links } from "@/config/metadata";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import {
  FICHEIROS_SELO,
  TAMANHOS_SELO,
  TEXTO_ALTERNATIVO_SELO,
  urlDestinoSelo,
  urlSelo,
} from "@/lib/selo";

type Estilo = "plano" | "cartao";

/** Aceita `dono/nome`, `github.com/dono/nome` ou o URL completo do repositório. */
function normalizarRepositorio(texto: string) {
  const limpo = texto
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^(www\.)?github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "");
  const partes = limpo.split("/");
  if (partes.length < 2 || !partes[0] || !partes[1]) return "";
  return `${partes[0]}/${partes[1]}`;
}

function codigoMarkdown(destino: string) {
  return `[![${TEXTO_ALTERNATIVO_SELO}](${urlSelo("plano")})](${destino})`;
}

function codigoHtmlPlano(destino: string) {
  const { largura, altura } = TAMANHOS_SELO.plano;
  return `<a href="${destino}"><img src="${urlSelo(
    "plano"
  )}" alt="${TEXTO_ALTERNATIVO_SELO}" width="${largura}" height="${altura}"></a>`;
}

function codigoHtmlCartao(destino: string) {
  const { largura, altura } = TAMANHOS_SELO.claro;
  return `<a href="${destino}">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${urlSelo("escuro")}">
    <img src="${urlSelo(
      "claro"
    )}" alt="${TEXTO_ALTERNATIVO_SELO}" width="${largura}" height="${altura}">
  </picture>
</a>`;
}

function BlocoCodigo({ titulo, codigo }: { titulo: string; codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem acesso à área de transferência: o código continua visível para copiar à mão.
    }
  }

  return (
    <div className="rounded-xl border border-light-gray-2 bg-white/60">
      <div className="flex items-center justify-between border-b border-light-gray-2 px-3 py-2">
        <span className="font-mono text-xs lowercase text-light-gray-6">
          {titulo}
        </span>
        <button
          type="button"
          onClick={copiar}
          className="flex min-h-[32px] items-center gap-1.5 rounded-lg border border-light-gray-3 px-3 text-xs font-semibold hover:bg-light-gray-1 focus:bg-light-gray-1"
        >
          {copiado ? (
            <CheckIcon size={14} className="fill-light-green-6" />
          ) : (
            <CopyIcon size={14} className="fill-light-black" />
          )}
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-all p-4 font-mono text-xs leading-relaxed text-light-gray-8 sm:text-[13px]">
        <code>{codigo}</code>
      </pre>
    </div>
  );
}

export function GeradorSelo({ repositorios }: { repositorios: string[] }) {
  const [texto, setTexto] = useState("");
  const [estilo, setEstilo] = useState<Estilo>("plano");
  useFiltrosNoUrl({ repositorio: [texto, setTexto] });
  const idCampo = useId();
  const idLista = useId();

  const indice = useMemo(
    () => new Map(repositorios.map((r) => [r.toLowerCase(), r])),
    [repositorios]
  );

  const normalizado = normalizarRepositorio(texto);
  // Usa a grafia do diretório, para o link abrir a entrada certa.
  const repositorio = indice.get(normalizado.toLowerCase()) ?? normalizado;
  const noDiretorio = indice.has(normalizado.toLowerCase());
  const destino = urlDestinoSelo(repositorio || undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-light-gray-2 bg-white/60 p-4 sm:flex-row sm:items-end">
        <label htmlFor={idCampo} className="flex flex-1 flex-col gap-1.5">
          <span className="font-mono text-xs text-light-gray-6">repositório</span>
          <input
            id={idCampo}
            list={idLista}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="dono/nome-do-repositorio"
            autoComplete="off"
            spellCheck={false}
            className="min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-light-gray-0 px-3 py-2 font-mono text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde"
          />
          <datalist id={idLista}>
            {repositorios.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-mono text-xs text-light-gray-6">estilo</legend>
          <div className="flex rounded-lg border border-light-gray-3 p-1">
            {(
              [
                ["plano", "Pequeno"],
                ["cartao", "Cartão"],
              ] as const
            ).map(([valor, nome]) => (
              <label
                key={valor}
                className={clsx(
                  "cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold",
                  estilo === valor
                    ? "bg-marca-verde/15 text-marca-verde"
                    : "hover:bg-light-gray-1"
                )}
              >
                <input
                  type="radio"
                  name="estilo"
                  value={valor}
                  checked={estilo === valor}
                  onChange={() => setEstilo(valor)}
                  className="sr-only"
                />
                {nome}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {normalizado && !noDiretorio && (
        <p className="flex items-start gap-2 rounded-md border border-light-yellow-2 bg-light-yellow-0 p-3 text-sm text-light-yellow-8">
          <AlertIcon className="mt-0.5 shrink-0 fill-light-yellow-8" />
          <span>
            <strong>{normalizado}</strong> ainda não está no diretório.{" "}
            <a
              href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              Adiciona-o primeiro
            </a>
            .
          </span>
        </p>
      )}

      <section aria-labelledby="pre-visualizacao">
        <h2 id="pre-visualizacao" className="etiqueta mb-3">
          {"// pré-visualização"}
        </h2>
        <div className="flex flex-wrap gap-3">
          {estilo === "plano" ? (
            <>
              <Previsualizacao fundo="claro" variante="plano" />
              <Previsualizacao fundo="escuro" variante="plano" />
            </>
          ) : (
            <>
              <Previsualizacao fundo="claro" variante="claro" />
              <Previsualizacao fundo="escuro" variante="escuro" />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="codigo" className="flex flex-col gap-3">
        <h2 id="codigo" className="etiqueta">
          {"// código para o README"}
        </h2>
        {estilo === "plano" ? (
          <>
            <BlocoCodigo titulo="Markdown" codigo={codigoMarkdown(destino)} />
            <BlocoCodigo titulo="HTML" codigo={codigoHtmlPlano(destino)} />
          </>
        ) : (
          <BlocoCodigo titulo="HTML" codigo={codigoHtmlCartao(destino)} />
        )}
      </section>
    </div>
  );
}

function Previsualizacao({
  fundo,
  variante,
}: {
  fundo: "claro" | "escuro";
  variante: keyof typeof FICHEIROS_SELO;
}) {
  const { largura, altura } = TAMANHOS_SELO[variante];
  return (
    <figure
      className={clsx(
        "flex flex-col items-center gap-2 rounded-md border px-6 py-5",
        // Cores fixas: mostram o README num GitHub claro e escuro,
        // seja qual for o tema do site.
        fundo === "claro"
          ? "border-[#d0d7de] bg-[#ffffff] text-[#59636e]"
          : "border-[#3d444d] bg-[#0d1117] text-[#9198a1]"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/selo/${FICHEIROS_SELO[variante]}`}
        alt={TEXTO_ALTERNATIVO_SELO}
        width={largura}
        height={altura}
      />
      <figcaption className="text-xs">
        GitHub {fundo === "claro" ? "claro" : "escuro"}
      </figcaption>
    </figure>
  );
}
