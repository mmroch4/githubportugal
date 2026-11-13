import { LinkExternalIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { ID_WEBSITE, metadadosPagina, migalhas, urlAbsoluto } from "@/lib/seo";
import { notFound } from "next/navigation";
import { CartaoProjeto } from "@/components/CartaoProjeto";
import { caminhoMantenedor, formatoNumero } from "@/lib/formatar";
import { listarLogins, obterMantenedor } from "@/lib/mantenedores";
import { obterRanking } from "@/lib/ranking";

export const revalidate = 21600;
// Só existem páginas para quem está em data/mantenedores.yml.
export const dynamicParams = false;

type Props = { params: Promise<{ login: string }> };

export async function generateStaticParams() {
  const logins = await listarLogins();
  return logins.map((login) => ({ login: login.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { login } = await params;
  const m = await obterMantenedor(login);
  if (!m) return {};

  const title = m.nome === m.login ? m.login : `${m.nome} (@${m.login})`;
  const description =
    m.bio ??
    `Projetos open source mantidos por ${m.nome} no diretório do GitHub Portugal.`;

  return metadadosPagina({
    titulo: title,
    descricao: description,
    caminho: caminhoMantenedor(m.login),
    tipo: "profile",
    imagens: [m.avatar],
    openGraph: { username: m.login },
  });
}

export default async function PerfilMantenedor({ params }: Props) {
  const { login } = await params;
  const [m, ranking] = await Promise.all([
    obterMantenedor(login),
    obterRanking(),
  ]);
  if (!m) notFound();

  const chave = Object.keys(ranking.pessoas).find(
    (l) => l.toLowerCase() === m.login.toLowerCase()
  );
  const noRanking = chave ? ranking.pessoas[chave] : undefined;
  const posicao = chave
    ? ranking.listas.pais.contribuicoes.indexOf(chave) + 1
    : 0;
  const inteiro = new Intl.NumberFormat("pt-PT", { useGrouping: "always" });

  const numeros = [
    posicao > 0 && { valor: `#${posicao}`, rotulo: "no ranking" },
    noRanking && {
      valor: inteiro.format(noRanking.contribuicoes),
      rotulo: "contribuições",
    },
    m.seguidores !== null && {
      valor: inteiro.format(m.seguidores),
      rotulo: "seguidores",
    },
    m.estrelas > 0 && {
      valor: formatoNumero.format(m.estrelas),
      rotulo: "estrelas nos projetos",
    },
  ].filter((n): n is { valor: string; rotulo: string } => Boolean(n));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/mantenedores"
        className="mb-6 inline-block font-mono text-sm text-marca-verde hover:underline"
      >
        ← pessoas
      </Link>

      <header className="mb-6 overflow-hidden rounded-2xl border border-light-gray-2 bg-white/60">
        {/* Capa com as cores do logótipo. */}
        <div
          aria-hidden="true"
          className="h-28 sm:h-36"
          style={{
            backgroundImage:
              "linear-gradient(110deg, hsl(var(--marca-verde) / 0.45), transparent 55%, hsl(var(--marca-vermelho) / 0.35))",
          }}
        />
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex min-w-0 items-end gap-4 sm:-mt-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.avatar}
              alt=""
              width={112}
              height={112}
              className="h-24 w-24 shrink-0 rounded-full border-4 border-white bg-white sm:h-28 sm:w-28"
            />
            <div className="min-w-0 pb-1">
              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">
                {m.nome}
              </h1>
              <p className="truncate font-mono text-sm text-light-gray-6">
                @{m.login}
                {m.localizacao && ` · ${m.localizacao}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {m.site && (
              <a
                href={m.site}
                target="_blank"
                rel="noopener noreferrer"
                className="botao-secundario"
              >
                Site
              </a>
            )}
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-secundario"
            >
              Ver no GitHub
              <LinkExternalIcon className="fill-current" />
            </a>
          </div>
        </div>
      </header>

      {numeros.length > 0 && (
        <dl className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {numeros.map((n) => (
            <div
              key={n.rotulo}
              className="flex flex-col-reverse gap-1 rounded-xl border border-light-gray-2 p-5"
            >
              <dt className="text-sm text-light-gray-6">{n.rotulo}</dt>
              <dd className="font-mono text-2xl font-bold tabular-nums">
                {n.valor}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <section aria-labelledby="projetos">
        <h2 id="projetos" className="etiqueta mb-4">
          {"// projetos"}
        </h2>

        {m.projetos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            Ainda sem projetos no{" "}
            <Link href="/projetos" className="font-medium underline">
              diretório
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {m.projetos.map((p) => (
              <CartaoProjeto key={p.repositorio} projeto={p} />
            ))}
          </ul>
        )}
      </section>
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfilePage",
              "@id": `${urlAbsoluto(caminhoMantenedor(m.login))}#pagina`,
              url: urlAbsoluto(caminhoMantenedor(m.login)),
              inLanguage: "pt-PT",
              isPartOf: { "@id": ID_WEBSITE },
              breadcrumb: migalhas([
                { nome: "Mantenedores", caminho: "/mantenedores" },
                { nome: m.nome, caminho: caminhoMantenedor(m.login) },
              ]),
              mainEntity: {
                "@type": "Person",
                name: m.nome,
                alternateName: m.login,
                identifier: m.login,
                image: m.avatar,
                url: urlAbsoluto(caminhoMantenedor(m.login)),
                sameAs: [m.url, ...(m.site ? [m.site] : [])],
                ...(m.bio ? { description: m.bio } : {}),
                ...(m.localizacao ? { homeLocation: m.localizacao } : {}),
                ...(m.empresa ? { worksFor: m.empresa } : {}),
                ...(m.seguidores !== null
                  ? {
                      interactionStatistic: {
                        "@type": "InteractionCounter",
                        interactionType: "https://schema.org/FollowAction",
                        userInteractionCount: m.seguidores,
                      },
                    }
                  : {}),
                owns: m.projetos.map((p) => ({
                  "@type": "SoftwareSourceCode",
                  name: p.nome,
                  description: p.descricao,
                  codeRepository: p.url,
                  ...(p.linguagem ? { programmingLanguage: p.linguagem } : {}),
                })),
              },
            },
          ],
        }}
      />
    </main>
  );
}
