#!/usr/bin/env node
// Gera data/ranking.json com o ranking de programadores em Portugal.
//
// Uso:
//   GITHUB_TOKEN=... node scripts/gerar-ranking.mjs   gera o ranking (precisa de token)
//   node scripts/gerar-ranking.mjs --validar          só valida data/ranking-excluidos.yml
//
// Como funciona:
//   1. Pesquisa no GitHub as contas pessoais com localização em Portugal ou numa
//      das cidades do ranking, ordenadas por seguidores (a pesquisa do GitHub
//      devolve no máximo 1000 resultados por pesquisa).
//   2. Confirma que a localização é mesmo em Portugal (por exemplo, "Porto
//      Alegre" fica de fora) e retira quem está em data/ranking-excluidos.yml.
//   3. Para cada candidato, lê as contribuições públicas do último ano.
//   4. Guarda as 100 primeiras pessoas de cada lista (país e cada cidade, por
//      contribuições e por seguidores).
//
// Corre todas as semanas numa GitHub Action (.github/workflows/atualizar-ranking.yml).

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FICHEIRO_RANKING = path.join(raiz, "data/ranking.json");
const FICHEIRO_EXCLUIDOS_RELATIVO = "data/ranking-excluidos.yml";
const FICHEIRO_EXCLUIDOS = path.join(raiz, FICHEIRO_EXCLUIDOS_RELATIVO);

const PADRAO_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const TAMANHO_LISTA = 100;
const POR_PAGINA = 100;
const LOTE_CONTRIBUICOES = 8;
const PEDIDOS_EM_PARALELO = 4;
const TEMPO_MAXIMO_PEDIDO = 30_000;

// Cidades do ranking. `pesquisas` são os termos usados na pesquisa do GitHub e
// `padrao` reconhece a cidade no texto da localização (sem acentos, minúsculas).
export const CIDADES = [
  { id: "lisboa", pesquisas: ["Lisboa", "Lisbon"], padrao: /\blisbo(a|n)\b/ },
  { id: "porto", pesquisas: ["Porto", "Oporto"], padrao: /\b(o ?)?porto\b/ },
  { id: "braga", pesquisas: ["Braga"], padrao: /\bbraga\b/ },
  { id: "coimbra", pesquisas: ["Coimbra"], padrao: /\bcoimbra\b/ },
];

const PESQUISAS_PAIS = ["Portugal"];

// Localizações que contêm o nome de uma cidade portuguesa mas ficam noutro país.
const FORA_DE_PORTUGAL =
  /\b(brasil|brazil|br|alegre|velho|seguro|feliz|nacional|rico|ohio|texas|california|usa|united states|rio grande|rs|ro|sp|rj|mg|pr|sc|ba)\b/;

const TERMOS_PORTUGAL = [
  "portugal",
  "lisboa",
  "lisbon",
  "porto",
  "oporto",
  "braga",
  "coimbra",
  "aveiro",
  "faro",
  "algarve",
  "setubal",
  "leiria",
  "viseu",
  "guimaraes",
  "evora",
  "funchal",
  "madeira",
  "acores",
  "azores",
  "ponta delgada",
  "vila nova de gaia",
  "matosinhos",
  "maia",
  "almada",
  "sintra",
  "cascais",
  "oeiras",
  "amadora",
  "odivelas",
  "loures",
  "barreiro",
  "seixal",
  "covilha",
  "castelo branco",
  "santarem",
  "viana do castelo",
  "vila real",
  "braganca",
  "beja",
  "portalegre",
  "guarda",
];
const PADRAO_PORTUGAL = new RegExp(`\\b(${TERMOS_PORTUGAL.join("|")})\\b`);

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Devolve null se a localização não for em Portugal; senão, a cidade (ou "outra"). */
export function classificarLocalizacao(localizacao) {
  if (!localizacao) return null;
  const texto = normalizar(localizacao);
  const dizPortugal = /\bportugal\b/.test(texto);
  if (!dizPortugal && FORA_DE_PORTUGAL.test(texto)) return null;
  if (!PADRAO_PORTUGAL.test(texto)) return null;
  const cidade = CIDADES.find((c) => c.padrao.test(texto));
  return cidade ? cidade.id : "outra";
}

// ---------------------------------------------------------------------------
// Exclusões
// ---------------------------------------------------------------------------

