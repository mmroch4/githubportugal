// Tipos e constantes do ranking, sem dependências do servidor (usados no browser).

export const METRICAS = ["contribuicoes", "seguidores"] as const;
export type Metrica = (typeof METRICAS)[number];

export const AMBITOS = [
  { id: "pais", nome: "Portugal" },
  { id: "lisboa", nome: "Lisboa" },
  { id: "porto", nome: "Porto" },
  { id: "braga", nome: "Braga" },
  { id: "coimbra", nome: "Coimbra" },
] as const;
export type Ambito = (typeof AMBITOS)[number]["id"];

export type PessoaRanking = {
  login: string;
  nome: string | null;
  avatar: string;
  localizacao: string | null;
  cidade: string;
  seguidores: number;
  contribuicoes: number;
};

export type Ranking = {
  geradoEm: string | null;
  totalAnalisado: number;
  pessoas: Record<string, PessoaRanking>;
  listas: Record<Ambito, Record<Metrica, string[]>>;
};
