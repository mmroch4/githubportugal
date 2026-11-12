import {
  LinkIcon,
  LocationIcon,
  MarkGithubIcon,
  OrganizationIcon,
  PeopleIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { ID_WEBSITE, metadadosPagina, migalhas, urlAbsoluto } from "@/lib/seo";
import { notFound } from "next/navigation";
import { CartaoProjeto } from "@/components/CartaoProjeto";
import { caminhoMantenedor, formatoNumero } from "@/lib/formatar";
import { listarLogins, obterMantenedor } from "@/lib/mantenedores";

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
  const m = await obterMantenedor(login);
  if (!m) notFound();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <nav
        aria-label="Migalhas"
        className="mb-4 font-mono text-sm text-light-gray-6"
      >
        <Link href="/mantenedores" className="hover:text-light-black">
          Mantenedores
        </Link>
        <span className="mx-2 text-light-gray-4">/</span>
        <span className="text-light-black">{m.login}</span>
      </nav>

      <header className="mb-10 overflow-hidden rounded-xl border border-light-gray-2 bg-white/60">
        {/* Capa com as cores da marca e uma grelha subtil. */}
        <div
          aria-hidden="true"
          className="h-24 sm:h-32"
          style={{
            backgroundImage:
              "linear-gradient(90deg, hsl(var(--marca-verde) / 0.35), transparent 50%, hsl(var(--marca-vermelho) / 0.3)), linear-gradient(hsl(var(--cor-gray-3) / 0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cor-gray-3) / 0.25) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 24px 24px, 24px 24px",
          }}
        />

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 mb-4 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.avatar}
              alt=""
              width={128}
              height={128}
              className="h-24 w-24 shrink-0 rounded-full border-4 border-light-gray-0 bg-light-gray-0 sm:h-32 sm:w-32"
            />
            <div className="flex flex-wrap gap-2">
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md bg-light-black px-4 py-2 text-sm font-bold text-light-gray-0 hover:opacity-90"
              >
                <MarkGithubIcon className="fill-current" />
                Perfil no GitHub
              </a>
              {m.site && (
                <a
                  href={m.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md border border-light-gray-3 px-4 py-2 text-sm font-bold hover:bg-light-gray-1"
                >
                  <LinkIcon className="fill-current" />
                  Site
                </a>
              )}
            </div>
          </div>

          <h1 className="break-words text-3xl font-black tracking-tight sm:text-4xl">
            {m.nome}
          </h1>
          <p className="mb-3 font-mono text-light-gray-6">@{m.login}</p>
          {m.bio && (
            <p className="mb-4 max-w-2xl text-base text-light-gray-8 sm:text-lg">
              {m.bio}
            </p>
          )}

          <ul className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-6">
            {m.localizacao && (
              <li className="flex items-center gap-1">
                <LocationIcon className="fill-current" />
                {m.localizacao}
              </li>
            )}
            {m.empresa && (
              <li className="flex items-center gap-1">
                <OrganizationIcon className="fill-current" />
                {m.empresa}
              </li>
            )}
          </ul>

          <dl className="grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-lg border border-light-gray-2 bg-light-gray-2 text-center">
            {[
              {
                valor: m.projetos.length,
                rotulo: "projetos",
                icone: PeopleIcon,
              },
              // 0 estrelas quase sempre quer dizer que não há dados do GitHub.
              { valor: m.estrelas || null, rotulo: "estrelas" },
              { valor: m.seguidores, rotulo: "seguidores" },
            ].map((n) => (
              <div key={n.rotulo} className="bg-light-gray-0 px-3 py-3">
                <dt className="text-xs text-light-gray-6">{n.rotulo}</dt>
                <dd className="font-mono text-lg font-bold tabular-nums">
                  {n.valor === null ? "—" : formatoNumero.format(n.valor)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">
          Projetos no diretório
        </h2>

        {m.projetos.length === 0 ? (
          <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            Ainda não há projetos desta pessoa no{" "}
            <Link href="/projetos" className="font-medium underline">
              diretório
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {m.projetos.map((p) => (
              <CartaoProjeto
                key={p.repositorio}
                projeto={p}
                atualizadoEm={m.atualizadoEm}
              />
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
