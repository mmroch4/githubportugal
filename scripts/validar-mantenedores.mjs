#!/usr/bin/env node
// Valida o ficheiro data/mantenedores.yml.
//
// Uso:
//   node scripts/validar-mantenedores.mjs            valida o formato do ficheiro
//   node scripts/validar-mantenedores.mjs --github   também confirma na API do GitHub
//                                                    que cada conta existe e é pessoal
//
// Com --github, define GITHUB_TOKEN para evitar o limite de pedidos sem autenticação.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ficheiroRelativo = "data/mantenedores.yml";
const ficheiro = path.join(raiz, ficheiroRelativo);
const ficheiroProjetos = path.join(raiz, "data/projetos.yml");

const CAMPOS_PERMITIDOS = new Set(["github", "projetos", "bio"]);
const PADRAO_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const BIO_MIN = 10;
const BIO_MAX = 160;

const emActions = process.env.GITHUB_ACTIONS === "true";
const erros = [];
const avisos = [];

const erro = (m) => erros.push(m);
const aviso = (m) => avisos.push(m);

async function lerRepositoriosDoDiretorio() {
  try {
    const dados = parse(await readFile(ficheiroProjetos, "utf8"));
    return new Map(
      (dados?.projetos ?? [])
        .filter((p) => typeof p?.repositorio === "string")
        .map((p) => [p.repositorio.toLowerCase(), p.repositorio])
    );
  } catch {
    return new Map();
  }
}

function validarFormato(dados, repositorios) {
  if (
    !dados ||
    typeof dados !== "object" ||
    !Array.isArray(dados.mantenedores)
  ) {
    erro("O ficheiro tem de ter a chave `mantenedores` com uma lista.");
    return [];
  }

  const vistos = new Map();

  dados.mantenedores.forEach((m, indice) => {
    const nome =
      m && typeof m.github === "string"
        ? m.github
        : `mantenedor n.º ${indice + 1}`;
    const prefixo = `${nome}:`;

    if (!m || typeof m !== "object" || Array.isArray(m)) {
      erro(
        `${prefixo} cada mantenedor tem de ser um objeto com o campo github.`
      );
      return;
    }

    for (const campo of Object.keys(m)) {
      if (!CAMPOS_PERMITIDOS.has(campo)) {
        erro(
          `${prefixo} o campo \`${campo}\` não é permitido. Usa apenas: ${[
            ...CAMPOS_PERMITIDOS,
          ].join(", ")}.`
        );
      }
    }

    // github
    if (typeof m.github !== "string" || m.github.trim() === "") {
      erro(`${prefixo} falta o campo \`github\`.`);
    } else if (!PADRAO_LOGIN.test(m.github)) {
      erro(
        `${prefixo} \`github\` tem de ser só o nome de utilizador (por exemplo mmroch4), sem @ nem https://github.com/.`
      );
    } else {
      const chave = m.github.toLowerCase();
      if (vistos.has(chave)) {
        erro(
          `${prefixo} a pessoa já está na lista (entrada n.º ${
            vistos.get(chave) + 1
          }).`
        );
      } else {
        vistos.set(chave, indice);
      }
    }

    // projetos
    if (m.projetos !== undefined) {
      if (!Array.isArray(m.projetos) || m.projetos.length === 0) {
        erro(
          `${prefixo} \`projetos\` tem de ser uma lista com pelo menos um repositório.`
        );
      } else {
        const repetidos = new Set();
        for (const repo of m.projetos) {
          if (typeof repo !== "string") {
            erro(
              `${prefixo} cada entrada de \`projetos\` tem de ser um repositório no formato dono/nome.`
            );
            continue;
          }
          const chave = repo.toLowerCase();
          if (repetidos.has(chave)) {
            erro(`${prefixo} ${repo} aparece mais de uma vez em \`projetos\`.`);
          }
          repetidos.add(chave);
          if (!repositorios.has(chave)) {
            erro(
              `${prefixo} ${repo} não está em data/projetos.yml. Adiciona o projeto ao diretório primeiro.`
            );
          } else if (
            typeof m.github === "string" &&
            chave.startsWith(`${m.github.toLowerCase()}/`)
          ) {
            aviso(
              `${prefixo} ${repo} é da conta pessoal e já entra automaticamente; podes tirá-lo de \`projetos\`.`
            );
          }
        }
      }
    }

    // bio
    if (m.bio !== undefined) {
      if (typeof m.bio !== "string" || m.bio.trim() === "") {
        erro(`${prefixo} \`bio\` tem de ser uma frase.`);
      } else {
        if (m.bio !== m.bio.trim()) {
          erro(`${prefixo} a bio não pode começar ou acabar com espaços.`);
        }
        if (m.bio.length < BIO_MIN || m.bio.length > BIO_MAX) {
          erro(
            `${prefixo} a bio tem ${m.bio.length} caracteres; tem de ter entre ${BIO_MIN} e ${BIO_MAX}.`
          );
        }
        if (/\n/.test(m.bio)) {
          erro(`${prefixo} a bio tem de estar numa só linha.`);
        }
      }
    }
  });

  return dados.mantenedores.filter(
    (m) => m && typeof m.github === "string" && PADRAO_LOGIN.test(m.github)
  );
}

async function validarNoGitHub(mantenedores) {
  const cabecalhos = {
    Accept: "application/vnd.github+json",
    "User-Agent": "githubportugal-validador",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    cabecalhos.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (const m of mantenedores) {
    const prefixo = `${m.github}:`;
    let resposta;
    try {
      resposta = await fetch(`https://api.github.com/users/${m.github}`, {
        headers: cabecalhos,
      });
    } catch (e) {
      erro(
        `${prefixo} não foi possível contactar a API do GitHub (${e.message}).`
      );
      continue;
    }

    if (resposta.status === 404) {
      erro(`${prefixo} esta conta não existe no GitHub.`);
      continue;
    }
    if (!resposta.ok) {
      erro(
        `${prefixo} a API do GitHub respondeu com o estado ${resposta.status}.`
      );
      continue;
    }

    const conta = await resposta.json();
    if (conta.type !== "User") {
      erro(
        `${prefixo} é uma organização, não uma pessoa. Adiciona as pessoas que mantêm os projetos.`
      );
    }
    if (conta.login !== m.github) {
      aviso(
        `${prefixo} o nome de utilizador no GitHub escreve-se ${conta.login}. Atualiza o campo \`github\`.`
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

  const repositorios = await lerRepositoriosDoDiretorio();
  const mantenedores = validarFormato(dados, repositorios);

  if (process.argv.includes("--github") && erros.length === 0) {
    await validarNoGitHub(mantenedores);
  }

  avisos.forEach((m) => anotar("warning", m));
  erros.forEach((m) => anotar("error", m));

  if (erros.length > 0) {
    console.log(`\n${erros.length} erro(s) em ${ficheiroRelativo}.`);
    process.exit(1);
  }

  console.log(
    `✔ ${ficheiroRelativo} é válido (${mantenedores.length} mantenedores).`
  );
}

main();
