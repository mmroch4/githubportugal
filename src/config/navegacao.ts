/** Ligações da navegação global (cabeçalho e rodapé). */
export type Ligacao = { href: string; nome: string; descricao?: string };

/** Entradas principais, sempre visíveis no cabeçalho em ecrãs largos. */
export const navegacaoPrincipal: Ligacao[] = [
  { href: "/projetos", nome: "Projetos" },
  { href: "/mantenedores", nome: "Pessoas" },
  { href: "/ranking", nome: "Ranking" },
  { href: "/eventos", nome: "Eventos" },
  { href: "/guia", nome: "Guia" },
];

/** O resto do site, no menu "Mais". */
export const navegacaoSecundaria: Ligacao[] = [
  {
    href: "/primeiras-contribuicoes",
    nome: "Primeiras contribuições",
    descricao: "Issues para começar no open source",
  },
  {
    href: "/estatisticas",
    nome: "Estatísticas",
    descricao: "O open source português em números",
  },
  {
    href: "/comunidades",
    nome: "Comunidades",
    descricao: "Meetups e grupos tech em Portugal",
  },
  {
    href: "/empresas",
    nome: "Empresas",
    descricao: "Empresas tech que fazem open source",
  },
  {
    href: "/artigos",
    nome: "Artigos",
    descricao: "Textos da comunidade",
  },
  {
    href: "/selo",
    nome: "Selo",
    descricao: "Badge “Feito em Portugal” para o teu README",
  },
  {
    href: "/sobre",
    nome: "Sobre",
    descricao: "Quem somos e perguntas frequentes",
  },
];

/** Colunas do rodapé. */
export const colunasRodape: { titulo: string; ligacoes: Ligacao[] }[] = [
  {
    titulo: "Explorar",
    ligacoes: [
      { href: "/projetos", nome: "Projetos" },
      { href: "/mantenedores", nome: "Mantenedores" },
      { href: "/ranking", nome: "Ranking" },
      { href: "/estatisticas", nome: "Estatísticas" },
      { href: "/empresas", nome: "Empresas" },
    ],
  },
  {
    titulo: "Aprender",
    ligacoes: [
      { href: "/guia", nome: "Guia de código aberto" },
      { href: "/primeiras-contribuicoes", nome: "Primeiras contribuições" },
      { href: "/artigos", nome: "Artigos" },
    ],
  },
  {
    titulo: "Comunidade",
    ligacoes: [
      { href: "/eventos", nome: "Eventos" },
      { href: "/comunidades", nome: "Comunidades" },
      { href: "/selo", nome: "Selo “Feito em Portugal”" },
      { href: "/sobre", nome: "Sobre" },
    ],
  },
];

/** A página atual pertence a esta ligação? */
export function estaAtiva(caminho: string, href: string) {
  return caminho === href || caminho.startsWith(`${href}/`);
}
