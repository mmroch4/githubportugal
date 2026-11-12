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
- `src/lib/projetos.ts` — lê a lista de projetos e junta-lhe os dados da API do GitHub.
- `src/lib/mantenedores.ts` — lê a lista de mantenedores, junta-lhe os perfis do GitHub e liga cada pessoa aos seus projetos.
- `scripts/validar-projetos.mjs` e `scripts/validar-mantenedores.mjs` — validam os ficheiros de dados (usados pela GitHub Action).

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

## Comunidade

Tens dúvidas? Fala connosco no [Discord](https://discord.com/invite/cnJdppDkUp) ou no [WhatsApp](https://chat.whatsapp.com/EfKv6GPEgd89XgYXhiAhFk).
