#!/usr/bin/env node
// Valida o ficheiro data/empresas.yml.
//
// Uso:
//   node scripts/validar-empresas.mjs            valida o formato do ficheiro
//   node scripts/validar-empresas.mjs --github   também confirma na API do GitHub que
//                                                cada organização existe e tem código aberto
//
// Com --github, define GITHUB_TOKEN para evitar o limite de pedidos sem autenticação.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ficheiroRelativo = "data/empresas.yml";
const ficheiro = path.join(raiz, ficheiroRelativo);

const CAMPOS_OBRIGATORIOS = ["nome", "github", "descricao", "setor", "cidades"];
const CAMPOS_PERMITIDOS = new Set([
  ...CAMPOS_OBRIGATORIOS,
  "site",
  "carreiras",
]);
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

function validarLink(prefixo, campo, valor) {
  if (valor === undefined) return;
  if (!linkValido(valor)) {
    erro(
      `${prefixo} \`${campo}\` tem de ser um link válido começado por https://.`
    );
  }
}

function validarFormato(dados) {
  if (!dados || typeof dados !== "object") {
    erro("O ficheiro tem de ter as chaves `setores` e `empresas`.");
    return [];
  }

  const { setores, empresas } = dados;

  if (!Array.isArray(setores) || setores.length === 0) {
    erro("`setores` tem de ser uma lista com pelo menos um setor.");
  }
  const setoresValidos = new Set(
    Array.isArray(setores) ? setores.filter((s) => typeof s === "string") : []
  );

  if (!Array.isArray(empresas)) {
    erro("`empresas` tem de ser uma lista.");
    return [];
  }

  const nomes = new Map();
  const logins = new Map();

  empresas.forEach((e, indice) => {
    const nome =
      e && typeof e.nome === "string" ? e.nome : `empresa n.º ${indice + 1}`;
    const prefixo = `${nome}:`;

    if (!e || typeof e !== "object" || Array.isArray(e)) {
      erro(
        `${prefixo} cada empresa tem de ser um objeto com os campos ${CAMPOS_OBRIGATORIOS.join(
          ", "
        )}.`
      );
      return;
    }

    for (const campo of Object.keys(e)) {
      if (!CAMPOS_PERMITIDOS.has(campo)) {
        erro(
          `${prefixo} o campo \`${campo}\` não é permitido. Usa apenas: ${[
            ...CAMPOS_PERMITIDOS,
          ].join(", ")}.`
        );
      }
    }

    validarTexto(prefixo, "nome", e.nome, 2, 80);
    validarTexto(
      prefixo,
      "descricao",
      e.descricao,
      DESCRICAO_MIN,
      DESCRICAO_MAX
    );

    if (typeof e.setor !== "string" || e.setor.trim() === "") {
      erro(`${prefixo} falta o campo \`setor\`.`);
    } else if (!setoresValidos.has(e.setor)) {
      erro(
        `${prefixo} o setor "${e.setor}" não existe. Usa um destes: ${[
          ...setoresValidos,
        ].join(", ")}.`
      );
    }

    if (!Array.isArray(e.cidades) || e.cidades.length === 0) {
      erro(
        `${prefixo} \`cidades\` tem de ser uma lista com pelo menos uma cidade, por exemplo [Lisboa, Porto].`
      );
    } else {
      const vistas = new Set();
      e.cidades.forEach((c) => {
        validarTexto(prefixo, "cidades", c, 2, 60);
        if (typeof c === "string") {
          if (vistas.has(c.toLowerCase())) {
            erro(`${prefixo} a cidade ${c} está repetida.`);
          }
          vistas.add(c.toLowerCase());
        }
      });
    }

    validarLink(prefixo, "site", e.site);
    validarLink(prefixo, "carreiras", e.carreiras);

    if (typeof e.github !== "string" || !PADRAO_LOGIN.test(e.github)) {
      erro(
        `${prefixo} \`github\` tem de ser só o nome da organização (por exemplo feedzai), sem @ nem https://github.com/.`
      );
    } else {
      const chave = e.github.toLowerCase();
      if (logins.has(chave)) {
        erro(
          `${prefixo} a organização ${e.github} já é usada por ${logins.get(
            chave
          )}.`
        );
      } else {
        logins.set(chave, nome);
      }
    }

    if (typeof e.nome === "string") {
      const chave = e.nome.toLowerCase();
      if (nomes.has(chave)) {
        erro(
          `${prefixo} a empresa já está na lista (entrada n.º ${
            nomes.get(chave) + 1
          }).`
        );
      } else {
        nomes.set(chave, indice);
      }
    }
  });

  return empresas;
}

async function validarNoGitHub(empresas) {
  const cabecalhos = {
    Accept: "application/vnd.github+json",
    "User-Agent": "githubportugal-validador",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    cabecalhos.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  async function pedir(url) {
    const resposta = await fetch(url, { headers: cabecalhos });
    return {
      estado: resposta.status,
      corpo: resposta.ok ? await resposta.json() : null,
    };
  }

  for (const e of empresas) {
    const prefixo = `${e.nome}:`;
    try {
      const { estado, corpo: conta } = await pedir(
        `https://api.github.com/users/${e.github}`
      );
      if (estado === 404) {
        erro(`${prefixo} a conta ${e.github} não existe no GitHub.`);
        continue;
      }
      if (!conta) {
        erro(`${prefixo} a API do GitHub respondeu com o estado ${estado}.`);
        continue;
      }
      if (conta.type !== "Organization") {
        erro(
          `${prefixo} ${conta.login} é uma conta pessoal. Indica a organização da empresa no GitHub.`
        );
        continue;
      }
      if (conta.login !== e.github) {
        aviso(
          `${prefixo} a organização no GitHub escreve-se ${conta.login}. Atualiza o campo \`github\`.`
        );
      }

      // Precisa de pelo menos um repositório público que não seja fork.
      const { corpo: repos } = await pedir(
        `https://api.github.com/orgs/${conta.login}/repos?type=sources&per_page=1`
      );
      if (Array.isArray(repos) && repos.length === 0) {
        erro(
          `${prefixo} a organização ${conta.login} não tem repositórios públicos próprios. Só entram empresas que publicam código aberto.`
        );
      }
    } catch (err) {
      erro(
        `${prefixo} não foi possível contactar a API do GitHub (${err.message}).`
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

  const empresas = validarFormato(dados);

  if (process.argv.includes("--github") && erros.length === 0) {
    await validarNoGitHub(empresas);
  }

  avisos.forEach((m) => anotar("warning", m));
  erros.forEach((m) => anotar("error", m));

  if (erros.length > 0) {
    console.log(`\n${erros.length} erro(s) em ${ficheiroRelativo}.`);
    process.exit(1);
  }

  console.log(`✔ ${ficheiroRelativo} é válido (${empresas.length} empresas).`);
}

main();
