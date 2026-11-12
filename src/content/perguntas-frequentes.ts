export type PerguntaFrequente = {
  pergunta: string;
  /** Resposta em texto simples (aparece na página e nos dados estruturados). */
  resposta: string;
};

/**
 * Perguntas frequentes mostradas na página Sobre. Respostas curtas e diretas:
 * são também o texto que os motores de pesquisa e os assistentes de IA citam.
 */
export const perguntasFrequentes: PerguntaFrequente[] = [
  {
    pergunta: "O que é o GitHub Portugal?",
    resposta:
      "O GitHub Portugal é uma comunidade portuguesa de programadores e de projetos open source. O site reúne um diretório de projetos open source portugueses, os mantenedores desses projetos, issues para fazer a primeira contribuição, um ranking dos programadores mais ativos no GitHub em Portugal, uma agenda de eventos tech, comunidades, empresas com código aberto, um guia de código aberto em português de Portugal e artigos da comunidade.",
  },
  {
    pergunta: "O GitHub Portugal é oficial do GitHub?",
    resposta:
      "Não. O GitHub Portugal é uma comunidade independente e sem fins lucrativos, criada por programadores portugueses. Não tem qualquer ligação oficial à empresa GitHub.",
  },
  {
    pergunta: "Como adiciono o meu projeto open source ao diretório?",
    resposta:
      "Edita o ficheiro data/projetos.yml no repositório mmroch4/githubportugal e abre um pull request. Entram projetos com repositório público no GitHub, criados ou mantidos por programadores, empresas ou organizações portuguesas. As instruções completas estão no ficheiro CONTRIBUTING.md.",
  },
  {
    pergunta: "Como faço a minha primeira contribuição open source?",
    resposta:
      "Começa pela página Primeiras contribuições, que junta as issues marcadas como “good first issue” ou “help wanted” nos projetos portugueses do diretório. O capítulo “Fazer a tua primeira contribuição” do guia de código aberto explica o processo passo a passo, do fork ao pull request.",
  },
  {
    pergunta: "Como entro no ranking de programadores portugueses?",
    resposta:
      "Escreve a tua cidade ou “Portugal” no campo de localização do teu perfil no GitHub. O ranking é atualizado todas as segundas-feiras e conta as contribuições públicas dos últimos 12 meses (commits, pull requests, issues e revisões) e os seguidores. Para saíres, acrescenta o teu nome de utilizador a data/ranking-excluidos.yml ou abre uma issue a pedi-lo.",
  },
  {
    pergunta: "Como divulgo um evento, uma comunidade ou uma empresa?",
    resposta:
      "Os eventos, as comunidades e as empresas vêm dos ficheiros data/eventos.yml, data/comunidades.yml e data/empresas.yml. Acrescenta uma entrada no ficheiro certo e abre um pull request; uma validação automática confirma que os dados estão completos.",
  },
  {
    pergunta: "Quantos programadores há no GitHub em Portugal?",
    resposta:
      "A página Estatísticas mostra, todas as semanas, quantos perfis do GitHub indicam uma localização em Portugal, em que cidades estão, que linguagens usam mais e quantas contribuições públicas fizeram nos últimos 12 meses. Só são guardados totais, nunca dados de uma pessoa em concreto.",
  },
  {
    pergunta: "O site recolhe dados de quem o visita?",
    resposta:
      "Só estatísticas anónimas de visitas e de desempenho (Vercel Web Analytics e Speed Insights), sem cookies e sem identificar quem visita. Servem para saber que páginas são mais úteis e se o site carrega depressa.",
  },
  {
    pergunta: "Como me junto à comunidade?",
    resposta:
      "Entra no servidor de Discord ou no grupo de WhatsApp do GitHub Portugal (os links estão no topo desta página) e acompanha o repositório no GitHub, onde todo o site é desenvolvido em código aberto.",
  },
];
