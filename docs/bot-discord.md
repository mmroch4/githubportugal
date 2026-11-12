# Bot do Discord

O bot do GitHub Portugal faz duas coisas no [servidor do Discord](https://discord.com/invite/cnJdppDkUp):

1. **Anuncia novidades.** Quando um projeto (`data/projetos.yml`), um evento (`data/eventos.yml`) ou um artigo (`src/content/artigos/`) novo chega à `main`, a GitHub Action [Anunciar no Discord](../.github/workflows/anunciar-discord.yml) publica uma mensagem num canal através de um webhook. Espera até o site publicado mostrar a novidade (no máximo 15 minutos), para o link já funcionar. Eventos que já terminaram não são anunciados, e se um push trouxer mais de 10 novidades de uma vez não anuncia nada, para não inundar o canal.
2. **Responde a comandos.**
   - `/ranking [cidade] [ordem]`: os 10 primeiros do [ranking](https://githubportugal.com/ranking).
   - `/evento [cidade] [tipo]`: os próximos 5 eventos da [agenda](https://githubportugal.com/eventos).
   - `/projeto <pesquisa>`: procura no [diretório de projetos](https://githubportugal.com/projetos).

Não há nenhum processo sempre ligado: o Discord envia cada comando para `https://githubportugal.com/api/discord` ([`src/app/api/discord/route.ts`](../src/app/api/discord/route.ts)), que corre no Vercel e responde com os dados do site.

## Ficheiros

| Ficheiro | Para quê |
| --- | --- |
| `src/app/api/discord/route.ts` | Endpoint de interações: valida a assinatura do Discord e responde aos comandos. |
| `src/lib/discord.ts` | Verificação da assinatura Ed25519 e utilitários. |
| `scripts/discord/comandos.mjs` | Lista dos comandos (nome, descrição, opções). |
| `scripts/discord/registar-comandos.mjs` | Envia a lista de comandos ao Discord. |
| `scripts/discord/anunciar.mjs` | Encontra as novidades entre dois commits e publica-as no webhook. |

Para mudar um comando, altera `scripts/discord/comandos.mjs` e a resposta em `route.ts`. Quando a alteração chega à `main`, a Action [Registar comandos do Discord](../.github/workflows/registar-comandos-discord.yml) atualiza os comandos sozinha.

Para ver os anúncios que seriam feitos entre dois commits, sem enviar nada:

```sh
node scripts/discord/anunciar.mjs --antes <commit> --depois <commit> --simular
```

## Configuração (uma vez)

São precisos uma aplicação no Discord, um webhook e cinco segredos.

### 1. Criar a aplicação e o bot

1. Abre o [Discord Developer Portal](https://discord.com/developers/applications) e carrega em **New Application**. Dá-lhe o nome `GitHub Portugal` e aceita os termos.
2. Em **General Information**, copia o **Application ID** e a **Public Key**. Opcionalmente, põe o logótipo (`public/icon-512.png`) como ícone.
3. Em **Bot**, carrega em **Reset Token** e copia o token. Não o partilhes com ninguém. Os comandos não precisam de nenhum *Privileged Gateway Intent*, por isso deixa-os todos desligados.
4. Em **Installation**, em **Installation Contexts**, deixa só **Guild Install**. Em **Default Install Settings > Guild Install**, escolhe os *scopes* `applications.commands` e `bot`, sem permissões extra. Copia o **Install Link**, abre-o e adiciona o bot ao servidor do GitHub Portugal.

### 2. Segredos

No Vercel (**Project > Settings > Environment Variables**, ambiente *Production*):

| Nome | Valor |
| --- | --- |
| `DISCORD_PUBLIC_KEY` | A Public Key do passo 1.2 |

Depois de a guardar, faz **Redeploy** do último deploy de produção para a variável ser lida.

No GitHub (**Settings > Secrets and variables > Actions > New repository secret**):

| Nome | Valor |
| --- | --- |
| `DISCORD_APPLICATION_ID` | O Application ID do passo 1.2 |
| `DISCORD_BOT_TOKEN` | O token do passo 1.3 |
| `DISCORD_WEBHOOK_URL` | O URL do webhook do passo 4 |

### 3. Ligar os comandos ao site

1. No Developer Portal, em **General Information**, escreve em **Interactions Endpoint URL**: `https://githubportugal.com/api/discord` e carrega em **Save Changes**. O Discord testa o endereço nesse momento; se der erro, confirma que `DISCORD_PUBLIC_KEY` está no Vercel e que fizeste o redeploy.
2. No GitHub, em **Actions > Registar comandos do Discord**, carrega em **Run workflow**. Os comandos aparecem no servidor logo a seguir (às vezes é preciso reiniciar o Discord).

### 4. Canal de anúncios

1. No servidor do Discord, escolhe (ou cria) o canal dos anúncios, por exemplo `#novidades`.
2. Em **Editar canal > Integrações > Webhooks > Novo webhook**, chama-lhe `GitHub Portugal`, põe o logótipo como imagem e carrega em **Copiar URL do webhook**.
3. Guarda esse URL no segredo `DISCORD_WEBHOOK_URL` do GitHub (passo 2).

A partir daí, cada projeto, evento ou artigo novo que entre na `main` é anunciado nesse canal.