async function lerExcluidos() {
  const erros = [];
  let dados;
  try {
    dados = parse(await readFile(FICHEIRO_EXCLUIDOS, "utf8"));
  } catch (e) {
    return {
      excluidos: new Set(),
      erros: [
        `Não foi possível ler ${FICHEIRO_EXCLUIDOS_RELATIVO}: ${e.message}`,
      ],
    };
  }

  const lista = dados?.excluidos ?? [];
  if (!Array.isArray(lista)) {
    erros.push(
      "A chave `excluidos` tem de ser uma lista de nomes de utilizador."
    );
    return { excluidos: new Set(), erros };
  }

  const excluidos = new Set();
  lista.forEach((login, i) => {
    if (typeof login !== "string" || !PADRAO_LOGIN.test(login)) {
      erros.push(
        `Entrada ${
          i + 1
        }: "${login}" não é um nome de utilizador do GitHub válido.`
      );
      return;
    }
    const chave = login.toLowerCase();
    if (excluidos.has(chave))
      erros.push(`"${login}" aparece mais do que uma vez.`);
    excluidos.add(chave);
  });

  return { excluidos, erros };
}

// ---------------------------------------------------------------------------
// API do GitHub
// ---------------------------------------------------------------------------

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function graphql(query, variables = {}, tentativas = 4) {
  for (let tentativa = 1; ; tentativa++) {
    const resposta = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "githubportugal-ranking",
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(TEMPO_MAXIMO_PEDIDO),
    }).catch((e) => ({
      ok: false,
      status: 0,
      headers: new Headers(),
      json: async () => ({ errors: [{ message: e.message }] }),
    }));

    const corpo = await resposta.json().catch(() => null);
    const falhou = !resposta.ok || (!corpo?.data && corpo?.errors);

    if (!falhou) return corpo;

    // Limite de pedidos esgotado: espera pela renovação (no máximo 15 minutos)
    // sem gastar tentativas.
    if (resposta.headers.get("x-ratelimit-remaining") === "0") {
      const renovacao =
        Number(resposta.headers.get("x-ratelimit-reset")) * 1000;
      const espera = Math.min(Math.max(renovacao - Date.now(), 1000), 900_000);
      console.warn(
        `  limite de pedidos esgotado, a esperar ${Math.round(espera / 1000)}s`
      );
      await esperar(espera + 1000);
      tentativa--;
      continue;
    }

    if (tentativa >= tentativas) {
      throw new Error(
        `GraphQL falhou (${resposta.status}): ${JSON.stringify(
          corpo?.errors ?? corpo
        ).slice(0, 500)}`
      );
    }
    // Limites secundários e erros temporários: espera e tenta outra vez.
    const espera =
      Number(resposta.headers.get("retry-after")) * 1000 || 5000 * tentativa;
    console.warn(
      `  pedido falhou (${resposta.status}), nova tentativa em ${
        espera / 1000
      }s`
    );
    await esperar(espera);
  }
}

const QUERY_PESQUISA = `
  query ($q: String!, $depois: String) {
    search(query: $q, type: USER, first: ${POR_PAGINA}, after: $depois) {
      userCount
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on User { login location }
      }
    }
  }
`;

/** Logins e localizações de uma pesquisa (até 1000 resultados, ordenados por seguidores). */
async function pesquisar(termo) {
  const q = `location:"${termo}" type:user sort:followers-desc`;
  const encontrados = [];
  let depois = null;

  do {
    const { data } = await graphql(QUERY_PESQUISA, { q, depois });
    if (!data?.search) break;
    for (const no of data.search.nodes) {
      if (no?.login) encontrados.push(no);
    }
    depois = data.search.pageInfo.hasNextPage
      ? data.search.pageInfo.endCursor
      : null;
  } while (depois);

  console.log(`  location:"${termo}": ${encontrados.length} contas`);
  return encontrados;
}

function camposDetalhes(lote) {
  return lote
    .map(
      (login, j) => `u${j}: user(login: ${JSON.stringify(login)}) {
        login name avatarUrl(size: 96) location
        followers { totalCount }
        contributionsCollection {
          contributionCalendar { totalContributions }
          restrictedContributionsCount
        }
      }`
    )
    .join("\n");
}

/**
 * Lê um lote de perfis. As contribuições são caras de calcular e um lote grande
 * pode exceder o tempo do GitHub (erro 502): nesse caso, divide o lote ao meio.
 */
async function lerLote(lote, resultado) {
  let data;
  try {
    ({ data } = await graphql(`query { ${camposDetalhes(lote)} }`, {}, 2));
  } catch (e) {
    if (lote.length > 1) {
      const meio = Math.ceil(lote.length / 2);
      await lerLote(lote.slice(0, meio), resultado);
      await lerLote(lote.slice(meio), resultado);
    } else {
      console.warn(`  ${lote[0]} ignorado: ${e.message.slice(0, 200)}`);
    }
    return;
  }

  lote.forEach((_, j) => {
    const u = data?.[`u${j}`];
    if (!u) return;
    const c = u.contributionsCollection;
    resultado.set(u.login.toLowerCase(), {
      login: u.login,
      nome: u.name || null,
      avatar: u.avatarUrl,
      localizacao: u.location || null,
      seguidores: u.followers.totalCount,
      contribuicoes: Math.max(
        0,
        c.contributionCalendar.totalContributions -
          c.restrictedContributionsCount
      ),
    });
  });
}

