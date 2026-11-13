import { MarkGithubIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { links } from "@/config/metadata";
import { EQUIPA, formatarData, lerArtigos, obterArtigo } from "@/lib/artigos";
import { caminhoMantenedor } from "@/lib/formatar";
import { listarLogins } from "@/lib/mantenedores";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import {
  ID_ORGANIZACAO,
  ID_WEBSITE,
  metadadosPagina,
  migalhas,
  urlAbsoluto,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const artigos = await lerArtigos();
  return artigos.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await obterArtigo(slug);
  if (!artigo) return {};

  return metadadosPagina({
    titulo: artigo.titulo,
    descricao: artigo.descricao,
    caminho: `/artigos/${slug}`,
    tipo: "article",
    openGraph: {
      publishedTime: artigo.data,
      modifiedTime: artigo.atualizado ?? undefined,
      authors: [artigo.autor ? `https://github.com/${artigo.autor}` : EQUIPA],
      tags: artigo.etiquetas,
    },
    extra: {
      authors: [
        artigo.autor
          ? { name: artigo.autor, url: `https://github.com/${artigo.autor}` }
          : { name: EQUIPA },
      ],
      keywords: artigo.etiquetas,
    },
  });
}

export default async function PaginaArtigo({ params }: Props) {
  const { slug } = await params;
  const artigo = await obterArtigo(slug);
  if (!artigo) notFound();

  const [{ default: Conteudo }, mantenedores] = await Promise.all([
    import(`@/content/artigos/${slug}.mdx`),
    listarLogins(),
  ]);
  const autorEhMantenedor =
    artigo.autor !== null &&
    mantenedores.some((l) => l.toLowerCase() === artigo.autor!.toLowerCase());
  const editar = `${links.repository}/blob/main/src/content/artigos/${slug}.mdx`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/artigos"
        className="mb-6 inline-block font-mono text-sm text-light-gray-6 hover:text-marca-verde"
      >
        ← artigos
      </Link>

      <header className="mb-6 sm:mb-8">
        <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-5xl">
          {artigo.titulo}
        </h1>
        <p className="mb-5 text-base text-light-gray-7 sm:text-lg">
          {artigo.descricao}
        </p>

        <div className="flex items-center gap-3">
          {artigo.autor && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://github.com/${artigo.autor}.png?size=96`}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full border border-light-gray-2"
            />
          )}
          <div className="text-sm sm:text-base">
            <p className="font-bold">
              {artigo.autor ? (
                autorEhMantenedor ? (
                  <Link
                    href={caminhoMantenedor(artigo.autor)}
                    className="hover:underline focus:underline"
                  >
                    @{artigo.autor}
                  </Link>
                ) : (
                  <a
                    href={`https://github.com/${artigo.autor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline focus:underline"
                  >
                    @{artigo.autor}
                  </a>
                )
              ) : (
                EQUIPA
              )}
            </p>
            <p className="font-mono text-xs text-light-gray-6">
              <time dateTime={artigo.data}>{formatarData(artigo.data)}</time>
              {" · "}
              {artigo.minutos} min
              {artigo.atualizado && (
                <>
                  {" · atualizado a "}
                  <time dateTime={artigo.atualizado}>
                    {formatarData(artigo.atualizado)}
                  </time>
                </>
              )}
            </p>
          </div>
        </div>

        {artigo.etiquetas.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {artigo.etiquetas.map((e) => (
              <li
                key={e}
                className="rounded-full bg-light-gray-1 px-2 py-0.5 text-xs font-medium text-light-gray-7 sm:text-sm"
              >
                {e}
              </li>
            ))}
          </ul>
        )}
      </header>

      <article className="space-y-3 sm:space-y-4">
        <Conteudo />
      </article>

      <footer className="mt-10 flex flex-col gap-3 border-t border-t-light-gray-2 pt-6 text-sm text-light-gray-7 sm:flex-row sm:items-center sm:justify-between sm:text-base">
        <p>
          Encontraste um erro?{" "}
          <a
            href={editar}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold hover:underline focus:underline"
          >
            <MarkGithubIcon className="fill-light-black" />
            Propõe uma correção
          </a>
        </p>
        <Link href="/artigos" className="font-bold hover:underline">
          Ver todos os artigos
        </Link>
      </footer>
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${urlAbsoluto(`/artigos/${slug}`)}#artigo`,
              mainEntityOfPage: urlAbsoluto(`/artigos/${slug}`),
              url: urlAbsoluto(`/artigos/${slug}`),
              headline: artigo.titulo,
              description: artigo.descricao,
              datePublished: artigo.data,
              dateModified: artigo.atualizado ?? artigo.data,
              inLanguage: "pt-PT",
              keywords: artigo.etiquetas.join(", "),
              timeRequired: `PT${artigo.minutos}M`,
              image: urlAbsoluto("/opengraph-image"),
              author: artigo.autor
                ? {
                    "@type": "Person",
                    name: artigo.autor,
                    url: autorEhMantenedor
                      ? urlAbsoluto(caminhoMantenedor(artigo.autor))
                      : `https://github.com/${artigo.autor}`,
                    sameAs: [`https://github.com/${artigo.autor}`],
                  }
                : { "@id": ID_ORGANIZACAO },
              publisher: { "@id": ID_ORGANIZACAO },
              isPartOf: { "@id": ID_WEBSITE },
            },
            migalhas([
              { nome: "Artigos", caminho: "/artigos" },
              { nome: artigo.titulo, caminho: `/artigos/${slug}` },
            ]),
          ],
        }}
      />
    </main>
  );
}
