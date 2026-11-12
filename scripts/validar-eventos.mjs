#!/usr/bin/env node
// Valida o ficheiro data/eventos.yml.
//
// Uso:
//   node scripts/validar-eventos.mjs

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ficheiroRelativo = "data/eventos.yml";
const ficheiro = path.join(raiz, ficheiroRelativo);

const CAMPOS_OBRIGATORIOS = [
  "nome",
  "descricao",
  "tipo",
  "inicio",
  "cidade",
  "site",
];
const CAMPOS_PERMITIDOS = new Set([
  ...CAMPOS_OBRIGATORIOS,
  "fim",
  "formato",
  "gratuito",
]);
const FORMATOS = new Set(["presencial", "online", "híbrido"]);
const PADRAO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const DESCRICAO_MIN = 10;
const DESCRICAO_MAX = 200;
const NOME_MAX = 80;
const DURACAO_MAX_DIAS = 31;

const emActions = process.env.GITHUB_ACTIONS === "true";
const erros = [];
const avisos = [];
const erro = (m) => erros.push(m);
const aviso = (m) => avisos.push(m);

/** Confirma que a data existe (por exemplo, rejeita 2026-02-30). */
function dataValida(texto) {
  if (typeof texto !== "string" || !PADRAO_DATA.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

function linkValido(texto) {
  if (typeof texto !== "string" || !texto.startsWith("https://")) return false;
  try {
    new URL(texto);
    return true;
  } catch {
    return false;
  }
}

function hojeEmPortugal() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

function validar(dados) {
  if (!dados || typeof dados !== "object") {
    erro("O ficheiro tem de ter as chaves `tipos` e `eventos`.");
    return 0;
  }

  const { tipos, eventos } = dados;

  if (!Array.isArray(tipos) || tipos.length === 0) {
    erro("`tipos` tem de ser uma lista com pelo menos um tipo de evento.");
  }
  const tiposValidos = new Set(
    Array.isArray(tipos) ? tipos.filter((t) => typeof t === "string") : []
  );

  if (!Array.isArray(eventos)) {
    erro("`eventos` tem de ser uma lista.");
    return 0;
  }

  const hoje = hojeEmPortugal();
  const vistos = new Map();

  eventos.forEach((e, indice) => {
    const nome =
      e && typeof e.nome === "string" ? e.nome : `evento n.º ${indice + 1}`;
    const prefixo = `${nome}:`;

    if (!e || typeof e !== "object" || Array.isArray(e)) {
      erro(
        `${prefixo} cada evento tem de ser um objeto com os campos ${CAMPOS_OBRIGATORIOS.join(
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

    validarTexto(prefixo, "nome", e.nome, 3, NOME_MAX);
    validarTexto(
      prefixo,
      "descricao",
      e.descricao,
      DESCRICAO_MIN,
      DESCRICAO_MAX
    );
    validarTexto(prefixo, "cidade", e.cidade, 2, 60);

    // tipo
    if (typeof e.tipo !== "string" || e.tipo.trim() === "") {
      erro(`${prefixo} falta o campo \`tipo\`.`);
    } else if (!tiposValidos.has(e.tipo)) {
      erro(
        `${prefixo} o tipo "${e.tipo}" não existe. Usa um destes: ${[
          ...tiposValidos,
        ].join(", ")}.`
      );
    }

    // datas
    if (e.inicio === undefined) {
      erro(`${prefixo} falta o campo \`inicio\`.`);
    } else if (!dataValida(e.inicio)) {
      erro(
        `${prefixo} \`inicio\` tem de ser uma data no formato AAAA-MM-DD, por exemplo 2027-05-06.`
      );
    }
    if (e.fim !== undefined && !dataValida(e.fim)) {
      erro(
        `${prefixo} \`fim\` tem de ser uma data no formato AAAA-MM-DD, por exemplo 2027-05-07.`
      );
    }
    if (dataValida(e.inicio) && dataValida(e.fim)) {
      if (e.fim < e.inicio) {
        erro(
          `${prefixo} \`fim\` (${e.fim}) é anterior a \`inicio\` (${e.inicio}).`
        );
      } else if (e.fim === e.inicio) {
        aviso(
          `${prefixo} \`fim\` é igual a \`inicio\`; para eventos de um dia podes tirar o campo \`fim\`.`
        );
      } else {
        const dias =
          (new Date(e.fim).getTime() - new Date(e.inicio).getTime()) /
          86_400_000;
        if (dias > DURACAO_MAX_DIAS) {
          erro(
            `${prefixo} o evento dura ${
              dias + 1
            } dias; o máximo é ${DURACAO_MAX_DIAS}.`
          );
        }
      }
    }
    if (dataValida(e.inicio)) {
      const fim = dataValida(e.fim) ? e.fim : e.inicio;
      if (fim < hoje) {
        aviso(
          `${prefixo} o evento já terminou (${fim}) e aparece só nos eventos passados.`
        );
      }
    }

    // formato
    if (e.formato !== undefined && !FORMATOS.has(e.formato)) {
      erro(`${prefixo} \`formato\` tem de ser presencial, online ou híbrido.`);
    }
    if (
      e.formato === "online" &&
      typeof e.cidade === "string" &&
      e.cidade !== "Online"
    ) {
      aviso(`${prefixo} eventos só online devem ter \`cidade: Online\`.`);
    }

    // gratuito
    if (e.gratuito !== undefined && typeof e.gratuito !== "boolean") {
      erro(`${prefixo} \`gratuito\` tem de ser true ou false.`);
    }

    // site
    if (e.site === undefined) {
      erro(`${prefixo} falta o campo \`site\`.`);
    } else if (!linkValido(e.site)) {
      erro(
        `${prefixo} \`site\` tem de ser um link válido começado por https://.`
      );
    }

    // repetidos
    if (typeof e.nome === "string" && typeof e.inicio === "string") {
      const chave = `${e.nome.toLowerCase()}|${e.inicio}`;
      if (vistos.has(chave)) {
        erro(
          `${prefixo} o evento já está na lista (entrada n.º ${
            vistos.get(chave) + 1
          }).`
        );
      } else {
        vistos.set(chave, indice);
      }
    }
  });

  // Ordem: mais fácil de rever e de manter.
  for (let i = 1; i < eventos.length; i++) {
    const a = eventos[i - 1];
    const b = eventos[i];
    if (dataValida(a?.inicio) && dataValida(b?.inicio) && b.inicio < a.inicio) {
      aviso(
        `${b.nome}: os eventos devem estar por ordem de data de início; este deve vir antes de ${a.nome}.`
      );
    }
  }

  return eventos.length;
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

  const total = validar(dados);

  avisos.forEach((m) => anotar("warning", m));
  erros.forEach((m) => anotar("error", m));

  if (erros.length > 0) {
    console.log(`\n${erros.length} erro(s) em ${ficheiroRelativo}.`);
    process.exit(1);
  }

  console.log(`✔ ${ficheiroRelativo} é válido (${total} eventos).`);
}

main();
