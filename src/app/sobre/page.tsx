import { MarkGithubIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import { RiDiscordFill, RiWhatsappFill } from "react-icons/ri";
import { links } from "@/config/metadata";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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

const ligacoes = [
  { nome: "Discord", href: links.discord, Icone: RiDiscordFill },
  { nome: "WhatsApp", href: links.whatsapp, Icone: RiWhatsappFill },
  { nome: "Código no GitHub", href: links.repository, Icone: MarkGithubIcon },
];

export default function About() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta="sobre"
        titulo="A comunidade portuguesa de open source."
      />
      <p className="-mt-4 mb-8 text-lg text-light-gray-7">
        Independente e sem fins lucrativos.
      </p>

      <ul className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ligacoes.map(({ nome, href, Icone }) => (
          <li key={nome}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] items-center gap-3 rounded-xl border border-light-gray-2 bg-white/60 px-4 font-semibold transition hover:bg-white"
            >
              <Icone className="h-5 w-5 fill-current" />
              {nome}
              <span aria-hidden className="ml-auto text-light-gray-6">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="perguntas-frequentes">
        <h2 id="perguntas-frequentes" className="etiqueta mb-4">
          {"// perguntas frequentes"}
        </h2>
        <div className="flex flex-col gap-2">
          {perguntasFrequentes.map((p, i) => (
            <details
              key={p.pergunta}
              open={i === 0}
              className="group rounded-xl border border-light-gray-2 bg-white/60"
            >
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-4 font-semibold [&::-webkit-details-marker]:hidden">
                {p.pergunta}
                <span
                  aria-hidden
                  className="font-mono text-marca-verde group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 leading-relaxed text-light-gray-7">
                {p.resposta}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-12 font-mono text-xs leading-relaxed text-light-gray-6">
        {"// "}sem ligação ao GitHub, Inc.: a marca e os recursos do GitHub
        pertencem aos seus donos. Inspirado no{" "}
        <a
          href="https://githubbrasil.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-marca-verde hover:underline"
        >
          GitHub Brasil
        </a>
        .
      </p>

      <DadosEstruturados dados={dadosEstruturados} />
    </main>
  );
}
