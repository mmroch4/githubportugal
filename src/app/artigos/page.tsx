import { HeartIcon, PencilIcon, RssIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao, urlAbsoluto } from "@/lib/seo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
import { EQUIPA, formatarData, lerArtigos } from "@/lib/artigos";
import { ETIQUETAS_DEVTO, obterArtigosDevTo } from "@/lib/devto";

// Volta a gerar a página de 6 em 6 horas, para mostrar os artigos novos do dev.to.
export const revalidate = 21600;

const description =
  "Artigos escritos pela comunidade GitHub Portugal e publicações de programadores portugueses no dev.to.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Artigos da comunidade",
  descricao: description,
  caminho: "/artigos",
  alternates: { types: { "application/rss+xml": "/artigos/feed.xml" } },
});

const linkClassName =
  "font-medium text-marca-verde hover:underline focus:underline";

export default async function Artigos() {
  const [artigos, devto] = await Promise.all([
    lerArtigos(),
    obterArtigosDevTo(),
  ]);
  const escrever = `${links.repository}/blob/main/CONTRIBUTING.md#escrever-um-artigo`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina etiqueta="da comunidade" titulo="Artigos">
        <a
          href="/artigos/feed.xml"
          title="Segue os artigos novos no teu leitor de RSS"
          className="botao-secundario"
        >
          <RssIcon className="fill-current" />
          RSS
        </a>
        <a
          href={escrever}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-primario"
        >
          <PencilIcon className="fill-current" />
          Escrever um artigo
        </a>
      </CabecalhoPagina>

      <section aria-label="Artigos da comunidade" className="mb-12">
        {artigos.length === 0 ? (
          <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            Ainda não há artigos.{" "}
            <a
              href={escrever}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              Escreve o primeiro
            </a>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {artigos.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/artigos/${a.slug}`}
                  title={a.descricao}
                  className="group flex flex-col gap-1.5 rounded-xl border border-light-gray-2 bg-white/60 p-4 transition hover:bg-white sm:px-5"
                >
                  <span className="text-lg font-semibold group-hover:underline">
                    {a.titulo}
                  </span>
                  <span className="font-mono text-xs text-light-gray-6">
                    <time dateTime={a.data}>{formatarData(a.data)}</time>
                    {" · "}
                    {a.minutos} min{" · "}
                    {a.autor ? `@${a.autor}` : EQUIPA}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="artigos-devto">
        <h2 id="artigos-devto" className="etiqueta mb-4">
          {"// no dev.to "}
          <span className="text-light-gray-6">
            {ETIQUETAS_DEVTO.map((t) => `#${t}`).join(" ")}
          </span>
        </h2>

        {devto.artigos.length === 0 ? (
          <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            {devto.disponivel
              ? "Ainda não há publicações com estas etiquetas."
              : "Não foi possível carregar os artigos do dev.to."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {devto.artigos.map((a) => (
              <li key={a.id} className="min-w-0">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={a.descricao ?? undefined}
                  className="flex h-full items-start gap-3 rounded-xl border border-light-gray-2 bg-white/60 p-4 transition hover:bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.autor.avatar}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="h-8 w-8 shrink-0 rounded-full border border-light-gray-2"
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-semibold">{a.titulo}</span>
                    <span className="truncate font-mono text-xs text-light-gray-6">
                      {a.autor.nome} · {a.minutos} min ·{" "}
                      <HeartIcon size={12} className="fill-light-gray-6" />{" "}
                      {a.reacoes}
                      <span className="sr-only"> reações</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Artigos da comunidade",
          descricao: description,
          caminho: "/artigos",
          tipo: "Blog",
          itens: artigos.map((a) => ({
            "@type": "BlogPosting",
            headline: a.titulo,
            description: a.descricao,
            url: urlAbsoluto(`/artigos/${a.slug}`),
            datePublished: a.data,
            ...(a.atualizado ? { dateModified: a.atualizado } : {}),
            inLanguage: "pt-PT",
          })),
        })}
      />
    </main>
  );
}
