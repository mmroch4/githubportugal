// Comandos do bot do Discord do GitHub Portugal.
//
// Esta lista é enviada ao Discord pela GitHub Action "Registar comandos do
// Discord" (scripts/discord/registar-comandos.mjs) sempre que este ficheiro
// muda. As respostas são dadas por src/app/api/discord/route.ts.
//
// Formato: https://discord.com/developers/docs/interactions/application-commands

const TEXTO = 3;

export const comandos = [
  {
    name: "ranking",
    description:
      "Mostra os 10 programadores mais ativos no GitHub em Portugal.",
    options: [
      {
        type: TEXTO,
        name: "cidade",
        description: "Ranking de uma cidade (por omissão, o país inteiro).",
        required: false,
        choices: [
          { name: "Portugal", value: "pais" },
          { name: "Lisboa", value: "lisboa" },
          { name: "Porto", value: "porto" },
          { name: "Braga", value: "braga" },
          { name: "Coimbra", value: "coimbra" },
        ],
      },
      {
        type: TEXTO,
        name: "ordem",
        description:
          "Ordenar por contribuições (por omissão) ou por seguidores.",
        required: false,
        choices: [
          { name: "Contribuições no último ano", value: "contribuicoes" },
          { name: "Seguidores", value: "seguidores" },
        ],
      },
    ],
  },
  {
    name: "evento",
    description: "Mostra os próximos eventos tech em Portugal.",
    options: [
      {
        type: TEXTO,
        name: "cidade",
        description: "Só eventos nesta cidade (ou Online).",
        required: false,
        max_length: 60,
      },
      {
        type: TEXTO,
        name: "tipo",
        description: "Só eventos deste tipo.",
        required: false,
        choices: [
          { name: "Conferência", value: "Conferência" },
          { name: "Meetup", value: "Meetup" },
          { name: "Workshop", value: "Workshop" },
          { name: "Hackathon", value: "Hackathon" },
        ],
      },
    ],
  },
  {
    name: "projeto",
    description: "Procura projetos open source portugueses no diretório.",
    options: [
      {
        type: TEXTO,
        name: "pesquisa",
        description: "Nome, dono, categoria ou palavra da descrição.",
        required: true,
        max_length: 60,
      },
    ],
  },
];
