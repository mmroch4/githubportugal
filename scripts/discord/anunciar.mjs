// Anuncia no Discord os projetos, eventos e artigos novos.
//
// Compara dois commits (por exemplo, o antes e o depois de um push para a main)
// e publica uma mensagem por cada entrada nova através de um webhook do Discord
// (DISCORD_WEBHOOK_URL). Corre na GitHub Action "Anunciar no Discord".
//
//   node scripts/discord/anunciar.mjs --antes <sha> --depois <sha> [--simular] [--sem-esperar]
//
// --simular     mostra as mensagens no terminal em vez de as enviar.
// --sem-esperar não espera que o site publicado já mostre a novidade.

import { execFileSync } from "node:child_process";
import { parse } from "yaml";

const SITE = "https://githubportugal.com";
const COR = 0x2ea043;
/** Para não inundar o canal se alguma coisa correr mal (por exemplo, um ficheiro reescrito). */
const MAXIMO_ANUNCIOS = 10;
const ESPERA_MAXIMA_MS = 15 * 60 * 1000;
const INTERVALO_MS = 30 * 1000;

function argumento(nome) {
  const i = process.argv.indexOf(nome);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const antes = argumento("--antes");
const depois = argumento("--depois") ?? "HEAD";
const simular = process.argv.includes("--simular");
const semEsperar = process.argv.includes("--sem-esperar");

if (!antes || /^0+$/.test(antes)) {
  console.log("Sem commit anterior para comparar; nada a anunciar.");
  process.exit(0);
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

/** Conteúdo de um ficheiro num commit, ou "" se ainda não existia. */
function ficheiroEm(commit, caminho) {
  try {
    return execFileSync("git", ["show", `${commit}:${caminho}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function lerYaml(commit, caminho) {
  try {
    return parse(ficheiroEm(commit, caminho)) ?? {};
  } catch {
    return {};
  }
}

const dataIso = (v) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "").trim();

function hojeEmPortugal() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const formatoData = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const formatarData = (d) => formatoData.format(new Date(`${d}T00:00:00Z`));

const cortar = (t, max) => (t.length <= max ? t : `${t.slice(0, max - 1)}…`);

/** Entradas de `lista` que existem em `depois` e não existiam em `antes`. */
function novas(caminho, lista, chave) {
  const anteriores = new Set((lerYaml(antes, caminho)[lista] ?? []).map(chave));
  return (lerYaml(depois, caminho)[lista] ?? []).filter(
    (e) => e && !anteriores.has(chave(e))
  );
}

const anuncios = [];

// Projetos (um repositório que mudou de dono mantém a descrição e não é anunciado)
const descricoesAnteriores = new Set(
  (lerYaml(antes, "data/projetos.yml").projetos ?? []).map((p) => p.descricao)
);
for (const p of novas("data/projetos.yml", "projetos", (p) =>
  String(p.repositorio).toLowerCase()
)) {
  if (descricoesAnteriores.has(p.descricao)) continue;
  anuncios.push({
    marcador: p.repositorio,
    pagina: `${SITE}/projetos`,
    conteudo: "📦 Novo projeto no diretório do GitHub Portugal",
    embed: {
      title: p.repositorio,
      url: `${SITE}/projetos?q=${encodeURIComponent(p.repositorio)}`,
      description: cortar(String(p.descricao ?? ""), 400),
      color: COR,
      fields: [
        { name: "Categoria", value: String(p.categoria ?? "—"), inline: true },
        {
          name: "Repositório",
          value: `[github.com/${p.repositorio}](https://github.com/${p.repositorio})`,
          inline: true,
        },
      ],
      thumbnail: {
        url: `https://github.com/${
          String(p.repositorio).split("/")[0]
        }.png?size=128`,
      },
    },
  });
}

// Eventos (só os que ainda não terminaram)
const hoje = hojeEmPortugal();
for (const e of novas(
  "data/eventos.yml",
  "eventos",
  (e) => `${dataIso(e.inicio)}|${e.nome}`
)) {
  const inicio = dataIso(e.inicio);
  const fim = dataIso(e.fim ?? e.inicio);
  if (fim < hoje) continue;
  const datas =
    inicio === fim
      ? formatarData(inicio)
      : `${formatarData(inicio)} a ${formatarData(fim)}`;
  anuncios.push({
    marcador: e.nome,
    pagina: `${SITE}/eventos`,
    conteudo: "📅 Novo evento na agenda do GitHub Portugal",
    embed: {
      title: e.nome,
      url: e.site,
      description: cortar(String(e.descricao ?? ""), 400),
      color: COR,
      fields: [
        { name: "Quando", value: datas, inline: true },
        { name: "Onde", value: String(e.cidade ?? "—"), inline: true },
        {
          name: "Tipo",
          value: [e.tipo, e.gratuito ? "gratuito" : ""]
            .filter(Boolean)
            .join(" · "),
          inline: true,
        },
      ],
      footer: { text: "Agenda completa em githubportugal.com/eventos" },
    },
  });
}

// Artigos (ficheiros novos em src/content/artigos; os começados por _ não são publicados)
const PADRAO_FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;
const artigosNovos = git(
  "diff",
  "--name-only",
  "--diff-filter=A",
  antes,
  depois,
  "--",
  "src/content/artigos"
)
  .split("\n")
  .filter((f) => /\/[^_/][^/]*\.mdx$/.test(f));

for (const ficheiro of artigosNovos) {
  const slug = ficheiro
    .split("/")
    .pop()
    .replace(/\.mdx$/, "");
  const correspondencia = ficheiroEm(depois, ficheiro).match(
    PADRAO_FRONTMATTER
  );
  if (!correspondencia) continue;
  let dados;
  try {
    dados = parse(correspondencia[1]) ?? {};
  } catch {
    continue;
  }
  if (!dados.titulo) continue;
  const url = `${SITE}/artigos/${slug}`;
  anuncios.push({
    marcador: String(dados.titulo),
    pagina: url,
    conteudo: "✍️ Novo artigo no GitHub Portugal",
    embed: {
      title: String(dados.titulo),
      url,
      description: cortar(String(dados.descricao ?? ""), 400),
      color: COR,
      fields: dados.autor
        ? [
            {
              name: "Autor",
              value: `[${dados.autor}](https://github.com/${dados.autor})`,
              inline: true,
            },
          ]
        : [],
    },
  });
}

if (anuncios.length === 0) {
  console.log("Nada de novo para anunciar.");
  process.exit(0);
}
if (anuncios.length > MAXIMO_ANUNCIOS) {
  console.log(
    `Há ${anuncios.length} novidades, mais do que o limite de ${MAXIMO_ANUNCIOS}; não anuncio nada para não inundar o canal.`
  );
  process.exit(0);
}

const webhook = process.env.DISCORD_WEBHOOK_URL;
if (!simular && !webhook) {
  console.log(
    `Há ${anuncios.length} novidades, mas falta o segredo DISCORD_WEBHOOK_URL; nada foi enviado.`
  );
  process.exit(0);
}

/** Espera que a página publicada já mostre a novidade (o deploy do Vercel demora uns minutos). */
async function esperarPeloSite(pagina, marcador) {
  const fim = Date.now() + ESPERA_MAXIMA_MS;
  while (Date.now() < fim) {
    try {
      const resposta = await fetch(pagina, { cache: "no-store" });
      if (resposta.ok && (await resposta.text()).includes(marcador))
        return true;
    } catch {
      // Tenta outra vez.
    }
    await new Promise((r) => setTimeout(r, INTERVALO_MS));
  }
  return false;
}

for (const anuncio of anuncios) {
  const mensagem = {
    content: anuncio.conteudo,
    embeds: [anuncio.embed],
    allowed_mentions: { parse: [] },
  };

  if (simular) {
    console.log(JSON.stringify(mensagem, null, 2));
    continue;
  }

  if (!semEsperar) {
    const publicado = await esperarPeloSite(
      anuncio.pagina,
      escaparHtml(anuncio.marcador)
    );
    if (!publicado) {
      console.log(
        `O site ainda não mostra "${anuncio.marcador}" ao fim de 15 minutos; anuncio na mesma.`
      );
    }
  }

  const resposta = await fetch(`${webhook}?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mensagem),
  });
  if (!resposta.ok) {
    console.error(
      `O Discord recusou o anúncio de "${anuncio.marcador}" (${
        resposta.status
      }): ${await resposta.text()}`
    );
    process.exitCode = 1;
    continue;
  }
  console.log(`Anunciado: ${anuncio.marcador}`);
  // Respeita o limite de pedidos dos webhooks.
  await new Promise((r) => setTimeout(r, 1500));
}

function escaparHtml(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
