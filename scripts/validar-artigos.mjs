#!/usr/bin/env node
// Valida os artigos em src/content/artigos/*.mdx: o cabeçalho (frontmatter) e
// se o MDX compila.
//
// Uso:
//   node scripts/validar-artigos.mjs            valida o cabeçalho e o MDX
//   node scripts/validar-artigos.mjs --github   também confirma na API do GitHub
//                                               a conta indicada em `autor`
//
// Com --github, define GITHUB_TOKEN para evitar o limite de pedidos sem autenticação.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaRelativa = "src/content/artigos";
const pasta = path.join(raiz, pastaRelativa);

const CAMPOS_OBRIGATORIOS = ["titulo", "descricao", "data"];
const CAMPOS_PERMITIDOS = new Set([
  ...CAMPOS_OBRIGATORIOS,
  "autor",
  "etiquetas",
  "atualizado",
]);
const PADRAO_FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const PADRAO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PADRAO_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const PADRAO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const TITULO_MAX = 100;
const DESCRICAO_MIN = 20;
const DESCRICAO_MAX = 220;
const ETIQUETAS_MAX = 5;
const ETIQUETA_MAX = 30;
const SLUG_MAX = 80;

const emActions = process.env.GITHUB_ACTIONS === "true";
/** @type {{ tipo: "error" | "warning", ficheiro: string, mensagem: string, linha?: number }[]} */
const mensagens = [];
const erro = (ficheiro, mensagem, linha) =>
  mensagens.push({ tipo: "error", ficheiro, mensagem, linha });
const aviso = (ficheiro, mensagem, linha) =>
  mensagens.push({ tipo: "warning", ficheiro, mensagem, linha });

/** O YAML lê `2026-11-12` como data; voltamos a pô-la no formato AAAA-MM-DD. */
function comoTexto(valor) {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }
  return valor;
}

