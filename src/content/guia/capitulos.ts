export type Capitulo = {
  slug: string;
  titulo: string;
  descricao: string;
  emoji: string;
};

/** Ordem dos capítulos do guia. Cada slug tem um ficheiro `<slug>.mdx` nesta pasta. */
export const capitulos: Capitulo[] = [
  {
    slug: "o-que-e-codigo-aberto",
    titulo: "O que é código aberto",
    descricao:
      "O que significa um projeto ser open source, porque vale a pena participar e o vocabulário que vais encontrar.",
    emoji: "🌱",
  },
  {
    slug: "primeira-contribuicao",
    titulo: "Fazer a tua primeira contribuição",
    descricao:
      "Do fork ao pull request: como escolher uma issue, preparar a alteração e lidar com a revisão.",
    emoji: "🤝",
  },
  {
    slug: "licencas",
    titulo: "Escolher uma licença",
    descricao:
      "Sem licença o código não é aberto. As licenças mais comuns, as diferenças entre elas e como escolher.",
    emoji: "⚖️",
  },
  {
    slug: "iniciar-um-projeto",
    titulo: "Iniciar um projeto",
    descricao:
      "Os ficheiros que todo o projeto deve ter, como escrever um bom README e como preparar o repositório para receber contribuições.",
    emoji: "🚀",
  },
  {
    slug: "construir-comunidade",
    titulo: "Construir uma comunidade",
    descricao:
      "Como dar a conhecer o projeto, acolher quem chega e transformar utilizadores em contribuidores.",
    emoji: "👥",
  },
  {
    slug: "boas-praticas-de-manutencao",
    titulo: "Boas práticas de manutenção",
    descricao:
      "Triagem de issues, revisão de código, versões, segurança e como manter o projeto sem te esgotares.",
    emoji: "🛠️",
  },
];

export function obterCapitulo(slug: string) {
  const indice = capitulos.findIndex((c) => c.slug === slug);
  if (indice === -1) return null;
  return {
    capitulo: capitulos[indice],
    numero: indice + 1,
    anterior: capitulos[indice - 1] ?? null,
    seguinte: capitulos[indice + 1] ?? null,
  };
}