/** Perfil e contribuições públicas do último ano de cada login, com alguns pedidos em paralelo. */
async function obterDetalhes(logins) {
  const resultado = new Map();
  const lotes = [];
  for (let i = 0; i < logins.length; i += LOTE_CONTRIBUICOES) {
    lotes.push(logins.slice(i, i + LOTE_CONTRIBUICOES));
  }

  let proximo = 0;
  let concluidos = 0;
  const inicio = Date.now();

  async function trabalhador() {
    while (proximo < lotes.length) {
      const lote = lotes[proximo++];
      await lerLote(lote, resultado);
      concluidos++;
      if (concluidos % 25 === 0 || concluidos === lotes.length) {
        const segundos = Math.round((Date.now() - inicio) / 1000);
        console.log(
          `  ${concluidos}/${lotes.length} lotes (${resultado.size} perfis, ${segundos}s)`
        );
      }
    }
  }

  await Promise.all(Array.from({ length: PEDIDOS_EM_PARALELO }, trabalhador));
  return resultado;
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

function topo(pessoas, metrica) {
  return [...pessoas]
    .filter((p) => p[metrica] > 0)
    .sort((a, b) => b[metrica] - a[metrica] || a.login.localeCompare(b.login))
    .slice(0, TAMANHO_LISTA);
}

async function gerar() {
  if (!process.env.GITHUB_TOKEN) {
    console.error(
      "Define GITHUB_TOKEN: a pesquisa e as contribuições só estão disponíveis com autenticação."
    );
    process.exit(1);
  }

  const { excluidos, erros } = await lerExcluidos();
  if (erros.length) {
    erros.forEach((e) => console.error(`✗ ${e}`));
    process.exit(1);
  }

  console.log("A pesquisar contas...");
  const candidatos = new Map();
  const termos = [...PESQUISAS_PAIS, ...CIDADES.flatMap((c) => c.pesquisas)];
  for (const termo of termos) {
    for (const { login, location } of await pesquisar(termo)) {
      const chave = login.toLowerCase();
      if (excluidos.has(chave) || candidatos.has(chave)) continue;
      if (classificarLocalizacao(location)) candidatos.set(chave, login);
    }
  }
  console.log(`${candidatos.size} candidatos com localização em Portugal.`);

  console.log("A ler perfis e contribuições...");
  const detalhes = await obterDetalhes([...candidatos.values()]);

  const pessoas = [];
  for (const p of detalhes.values()) {
    // A localização pode ter mudado entre a pesquisa e a leitura do perfil.
    const cidade = classificarLocalizacao(p.localizacao);
    if (cidade && !excluidos.has(p.login.toLowerCase()))
      pessoas.push({ ...p, cidade });
  }

  const ambitos = [
    { id: "pais", pessoas },
    ...CIDADES.map((c) => ({
      id: c.id,
      pessoas: pessoas.filter((p) => p.cidade === c.id),
    })),
  ];

  const listas = {};
  const incluidos = new Map();
  for (const ambito of ambitos) {
    listas[ambito.id] = {};
    for (const metrica of ["contribuicoes", "seguidores"]) {
      const lista = topo(ambito.pessoas, metrica);
      listas[ambito.id][metrica] = lista.map((p) => p.login);
      lista.forEach((p) => incluidos.set(p.login, p));
    }
  }

  const ranking = {
    geradoEm: new Date().toISOString(),
    totalAnalisado: pessoas.length,
    pessoas: [...incluidos.values()].sort((a, b) =>
      a.login.localeCompare(b.login)
    ),
    listas,
  };

  await writeFile(FICHEIRO_RANKING, `${JSON.stringify(ranking, null, 1)}\n`);
  console.log(
    `Ranking guardado: ${pessoas.length} pessoas analisadas, ${incluidos.size} nas listas.`
  );
}

async function validar() {
  const { excluidos, erros } = await lerExcluidos();
  if (erros.length) {
    erros.forEach((e) => console.error(`✗ ${e}`));
    if (process.env.GITHUB_ACTIONS === "true") {
      erros.forEach((e) =>
        console.log(`::error file=${FICHEIRO_EXCLUIDOS_RELATIVO}::${e}`)
      );
    }
    process.exit(1);
  }
  console.log(
    `✓ ${FICHEIRO_EXCLUIDOS_RELATIVO} é válido (${excluidos.size} exclusões).`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--validar")) await validar();
  else await gerar();
}
