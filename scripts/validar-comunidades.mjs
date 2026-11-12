#!/usr/bin/env node
// Valida o ficheiro data/comunidades.yml.
//
// Uso:
//   node scripts/validar-comunidades.mjs            valida o formato do ficheiro
//   node scripts/validar-comunidades.mjs --github   também confirma na API do GitHub
//                                                   as contas indicadas no campo github
//
// Com --github, define GITHUB_TOKEN para evitar o limite de pedidos sem autenticação.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ficheiroRelativo = "data/comunidades.yml";
const ficheiro = path.join(raiz, ficheiroRelativo);

const CAMPOS_OBRIGATORIOS = ["nome", "descricao", "categoria", "site"];
const CAMPOS_PERMITIDOS = new Set([...CAMPOS_OBRIGATORIOS, "cidade", "github"]);
const PADRAO_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const DESCRICAO_MIN = 10;
const DESCRICAO_MAX = 200;

const emActions = process.env.GITHUB_ACTIONS === "true";
const erros = [];
const avisos = [];
const erro = (m) => erros.push(m);
const aviso = (m) => avisos.push(m);

function linkValido(texto) {
  if (typeof texto !== "string" || !texto.startsWith("https://")) return false;
  try {
    new URL(texto);
    return true;
  } catch {
    return false;
  }
}

/** Domínio e caminho sem barra final, para encontrar sites repetidos. */
function chaveSite(texto) {
  const u = new URL(texto);
  return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(
    /\/$/,
    ""
  )}`.toLowerCase();
}

function validarTexto(prefixo, campo, valor, min, max) {
  if (typeof valor !== "string" || valor.trim() === "") {
    erro(`${prefixo} falta o campo \`${campo}\`.`);
    return;
  }
  if (valor !== valor.trim()) {
    erro(`${prefixo} \`${campo}\` não pode começar ou acabar com espaços.`);
  }
  if (/\n/.test(valor)) {
    erro(`${prefixo} \`${campo}\` tem de estar numa só linha.`);
  }
  if (valor.length < min || valor.length > max) {
    erro(
      `${prefixo} \`${campo}\` tem ${valor.length} caracteres; tem de ter entre ${min} e ${max}.`
    );
  }
}