/** Confirma que a data existe (por exemplo, rejeita 2026-02-30). */
function dataValida(texto) {
  if (typeof texto !== "string" || !PADRAO_DATA.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

function hojeEmPortugal() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function validarTexto(ficheiro, campo, valor, min, max) {
  if (typeof valor !== "string" || valor.trim() === "") {
    erro(ficheiro, `falta o campo \`${campo}\` no cabeçalho.`);
    return;
  }
  if (/\n/.test(valor.trim())) {
    erro(ficheiro, `\`${campo}\` tem de estar numa só linha.`);
  }
  const n = valor.trim().length;
  if (n < min || n > max) {
    erro(
      ficheiro,
      `\`${campo}\` tem ${n} caracteres; tem de ter entre ${min} e ${max}.`
    );
  }
}

function validarData(ficheiro, campo, valor) {
  if (!dataValida(comoTexto(valor))) {
    erro(
      ficheiro,
      `\`${campo}\` tem de ser uma data no formato AAAA-MM-DD, por exemplo 2026-11-12.`
    );
    return null;
  }
  return comoTexto(valor);
}

async function validarArtigo(nome, autores) {
  const ficheiro = `${pastaRelativa}/${nome}`;
  const slug = nome.replace(/\.mdx$/, "");
  const conteudo = await readFile(path.join(pasta, nome), "utf8");

  if (!PADRAO_SLUG.test(slug) || slug.length > SLUG_MAX) {
    erro(
      ficheiro,
      `o nome do ficheiro passa a ser o endereço do artigo: usa só letras minúsculas sem acentos, números e hífenes (por exemplo, a-minha-primeira-contribuicao.mdx), até ${SLUG_MAX} caracteres.`
    );
  }

  const correspondencia = conteudo.match(PADRAO_FRONTMATTER);
  if (!correspondencia) {
    erro(
      ficheiro,
      "o artigo tem de começar com o cabeçalho entre duas linhas ---. Copia o ficheiro _modelo.mdx.",
      1
    );
    return;
  }

  let dados;
  try {
    dados = parse(correspondencia[1]);
  } catch (e) {
    erro(ficheiro, `o cabeçalho não é YAML válido: ${e.message}`, 2);
    return;
  }
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    erro(
      ficheiro,
      "o cabeçalho tem de ter os campos titulo, descricao e data."
    );
    return;
  }

  for (const campo of Object.keys(dados)) {
    if (!CAMPOS_PERMITIDOS.has(campo)) {
      erro(
        ficheiro,
        `o campo \`${campo}\` não é permitido. Usa apenas: ${[
          ...CAMPOS_PERMITIDOS,
        ].join(", ")}.`
      );
    }
  }

  validarTexto(ficheiro, "titulo", dados.titulo, 5, TITULO_MAX);
  validarTexto(
    ficheiro,
    "descricao",
    dados.descricao,
    DESCRICAO_MIN,
    DESCRICAO_MAX
  );

  const hoje = hojeEmPortugal();
  let data = null;
  if (dados.data === undefined) {
    erro(ficheiro, "falta o campo `data` no cabeçalho.");
  } else {
    data = validarData(ficheiro, "data", dados.data);
    if (data && data > hoje) {
      aviso(
        ficheiro,
        `a data (${data}) é no futuro; o artigo aparece já, mas com essa data.`
      );
    }
  }
  if (dados.atualizado !== undefined) {
    const atualizado = validarData(ficheiro, "atualizado", dados.atualizado);
    if (data && atualizado && atualizado < data) {
      erro(ficheiro, "`atualizado` não pode ser anterior a `data`.");
    }
  }

  if (dados.autor !== undefined) {
    if (typeof dados.autor !== "string" || !PADRAO_LOGIN.test(dados.autor)) {
      erro(
        ficheiro,
        "`autor` tem de ser só o teu login do GitHub (por exemplo mmroch4), sem @ nem https://github.com/."
      );
    } else {
      autores.push({ ficheiro, login: dados.autor });
    }
  }

  if (dados.etiquetas !== undefined) {
    if (
      !Array.isArray(dados.etiquetas) ||
      dados.etiquetas.some(
        (e) =>
          typeof e !== "string" || e.trim() === "" || e.length > ETIQUETA_MAX
      )
    ) {
      erro(
        ficheiro,
        `\`etiquetas\` tem de ser uma lista de palavras curtas (até ${ETIQUETA_MAX} caracteres), por exemplo [open source, javascript].`
      );
    } else if (dados.etiquetas.length > ETIQUETAS_MAX) {
      erro(ficheiro, `usa no máximo ${ETIQUETAS_MAX} etiquetas.`);
    } else if (
      new Set(dados.etiquetas.map((e) => e.toLowerCase())).size !==
      dados.etiquetas.length
    ) {
      erro(ficheiro, "`etiquetas` tem etiquetas repetidas.");
    }
  }

  const corpo = conteudo.slice(correspondencia[0].length);
  if (corpo.trim().length === 0) {
    erro(ficheiro, "o artigo não tem texto por baixo do cabeçalho.");
  }
  if (/^#\s/m.test(corpo.replace(/```[\s\S]*?```/g, ""))) {
    aviso(
      ficheiro,
      "o título do artigo já vem do cabeçalho; dentro do texto usa ## e ### para as secções, não #."
    );
  }

  try {
    await compile(conteudo, { remarkPlugins: [remarkFrontmatter] });
  } catch (e) {
    const linha = e.line ?? e.place?.line ?? e.position?.start?.line;
    erro(
      ficheiro,
      `o MDX não compila: ${
        e.reason ?? e.message
      }. Se usas < ou { no texto, escreve \\< e \\{, ou põe-os entre acentos graves.`,
      linha
    );
  }
}

async function confirmarAutores(autores) {
  const cabecalhos = {
    Accept: "application/vnd.github+json",
    "User-Agent": "githubportugal-validar-artigos",
  };
  if (process.env.GITHUB_TOKEN) {
    cabecalhos.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (const { ficheiro, login } of autores) {
    let resposta;
    try {
      resposta = await fetch(`https://api.github.com/users/${login}`, {
        headers: cabecalhos,
      });
    } catch (e) {
      aviso(
        ficheiro,
        `não foi possível confirmar a conta ${login}: ${e.message}`
      );
      continue;
    }
    if (resposta.status === 404) {
      erro(ficheiro, `a conta ${login} não existe no GitHub.`);
      continue;
    }
    if (!resposta.ok) {
      aviso(
        ficheiro,
        `não foi possível confirmar a conta ${login} (resposta ${resposta.status}).`
      );
      continue;
    }
    const conta = await resposta.json();
    if (conta.login !== login) {
      erro(
        ficheiro,
        `a conta no GitHub escreve-se ${conta.login}. Atualiza o campo \`autor\`.`
      );
    }
  }
}

function anotar({ tipo, ficheiro, mensagem, linha }) {
  if (emActions) {
    const local = linha ? `file=${ficheiro},line=${linha}` : `file=${ficheiro}`;
    console.log(`::${tipo} ${local}::${mensagem}`);
  } else {
    console.log(
      `${tipo === "error" ? "✖" : "⚠"} ${ficheiro}${
        linha ? `:${linha}` : ""
      }: ${mensagem}`
    );
  }
}

async function main() {
  const nomes = (await readdir(pasta)).filter((n) => n.endsWith(".mdx")).sort();
  // O modelo também é validado (tem de compilar), mas não é publicado.
  const autores = [];
  for (const nome of nomes) await validarArtigo(nome, autores);

  const publicados = nomes.filter((n) => !n.startsWith("_"));
  const semModelo = autores.filter((a) => !a.ficheiro.includes("/_"));
  if (process.argv.includes("--github") && semModelo.length > 0) {
    await confirmarAutores(semModelo);
  }

  // O modelo usa valores de exemplo; só interessam os erros de compilação.
  const relevantes = mensagens.filter(
    (m) =>
      !m.ficheiro.includes("/_") ||
      (m.tipo === "error" && m.mensagem.startsWith("o MDX não compila"))
  );
  relevantes.forEach(anotar);

  const nErros = relevantes.filter((m) => m.tipo === "error").length;
  if (nErros > 0) {
    console.log(`\n${nErros} erro(s) nos artigos.`);
    process.exit(1);
  }

  console.log(
    `✔ ${pastaRelativa} é válido (${publicados.length} artigo${
      publicados.length === 1 ? "" : "s"
    }).`
  );
}

main();
