import {
  CommentIcon,
  HeartIcon,
  PencilIcon,
  RssIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao, urlAbsoluto } from "@/lib/seo";
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
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl">
      <header className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Artigos
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Textos escritos pela comunidade sobre programação, open source e a
            vida de quem faz software em Portugal. Tens algo para partilhar?
            Escreve um artigo e abre um pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href="/artigos/feed.xml"
            title="Segue os artigos novos no teu leitor de RSS"
            className="flex items-center justify-center gap-2 rounded-md border border-light-gray-3 px-4 py-2 text-sm font-bold hover:bg-light-gray-1 sm:text-base"
          >
            <RssIcon className="fill-light-black" />
            RSS
          </a>
          <a
            href={escrever}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-light-black px-4 py-2 text-sm font-bold text-light-gray-0 hover:opacity-90 sm:text-base"
          >
            <PencilIcon className="fill-current" />
            Escrever um artigo
          </a>
        </div>
      </header>

      <section aria-labelledby="artigos-comunidade" className="mb-12">
        <h2
          id="artigos-comunidade"
          className="mb-4 text-xl font-extrabold sm:text-2xl"
        >
          Da comunidade
        </h2>

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
          <ul className="flex flex-col gap-3 sm:gap-4">
            {artigos.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/artigos/${a.slug}`}
                  className="group block rounded-xl border border-light-gray-2 bg-white/60 p-4 hover:border-light-gray-4 focus:border-light-gray-4 sm:p-5"
                >
                  <p className="mb-1 flex flex-wrap items-center gap-x-2 text-sm text-light-gray-6">
                    <time dateTime={a.data}>{formatarData(a.data)}</time>
                    <span aria-hidden>·</span>
                    <span>{a.minutos} min de leitura</span>
                    <span aria-hidden>·</span>
                    <span>{a.autor ? `@${a.autor}` : EQUIPA}</span>
                  </p>
                  <h3 className="mb-1 text-lg font-extrabold group-hover:underline sm:text-xl">
                    {a.titulo}
                  </h3>
                  <p className="text-sm text-light-gray-7 sm:text-base">
                    {a.descricao}
                  </p>
                  {a.etiquetas.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {a.etiquetas.map((e) => (
                        <li
                          key={e}
                          className="rounded-full bg-light-gray-1 px-2 py-0.5 text-xs font-medium text-light-gray-7"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="artigos-devto">
        <h2
          id="artigos-devto"
          className="mb-1 text-xl font-extrabold sm:text-2xl"
        >
          No dev.to
        </h2>
        <p className="mb-4 text-sm text-light-gray-7 sm:text-base">
          Publicações recentes no dev.to com as etiquetas{" "}
          {ETIQUETAS_DEVTO.map((t, i) => (
            <span key={t}>
              {i > 0 && (i === ETIQUETAS_DEVTO.length - 1 ? " e " : ", ")}
              <a
                href={`https://dev.to/t/${t}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                #{t}
              </a>
            </span>
          ))}
          . Publica no dev.to com a etiqueta <strong>#githubportugal</strong> e
          o teu artigo aparece aqui sozinho.
        </p>

        {devto.artigos.length === 0 ? (
          <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            {devto.disponivel
              ? "Ainda não há publicações com estas etiquetas."
              : "Não foi possível carregar os artigos do dev.to. Volta a tentar mais tarde."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {devto.artigos.map((a) => (
              <li
                key={a.id}
                className="flex flex-col rounded-xl border border-light-gray-2 bg-white/60 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.autor.avatar}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="h-8 w-8 shrink-0 rounded-full border border-light-gray-2"
                  />
                  <p className="min-w-0 text-sm">
                    <a
                      href={`https://dev.to/${a.autor.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate font-bold hover:underline focus:underline"
                    >
                      {a.autor.nome}
                    </a>
                    <time
                      dateTime={a.publicadoEm}
                      className="block text-light-gray-6"
                    >
                      {formatarData(a.publicadoEm)}
                    </time>
                  </p>
                </div>
                <h3 className="mb-1 font-extrabold">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline focus:underline"
                  >
                    {a.titulo}
                  </a>
                </h3>
                {a.descricao && (
                  <p className="mb-3 line-clamp-3 text-sm text-light-gray-7">
                    {a.descricao}
                  </p>
                )}
                <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-light-gray-6">
                  <span>{a.minutos} min</span>
                  <span className="flex items-center gap-1">
                    <HeartIcon size={12} className="fill-light-gray-6" />
                    {a.reacoes}
                    <span className="sr-only">reações</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CommentIcon size={12} className="fill-light-gray-6" />
                    {a.comentarios}
                    <span className="sr-only">comentários</span>
                  </span>
                  {a.etiquetas.slice(0, 4).map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </p>
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
