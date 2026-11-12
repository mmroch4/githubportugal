import { ArrowLeftIcon, MarkGithubIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { RiDiscordFill, RiWhatsappFill } from "react-icons/ri";
import { links } from "@/config/metadata";
import AboutContent from "./about.mdx";
import { Logo } from "@/components/Logo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { perguntasFrequentes } from "@/content/perguntas-frequentes";
import {
  ID_ORGANIZACAO,
  ID_WEBSITE,
  metadadosPagina,
  migalhas,
  urlAbsoluto,
} from "@/lib/seo";

const description =
  "O que é o GitHub Portugal, a comunidade portuguesa de programadores e de projetos open source, como participar e respostas às perguntas mais frequentes.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Sobre o GitHub Portugal",
  descricao: description,
  caminho: "/sobre",
});

const dadosEstruturados = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${urlAbsoluto("/sobre")}#pagina`,
      url: urlAbsoluto("/sobre"),
      name: "Sobre o GitHub Portugal",
      description,
      inLanguage: "pt-PT",
      isPartOf: { "@id": ID_WEBSITE },
      about: { "@id": ID_ORGANIZACAO },
      mainEntity: { "@id": ID_ORGANIZACAO },
      breadcrumb: migalhas([{ nome: "Sobre", caminho: "/sobre" }]),
    },
    {
      "@type": "FAQPage",
      "@id": `${urlAbsoluto("/sobre")}#perguntas-frequentes`,
      url: urlAbsoluto("/sobre"),
      inLanguage: "pt-PT",
      mainEntity: perguntasFrequentes.map((p) => ({
        "@type": "Question",
        name: p.pergunta,
        acceptedAnswer: { "@type": "Answer", text: p.resposta },
      })),
    },
  ],
};

const buttonClassName =
  "flex w-fit items-center justify-center rounded p-2 hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";
const iconClassName = "h-5 w-5 fill-light-black md:h-6 md:w-6";

export default function About() {
  return (
    <main className="m-auto max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
      <nav className="mb-2 sm:mb-3 md:mb-4">
        <Link href="/" className={buttonClassName}>
          <ArrowLeftIcon verticalAlign="middle" className={iconClassName} />
          <span className="sr-only">Voltar à página principal</span>
        </Link>
      </nav>

      <header className="mb-4 flex flex-wrap items-center justify-between gap-1 sm:mb-5 sm:gap-2 md:mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-black sm:text-4xl md:text-5xl">
          <Logo
            alt=""
            size={56}
            className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
          />
          GitHub Portugal
        </h1>

        <ul className="flex items-center justify-center gap-2">
          <li>
            <a
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName}
            >
              <RiDiscordFill className={iconClassName} />
              <span className="sr-only">Juntar-se à comunidade no Discord</span>
            </a>
          </li>
          <li>
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName}
            >
              <RiWhatsappFill className={iconClassName} />
              <span className="sr-only">
                Juntar-se à comunidade no WhatsApp
              </span>
            </a>
          </li>
          <li>
            <a
              href={links.repository}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName}
            >
              <MarkGithubIcon
                verticalAlign="middle"
                className={iconClassName}
              />
              <span className="sr-only">Abrir repositório no GitHub</span>
            </a>
          </li>
        </ul>
      </header>

      <section className="space-y-3 sm:space-y-4">
        <AboutContent />
      </section>

      <section
        aria-labelledby="perguntas-frequentes"
        className="mt-8 space-y-3 sm:space-y-4"
      >
        <h2
          id="perguntas-frequentes"
          className="border-b border-b-light-gray-2 py-2 text-xl font-extrabold sm:text-2xl md:text-3xl"
        >
          ❓ Perguntas frequentes
        </h2>
        <dl className="space-y-4">
          {perguntasFrequentes.map((p) => (
            <div key={p.pergunta}>
              <dt className="text-lg font-extrabold sm:text-xl">
                {p.pergunta}
              </dt>
              <dd className="mt-1 text-base sm:text-lg">{p.resposta}</dd>
            </div>
          ))}
        </dl>
      </section>

      <DadosEstruturados dados={dadosEstruturados} />
    </main>
  );
}