function validarFormato(dados) {
  if (!dados || typeof dados !== "object") {
    erro("O ficheiro tem de ter as chaves `categorias` e `comunidades`.");
    return [];
  }

  const { categorias, comunidades } = dados;

  if (!Array.isArray(categorias) || categorias.length === 0) {
    erro("`categorias` tem de ser uma lista com pelo menos uma categoria.");
  }
  const categoriasValidas = new Set(
    Array.isArray(categorias)
      ? categorias.filter((c) => typeof c === "string")
      : []
  );

  if (!Array.isArray(comunidades)) {
    erro("`comunidades` tem de ser uma lista.");
    return [];
  }

  const nomes = new Map();
  const sites = new Map();

  comunidades.forEach((c, indice) => {
    const nome =
      c && typeof c.nome === "string" ? c.nome : `comunidade n.º ${indice + 1}`;
    const prefixo = `${nome}:`;

    if (!c || typeof c !== "object" || Array.isArray(c)) {
      erro(
        `${prefixo} cada comunidade tem de ser um objeto com os campos ${CAMPOS_OBRIGATORIOS.join(
          ", "
        )}.`
      );
      return;
    }

    for (const campo of Object.keys(c)) {
      if (!CAMPOS_PERMITIDOS.has(campo)) {
        erro(
          `${prefixo} o campo \`${campo}\` não é permitido. Usa apenas: ${[
            ...CAMPOS_PERMITIDOS,
          ].join(", ")}.`
        );
      }
    }

    validarTexto(prefixo, "nome", c.nome, 2, 80);
    validarTexto(
      prefixo,
      "descricao",
      c.descricao,
      DESCRICAO_MIN,
      DESCRICAO_MAX
    );
    if (c.cidade !== undefined)
      validarTexto(prefixo, "cidade", c.cidade, 2, 60);

    if (typeof c.categoria !== "string" || c.categoria.trim() === "") {
      erro(`${prefixo} falta o campo \`categoria\`.`);
    } else if (!categoriasValidas.has(c.categoria)) {
      erro(
        `${prefixo} a categoria "${c.categoria}" não existe. Usa uma destas: ${[
          ...categoriasValidas,
        ].join(", ")}.`
      );
    }

    if (c.site === undefined) {
      erro(`${prefixo} falta o campo \`site\`.`);
    } else if (!linkValido(c.site)) {
      erro(
        `${prefixo} \`site\` tem de ser um link válido começado por https://.`
      );
    } else {
      const chave = chaveSite(c.site);
      if (sites.has(chave)) {
        erro(`${prefixo} o site ${c.site} já é usado por ${sites.get(chave)}.`);
      } else {
        sites.set(chave, nome);
      }
    }

    if (c.github !== undefined) {
      if (typeof c.github !== "string" || !PADRAO_LOGIN.test(c.github)) {
        erro(
          `${prefixo} \`github\` tem de ser só o nome da conta (por exemplo GitHub-Portugal), sem @ nem https://github.com/.`
        );
      }
    }

    if (typeof c.nome === "string") {
      const chave = c.nome.toLowerCase();
      if (nomes.has(chave)) {
        erro(
          `${prefixo} a comunidade já está na lista (entrada n.º ${
            nomes.get(chave) + 1
          }).`
        );
      } else {
        nomes.set(chave, indice);
      }
    }
  });

  return comunidades;
}

async function validarNoGitHub(comunidades) {
  const cabecalhos = {
    Accept: "application/vnd.github+json",
    "User-Agent": "githubportugal-validador",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    cabecalhos.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (const c of comunidades.filter((c) => typeof c?.github === "string")) {
    const prefixo = `${c.nome}:`;
    let resposta;
    try {
      resposta = await fetch(`https://api.github.com/users/${c.github}`, {
        headers: cabecalhos,
      });
    } catch (e) {
      erro(
        `${prefixo} não foi possível contactar a API do GitHub (${e.message}).`
      );
      continue;
    }
    if (resposta.status === 404) {
      erro(`${prefixo} a conta ${c.github} não existe no GitHub.`);
      continue;
    }
    if (!resposta.ok) {
      erro(
        `${prefixo} a API do GitHub respondeu com o estado ${resposta.status}.`
      );
      continue;
    }
    const conta = await resposta.json();
    if (conta.login !== c.github) {
      aviso(
        `${prefixo} a conta no GitHub escreve-se ${conta.login}. Atualiza o campo \`github\`.`
      );
    }
  }
}

function anotar(tipo, mensagem) {
  if (emActions) {
    console.log(`::${tipo} file=${ficheiroRelativo}::${mensagem}`);
  } else {
    console.log(`${tipo === "error" ? "✖" : "⚠"} ${mensagem}`);
  }
}

async function main() {
  let dados;
  try {
    dados = parse(await readFile(ficheiro, "utf8"));
  } catch (e) {
    anotar("error", `Não foi possível ler ${ficheiroRelativo}: ${e.message}`);
    process.exit(1);
  }

  const comunidades = validarFormato(dados);

  if (process.argv.includes("--github") && erros.length === 0) {
    await validarNoGitHub(comunidades);
  }

  avisos.forEach((m) => anotar("warning", m));
  erros.forEach((m) => anotar("error", m));

  if (erros.length > 0) {
    console.log(`\n${erros.length} erro(s) em ${ficheiroRelativo}.`);
    process.exit(1);
  }

  console.log(
    `✔ ${ficheiroRelativo} é válido (${comunidades.length} comunidades).`
  );
}

main();
