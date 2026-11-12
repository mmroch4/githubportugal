#!/usr/bin/env node
// Valida o ficheiro data/projetos.yml.
//
// Uso:
//   node scripts/validar-projetos.mjs            valida o formato do ficheiro
//   node scripts/validar-projetos.mjs --github   também confirma na API do GitHub
//                                                que cada repositório existe e é público
//
// Com --github, define GITHUB_TOKEN para evitar o limite de pedidos sem autenticação.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ficheiroRelativo = "data/projetos.yml";
const ficheiro = path.join(raiz, ficheiroRelativo);

const CAMPOS_PERMITIDOS = new Set([
  "repositorio",
  "descricao",
  "categoria",
  "site",
]);
const PADRAO_REPOSITORIO =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
const DESCRICAO_MIN = 10;
const DESCRICAO_MAX = 200;

const emActions = process.env.GITHUB_ACTIONS === "true";
const erros = [];
const avisos = [];

function erro(mensagem) {
  erros.push(mensagem);
}

function aviso(mensagem) {
  avisos.push(mensagem);
}

function validarFormato(dados) {
  if (!dados || typeof dados !== "object") {
    erro("O ficheiro tem de ter as chaves `categorias` e `projetos`.");
    return [];
  }

  const { categorias, projetos } = dados;

  if (!Array.isArray(categorias) || categorias.length === 0) {
    erro("`categorias` tem de ser uma lista com pelo menos uma categoria.");
  }

  const categoriasValidas = new Set(
    Array.isArray(categorias)
      ? categorias.filter((c) => typeof c === "string")
      : []
  );

  if (!Array.isArray(projetos)) {
    erro("`projetos` tem de ser uma lista.");
    return [];
  }

  const vistos = new Map();

  projetos.forEach((projeto, indice) => {
    const nome =
      projeto && typeof projeto.repositorio === "string"
        ? projeto.repositorio
        : `projeto n.º ${indice + 1}`;
    const prefixo = `${nome}:`;

    if (!projeto || typeof projeto !== "object" || Array.isArray(projeto)) {
      erro(
        `${prefixo} cada projeto tem de ser um objeto com os campos repositorio, descricao e categoria.`
      );
      return;
    }

    for (const campo of Object.keys(projeto)) {
      if (!CAMPOS_PERMITIDOS.has(campo)) {
        erro(
          `${prefixo} o campo \`${campo}\` não é permitido. Usa apenas: ${[
            ...CAMPOS_PERMITIDOS,
          ].join(", ")}.`
        );
      }
    }

    // repositorio
    if (
      typeof projeto.repositorio !== "string" ||
      projeto.repositorio.trim() === ""
    ) {
      erro(`${prefixo} falta o campo \`repositorio\`.`);
    } else if (!PADRAO_REPOSITORIO.test(projeto.repositorio)) {
      erro(
        `${prefixo} \`repositorio\` tem de estar no formato dono/nome (por exemplo FogosPT/fogospt), sem https://github.com/.`
      );
    } else {
      const chave = projeto.repositorio.toLowerCase();
      if (vistos.has(chave)) {
        erro(
          `${prefixo} o repositório já está na lista (entrada n.º ${
            vistos.get(chave) + 1
          }).`
        );
      } else {
        vistos.set(chave, indice);
      }
    }

    // descricao
    if (
      typeof projeto.descricao !== "string" ||
      projeto.descricao.trim() === ""
    ) {
      erro(`${prefixo} falta o campo \`descricao\`.`);
    } else {
      const descricao = projeto.descricao;
      if (descricao !== descricao.trim()) {
        erro(`${prefixo} a descrição não pode começar ou acabar com espaços.`);
      }
      if (
        descricao.length < DESCRICAO_MIN ||
        descricao.length > DESCRICAO_MAX
      ) {
        erro(
          `${prefixo} a descrição tem ${descricao.length} caracteres; tem de ter entre ${DESCRICAO_MIN} e ${DESCRICAO_MAX}.`
        );
      }
      if (/\n/.test(descricao)) {
        erro(`${prefixo} a descrição tem de estar numa só linha.`);
      }
    }

    // categoria
    if (typeof projeto.categoria !== "string") {
      erro(`${prefixo} falta o campo \`categoria\`.`);
    } else if (!categoriasValidas.has(projeto.categoria)) {
      erro(
        `${prefixo} a categoria "${
          projeto.categoria
        }" não existe. Escolhe uma destas: ${[...categoriasValidas].join(
          ", "
        )}.`
      );
    }

    // site
    if (projeto.site !== undefined) {
      let valido = false;
      if (typeof projeto.site === "string") {
        try {
          valido = new URL(projeto.site).protocol === "https:";
        } catch {
          valido = false;
        }
      }
      if (!valido) {
        erro(
          `${prefixo} \`site\` tem de ser um link válido começado por https://.`
        );
      }
    }
  });

  return projetos.filter(
    (p) =>
      p &&
      typeof p.repositorio === "string" &&
      PADRAO_REPOSITORIO.test(p.repositorio)
  );
}

async function validarNoGitHub(projetos) {
  const cabecalhos = {
    Accept: "application/vnd.github+json",
    "User-Agent": "githubportugal-validador",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    cabecalhos.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (const projeto of projetos) {
    const prefixo = `${projeto.repositorio}:`;
    let resposta;
    try {
      resposta = await fetch(
        `https://api.github.com/repos/${projeto.repositorio}`,
        {
          headers: cabecalhos,
        }
      );
    } catch (e) {
      erro(
        `${prefixo} não foi possível contactar a API do GitHub (${e.message}).`
      );
      continue;
    }

    if (resposta.status === 404) {
      erro(`${prefixo} o repositório não existe ou não é público.`);
      continue;
    }
    if (!resposta.ok) {
      erro(
        `${prefixo} a API do GitHub respondeu com o estado ${resposta.status}.`
      );
      continue;
    }

    const repo = await resposta.json();

    if (repo.private) {
      erro(`${prefixo} o repositório é privado.`);
    }
    if (repo.full_name !== projeto.repositorio) {
      aviso(
        `${prefixo} o nome canónico no GitHub é ${repo.full_name}. Atualiza o campo \`repositorio\`.`
      );
    }
    if (repo.fork) {
      aviso(
        `${prefixo} o repositório é um fork. Prefere o repositório original.`
      );
    }
    if (repo.archived) {
      aviso(`${prefixo} o repositório está arquivado.`);
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

  const projetos = validarFormato(dados);

  if (process.argv.includes("--github") && erros.length === 0) {
    await validarNoGitHub(projetos);
  }

  avisos.forEach((m) => anotar("warning", m));
  erros.forEach((m) => anotar("error", m));

  if (erros.length > 0) {
    console.log(`\n${erros.length} erro(s) em ${ficheiroRelativo}.`);
    process.exit(1);
  }

  console.log(`✔ ${ficheiroRelativo} é válido (${projetos.length} projetos).`);
}

main();
