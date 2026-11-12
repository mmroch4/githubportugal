# Como contribuir

Obrigado pelo interesse em contribuir para o GitHub Portugal! Todas as contribuições são bem-vindas: correções de texto, melhorias de design, novas funcionalidades ou sugestões de projetos e mantenedores portugueses.

## Antes de começar

- Procura nas [issues](https://github.com/mmroch4/githubportugal/issues) se já existe algo sobre o mesmo tema.
- Para alterações grandes, abre primeiro uma issue para discutirmos a ideia.
- Os textos do site estão em **português de Portugal** (pt-PT). Evita formas do português do Brasil (por exemplo, "partilhar" em vez de "compartilhar", "ficheiro" em vez de "arquivo").

## Correr o projeto localmente

Precisas do [Node.js](https://nodejs.org/) 20.9 ou superior e do [Yarn](https://classic.yarnpkg.com/) 1.x.

```bash
git clone https://github.com/mmroch4/githubportugal.git
cd githubportugal
yarn install
yarn dev
```

O site fica disponível em <http://localhost:3000>.

Antes de abrires um pull request, confirma que o projeto compila e que o lint passa:

```bash
yarn lint
yarn build
```

## Estrutura

- `src/app/` — páginas (App Router do Next.js). A página "Sobre" está em `src/app/sobre/about.mdx`.
- `src/components/` — componentes reutilizáveis.
- `src/config/metadata.ts` — metadados do site e links da comunidade (Discord, WhatsApp, repositório).
- `data/projetos.yml` — lista de projetos do diretório.
- `data/mantenedores.yml` — lista de mantenedores.
- `data/eventos.yml` — agenda de eventos e `data/comunidades.yml` — diretório de comunidades.
- `data/empresas.yml` — diretório de empresas tech que publicam código aberto.
- `src/content/artigos/` — artigos da comunidade, um ficheiro `.mdx` por artigo.
- `data/ranking.json` — ranking gerado pela GitHub Action (não edites à mão) e `data/ranking-excluidos.yml` — quem pediu para sair do ranking.
- `src/lib/projetos.ts` — lê a lista de projetos e junta-lhe os dados da API do GitHub.
- `src/lib/issues.ts` — procura nos projetos do diretório as issues para primeiras contribuições.
- `src/lib/mantenedores.ts` — lê a lista de mantenedores, junta-lhe os perfis do GitHub e liga cada pessoa aos seus projetos.
- `src/lib/ranking.ts` — lê o ranking e retira quem pediu para sair.
- `src/lib/eventos.ts` e `src/lib/comunidades.ts` — leem a agenda e o diretório de comunidades.
- `src/lib/empresas.ts` — lê o diretório de empresas e junta-lhe os dados das organizações no GitHub.
- `src/lib/artigos.ts` e `src/lib/devto.ts` — leem os artigos da comunidade e as publicações do dev.to.
- `scripts/validar-projetos.mjs` e `scripts/validar-mantenedores.mjs` — validam os ficheiros de dados (usados pela GitHub Action).
- `scripts/validar-eventos.mjs` e `scripts/validar-comunidades.mjs` — validam a agenda e as comunidades.
- `scripts/validar-empresas.mjs` — valida o diretório de empresas.
- `scripts/validar-artigos.mjs` — valida os artigos.
- `scripts/gerar-ranking.mjs` — gera o ranking (corre todas as semanas numa GitHub Action).

## Abrir um pull request

1. Faz um fork do repositório e cria um ramo a partir do `main`.
2. Faz as tuas alterações em commits pequenos e com mensagens claras.
3. Abre um pull request a explicar o que mudou e porquê. Se a alteração for visual, junta uma captura de ecrã.

## Adicionar um projeto

O [diretório de projetos](https://githubportugal.com/projetos) é gerado a partir do ficheiro [`data/projetos.yml`](./data/projetos.yml). Para adicionar um projeto, não precisas de correr o site: basta editar esse ficheiro e abrir um pull request.

### Que projetos entram

- Projetos open source, com repositório **público no GitHub**.
- Criados ou mantidos por programadores portugueses, ou por empresas e organizações portuguesas.
- Projetos ativos ou com valor histórico para a comunidade. Projetos arquivados aparecem com essa indicação.
- Prefere o repositório original a um fork.

### Como adicionar

1. Abre o ficheiro [`data/projetos.yml`](./data/projetos.yml) e carrega no ícone do lápis para o editares diretamente no GitHub (o GitHub cria o fork por ti).
2. Acrescenta uma entrada no fim da lista `projetos`:

   ```yaml
   - repositorio: dono/nome-do-repositorio
     descricao: Uma frase em português de Portugal sobre o que o projeto faz.
     categoria: Ferramentas de programação
     site: https://exemplo.pt # opcional
   ```

3. Abre um pull request com o título `Adicionar dono/nome-do-repositorio`.

| Campo | Obrigatório | Regras |
| --- | --- | --- |
| `repositorio` | Sim | No formato `dono/nome`, sem `https://github.com/`. Não pode estar repetido. |
| `descricao` | Sim | Uma frase em pt-PT, numa só linha, entre 10 e 200 caracteres. |
| `categoria` | Sim | Uma das categorias listadas no topo do ficheiro. Se nenhuma encaixa, propõe uma nova no pull request. |
| `site` | Não | Link para o site do projeto, começado por `https://`. |

Não escrevas as estrelas, a linguagem nem a data da última atividade: o site lê-as da API do GitHub e atualiza-as automaticamente.

### Validação automática

Cada pull request que altera `data/projetos.yml` é verificado por uma GitHub Action, que confirma o formato do ficheiro e que cada repositório existe e é público. Se algo falhar, a Action explica o que corrigir.

Para validares localmente antes de abrir o pull request:

```bash
yarn validar-projetos            # valida o formato
yarn validar-projetos --github   # também confirma os repositórios na API do GitHub
```

### Estrelas e dados do GitHub

A página `/projetos` pede os dados de cada repositório à API do GitHub e volta a pedi-los, no máximo, de 6 em 6 horas. Sem autenticação, a API permite 60 pedidos por hora, o que chega para correr o projeto localmente. Em produção, define a variável de ambiente `GITHUB_TOKEN` com um [token pessoal](https://github.com/settings/personal-access-tokens) sem permissões adicionais (só leitura de repositórios públicos): o site passa a usar a API GraphQL e faz um pedido por cada 50 projetos.

## Adicionar um mantenedor

A [página de mantenedores](https://githubportugal.com/mantenedores) é gerada a partir do ficheiro [`data/mantenedores.yml`](./data/mantenedores.yml). Cada pessoa tem um perfil próprio com a fotografia, a bio e os projetos que mantém no diretório.

### Quem entra

- Programadores portugueses que criam ou mantêm projetos open source no GitHub.
- A lista é só de quem quer aparecer: **adiciona-te a ti próprio**, ou adiciona outra pessoa apenas com a autorização dela.
- Para saíres da lista, abre um pull request a remover a tua entrada ou uma [issue](https://github.com/mmroch4/githubportugal/issues) a pedi-lo.

### Como adicionar

1. Se o teu projeto ainda não está no diretório, [adiciona-o primeiro](#adicionar-um-projeto) (podes fazê-lo no mesmo pull request).
2. Abre o ficheiro [`data/mantenedores.yml`](./data/mantenedores.yml) e acrescenta uma entrada no fim da lista `mantenedores`:

   ```yaml
   - github: o-teu-utilizador
     projetos: # opcional
       - organizacao/projeto
     bio: Uma frase sobre ti em português de Portugal. # opcional
   ```

3. Abre um pull request com o título `Adicionar @o-teu-utilizador aos mantenedores`.

| Campo | Obrigatório | Regras |
| --- | --- | --- |
| `github` | Sim | O teu nome de utilizador no GitHub, sem `@`. Tem de ser uma conta pessoal, não uma organização. |
| `projetos` | Não | Repositórios de `data/projetos.yml` que manténs fora da tua conta pessoal, por exemplo numa organização. Os projetos da tua conta pessoal (`o-teu-utilizador/...`) entram automaticamente. |
| `bio` | Não | Uma frase em pt-PT, numa só linha, até 160 caracteres. Se não a escreveres, aparece a bio do teu perfil no GitHub. |

O nome, a fotografia, a localização e os seguidores são lidos do teu perfil no GitHub e atualizados de 6 em 6 horas. Para os mudares, muda-os no GitHub.

A mesma GitHub Action dos projetos valida este ficheiro. Para validares localmente:

```bash
yarn validar-mantenedores            # valida o formato
yarn validar-mantenedores --github   # também confirma as contas na API do GitHub
```

## Primeiras contribuições

A página [Primeiras contribuições](https://githubportugal.com/primeiras-contribuicoes) junta as issues abertas dos projetos do diretório que estão marcadas como boas para quem está a começar ou como pedidos de ajuda. Não há nenhum ficheiro para editar: a lista é lida da API do GitHub e atualizada de 6 em 6 horas.

### Como pôr as issues do teu projeto na lista

1. Confirma que o projeto está no [diretório](#adicionar-um-projeto) e não está arquivado.
2. Marca as issues com uma destas etiquetas (maiúsculas e hífenes não importam):
   - `good first issue`, `first-timers-only` ou `beginner friendly`, para tarefas simples e bem explicadas, boas para uma primeira contribuição;
   - `help wanted`, para tarefas em que precisas de ajuda, mesmo que exijam mais experiência.
3. Escreve na issue o que é preciso fazer e onde está o código a alterar. Uma issue bem descrita recebe muito mais ajuda.

As issues que já têm alguém atribuído não aparecem, para ninguém começar a trabalhar numa tarefa já ocupada. Cada projeto mostra, no máximo, 30 issues.

## Ranking

O [ranking](https://githubportugal.com/ranking) mostra as 100 pessoas com mais contribuições públicas no último ano e com mais seguidores, em Portugal e em Lisboa, no Porto, em Braga e em Coimbra. Não há nenhum ficheiro onde te inscreveres: a GitHub Action [Atualizar ranking](./.github/workflows/atualizar-ranking.yml) corre todas as segundas-feiras, pesquisa os perfis com localização em Portugal e guarda o resultado em [`data/ranking.json`](./data/ranking.json). Não edites esse ficheiro à mão.

### Como entrar

- Escreve a tua cidade ou `Portugal` no campo de localização do teu perfil no GitHub (por exemplo, `Braga, Portugal`).
- A pesquisa do GitHub devolve, no máximo, as 1000 contas com mais seguidores por cada localização pesquisada. Quem tem muito poucos seguidores pode ficar de fora.
- Contam as contribuições públicas dos últimos 12 meses: commits, pull requests, issues e revisões em repositórios públicos.

### Sair do ranking

Acrescenta o teu nome de utilizador à lista `excluidos` em [`data/ranking-excluidos.yml`](./data/ranking-excluidos.yml) e abre um pull request, ou abre uma [issue](https://github.com/mmroch4/githubportugal/issues) a pedir para sair. Deixas de aparecer no site assim que a alteração entrar, sem esperar pela próxima atualização.

### Gerar o ranking localmente

```bash
GITHUB_TOKEN=o-teu-token yarn gerar-ranking   # gera data/ranking.json (demora alguns minutos)
yarn gerar-ranking --validar                  # só valida data/ranking-excluidos.yml
```

## Adicionar um evento

A [agenda de eventos](https://githubportugal.com/eventos) é gerada a partir do ficheiro [`data/eventos.yml`](./data/eventos.yml). Os eventos que já terminaram saem da agenda sozinhos e passam para a lista de eventos passados, por isso não precisas de os apagar.

### Que eventos entram

- Conferências, meetups, workshops e hackathons de tecnologia que decorrem em Portugal, ou online e organizados por comunidades portuguesas.
- Eventos abertos ao público, gratuitos ou pagos. Formações comerciais e eventos internos de empresas não entram.
- Para meetups que se repetem todos os meses, adiciona cada sessão com data marcada, ou adiciona a comunidade ao [diretório de comunidades](#adicionar-uma-comunidade).

### Como adicionar

1. Abre o ficheiro [`data/eventos.yml`](./data/eventos.yml) e carrega no ícone do lápis para o editares no GitHub.
2. Acrescenta uma entrada à lista `eventos`, na posição certa por data de início:

   ```yaml
   - nome: Nome do Evento 2027
     descricao: Uma frase em português de Portugal sobre o evento.
     tipo: Conferência
     inicio: 2027-05-06
     fim: 2027-05-07 # opcional, só para eventos de mais de um dia
     cidade: Porto
     formato: presencial # opcional: presencial, online ou híbrido
     gratuito: true # opcional
     site: https://exemplo.pt
   ```

3. Abre um pull request com o título `Adicionar evento Nome do Evento 2027`.

| Campo | Obrigatório | Regras |
| --- | --- | --- |
| `nome` | Sim | Nome do evento, com o ano se for uma edição anual. |
| `descricao` | Sim | Uma frase em pt-PT, numa só linha, entre 10 e 200 caracteres. |
| `tipo` | Sim | Um dos tipos listados no topo do ficheiro: Conferência, Meetup, Workshop ou Hackathon. |
| `inicio` | Sim | Data no formato `AAAA-MM-DD`. |
| `fim` | Não | Data de fim no mesmo formato, para eventos de vários dias (até 31). |
| `cidade` | Sim | Cidade onde decorre. Para eventos só online, escreve `Online`. |
| `formato` | Não | `presencial` (por omissão), `online` ou `híbrido`. |
| `gratuito` | Não | `true` se a entrada for gratuita. |
| `site` | Sim | Página oficial do evento ou da inscrição, começada por `https://`. |

A agenda também está disponível como calendário em <https://githubportugal.com/eventos/calendario.ics>, que podes subscrever no Google Calendar, no Outlook ou no Calendário da Apple.

## Adicionar uma comunidade

O [diretório de comunidades](https://githubportugal.com/comunidades) é gerado a partir do ficheiro [`data/comunidades.yml`](./data/comunidades.yml).

### Que comunidades entram

- Meetups, grupos de utilizadores, associações, fóruns e hackerspaces de tecnologia em Portugal, ou comunidades online portuguesas.
- Só comunidades ativas, com atividade no último ano. Se uma comunidade da lista parou, abre um pull request a removê-la.
- Comunidades abertas a qualquer pessoa. Empresas e cursos pagos não entram.

### Como adicionar

1. Abre o ficheiro [`data/comunidades.yml`](./data/comunidades.yml) e acrescenta uma entrada à lista `comunidades`:

   ```yaml
   - nome: Nome da Comunidade
     descricao: Uma frase em português de Portugal sobre a comunidade.
     categoria: Linguagens e frameworks
     cidade: Braga # opcional; sem cidade, é uma comunidade nacional ou online
     site: https://exemplo.pt
     github: organizacao-no-github # opcional
   ```

2. Abre um pull request com o título `Adicionar comunidade Nome da Comunidade`.

| Campo | Obrigatório | Regras |
| --- | --- | --- |
| `nome` | Sim | Nome da comunidade. Não pode estar repetido. |
| `descricao` | Sim | Uma frase em pt-PT, numa só linha, entre 10 e 200 caracteres. |
| `categoria` | Sim | Uma das categorias listadas no topo do ficheiro. Se nenhuma encaixa, propõe uma nova no pull request. |
| `cidade` | Não | Cidade onde a comunidade se reúne. Deixa vazio para comunidades nacionais ou só online. |
| `site` | Sim | Site, página no Meetup, Luma, Discord ou outra página da comunidade, começada por `https://`. |
| `github` | Não | Conta ou organização da comunidade no GitHub, sem `@`. |

### Validação automática

A mesma GitHub Action dos projetos valida os dois ficheiros. Para validares localmente:

```bash
yarn validar-eventos
yarn validar-comunidades            # valida o formato
yarn validar-comunidades --github   # também confirma as contas do GitHub
```

## Adicionar uma empresa

O [diretório de empresas](https://githubportugal.com/empresas) é gerado a partir do ficheiro [`data/empresas.yml`](./data/empresas.yml). O número de repositórios e os repositórios em destaque são lidos automaticamente da API do GitHub.

### Que empresas entram

- Empresas de tecnologia com equipa de engenharia em Portugal, seja a sede ou um escritório.
- Com uma organização no GitHub e pelo menos um repositório público próprio (que não seja fork). A ideia é mostrar quem partilha código, não ser uma lista de todas as empresas do país.
- Podes adicionar a empresa onde trabalhas. Não é preciso autorização formal, mas usa só informação pública.

### Como adicionar

1. Abre o ficheiro [`data/empresas.yml`](./data/empresas.yml) e acrescenta uma entrada à lista `empresas`:

   ```yaml
   - nome: Nome da Empresa
     github: organizacao-no-github
     descricao: Uma frase em português de Portugal sobre o que a empresa faz.
     setor: Fintech e pagamentos
     cidades: [Lisboa, Porto]
     site: https://exemplo.pt # opcional
     carreiras: https://exemplo.pt/carreiras # opcional
   ```

2. Abre um pull request com o título `Adicionar empresa Nome da Empresa`.

| Campo | Obrigatório | Regras |
| --- | --- | --- |
| `nome` | Sim | Nome da empresa. Não pode estar repetido. |
| `github` | Sim | Organização da empresa no GitHub, sem `@`. Tem de ser uma organização, não uma conta pessoal. |
| `descricao` | Sim | Uma frase em pt-PT, numa só linha, entre 10 e 200 caracteres. |
| `setor` | Sim | Um dos setores listados no topo do ficheiro. Se nenhum encaixa, propõe um novo no pull request. |
| `cidades` | Sim | Lista das cidades portuguesas onde a empresa tem escritório. |
| `site` | Não | Site da empresa, começado por `https://`. Sem site, usa o que está na organização do GitHub. |
| `carreiras` | Não | Página de ofertas de emprego, começada por `https://`. |

### Validação automática

A GitHub Action "Validar dados" confirma o formato, que a organização existe e que tem código aberto. Para validares localmente:

```bash
yarn validar-empresas            # valida o formato
yarn validar-empresas --github   # também confirma as organizações no GitHub
```

## Escrever um artigo

A [secção de artigos](https://githubportugal.com/artigos) publica textos escritos pela comunidade. Cada artigo é um ficheiro MDX (Markdown com alguns extras) na pasta [`src/content/artigos`](./src/content/artigos). Não precisas de correr o site para propor um.

### Que artigos entram

- Textos originais em **português de Portugal**, que tratam o leitor por "tu".
- Sobre programação, open source, projetos portugueses, carreira ou a comunidade tech em Portugal.
- Tutoriais com código que funciona, histórias de projetos, experiências a contribuir ou a manter software.
- Não entram textos promocionais, ofertas de emprego nem conteúdo copiado. Se o artigo já foi publicado noutro sítio, indica-o no fim do texto.

### Como propor

1. Copia o ficheiro [`src/content/artigos/_modelo.mdx`](./src/content/artigos/_modelo.mdx) para um ficheiro novo na mesma pasta, por exemplo `como-publiquei-a-minha-primeira-biblioteca.mdx`. O nome do ficheiro é o endereço do artigo (`/artigos/como-publiquei-a-minha-primeira-biblioteca`): usa só letras minúsculas sem acentos, números e hífenes.
2. Preenche o cabeçalho entre as duas linhas `---`:

   ```yaml
   ---
   titulo: Como publiquei a minha primeira biblioteca
   descricao: Uma ou duas frases que resumem o artigo.
   data: 2026-11-12
   autor: o-teu-login-do-github
   etiquetas: [open source, javascript]
   ---
   ```

3. Escreve o texto por baixo, em Markdown. O título já vem do cabeçalho, por isso usa `##` e `###` para as secções.
4. Abre um pull request com o título `Artigo: Título do artigo`. Alguém da comunidade revê o texto e pode sugerir alterações.

| Campo | Obrigatório | Regras |
| --- | --- | --- |
| `titulo` | Sim | Entre 5 e 100 caracteres. |
| `descricao` | Sim | Numa só linha, entre 20 e 220 caracteres. Aparece na lista de artigos e nas redes sociais. |
| `data` | Sim | Data de publicação, no formato `AAAA-MM-DD`. |
| `autor` | Não | O teu login do GitHub, sem `@`. Sem autor, o artigo aparece como escrito pela Equipa GitHub Portugal. |
| `etiquetas` | Não | Até 5 palavras curtas, por exemplo `[open source, javascript]`. |
| `atualizado` | Não | Data da última revisão importante, no formato `AAAA-MM-DD`. |

Em MDX, os caracteres `<` e `{` têm significado especial. Se precisares deles no texto, escreve `\<` e `\{`, ou põe-nos entre acentos graves, como código.

### Publicar no dev.to

Se preferires publicar no [dev.to](https://dev.to), usa a etiqueta **#githubportugal**: a página de artigos mostra sozinha as publicações recentes com essa etiqueta (e com #portugal), atualizadas de 6 em 6 horas.

### Validação automática

A mesma GitHub Action dos dados valida o cabeçalho de cada artigo e se o MDX compila. Para validares localmente:

```bash
yarn validar-artigos            # valida o cabeçalho e o MDX
yarn validar-artigos --github   # também confirma a conta do autor no GitHub
```

## Comunidade

Tens dúvidas? Fala connosco no [Discord](https://discord.com/invite/cnJdppDkUp) ou no [WhatsApp](https://chat.whatsapp.com/EfKv6GPEgd89XgYXhiAhFk).
