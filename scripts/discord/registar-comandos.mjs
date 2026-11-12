// Regista (ou atualiza) os comandos do bot no Discord.
//
// Precisa de DISCORD_APPLICATION_ID e DISCORD_BOT_TOKEN. Corre na GitHub Action
// "Registar comandos do Discord"; também podes corrê-lo à mão:
//   DISCORD_APPLICATION_ID=... DISCORD_BOT_TOKEN=... node scripts/discord/registar-comandos.mjs
//
// Com --validar, só confirma que a lista de comandos é válida (não precisa de segredos).

import { comandos } from "./comandos.mjs";

const NOME = /^[-_\p{L}\p{N}]{1,32}$/u;

function validar() {
  const erros = [];
  const nomes = new Set();
  for (const c of comandos) {
    if (!NOME.test(c.name) || c.name !== c.name.toLowerCase())
      erros.push(`Nome inválido: ${c.name}`);
    if (nomes.has(c.name)) erros.push(`Comando repetido: ${c.name}`);
    nomes.add(c.name);
    if (!c.description || c.description.length > 100)
      erros.push(
        `/${c.name}: a descrição tem de ter entre 1 e 100 caracteres.`
      );
    for (const o of c.options ?? []) {
      if (!NOME.test(o.name) || o.name !== o.name.toLowerCase())
        erros.push(`/${c.name}: nome de opção inválido: ${o.name}`);
      if (!o.description || o.description.length > 100)
        erros.push(
          `/${c.name} ${o.name}: descrição com mais de 100 caracteres.`
        );
      if ((o.choices ?? []).length > 25)
        erros.push(`/${c.name} ${o.name}: mais de 25 escolhas.`);
    }
  }
  return erros;
}

const erros = validar();
if (erros.length) {
  console.error(erros.join("\n"));
  process.exit(1);
}

if (process.argv.includes("--validar")) {
  console.log(`${comandos.length} comandos válidos.`);
  process.exit(0);
}

const aplicacao = process.env.DISCORD_APPLICATION_ID;
const token = process.env.DISCORD_BOT_TOKEN;
if (!aplicacao || !token) {
  console.log(
    "Faltam DISCORD_APPLICATION_ID e DISCORD_BOT_TOKEN; os comandos não foram registados."
  );
  process.exit(0);
}

const resposta = await fetch(
  `https://discord.com/api/v10/applications/${aplicacao}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comandos),
  }
);

if (!resposta.ok) {
  console.error(
    `O Discord recusou os comandos (${
      resposta.status
    }): ${await resposta.text()}`
  );
  process.exit(1);
}

const registados = await resposta.json();
console.log(
  `Comandos registados: ${registados.map((c) => `/${c.name}`).join(", ")}`
);
