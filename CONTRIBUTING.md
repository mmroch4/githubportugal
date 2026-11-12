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
- `src/lib/projetos.ts` — lê a lista de projetos e junta-lhe os dados da API do GitHub.
- `scripts/validar-projetos.mjs` — valida `data/projetos.yml` (usado pela GitHub Action).

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

## Sugerir mantenedores

Conheces um mantenedor português de projetos open source? Abre uma issue com o nome e o perfil no GitHub. Em breve vamos ter uma página dedicada a mantenedores.

## Comunidade

Tens dúvidas? Fala connosco no [Discord](https://discord.com/invite/cnJdppDkUp) ou no [WhatsApp](https://chat.whatsapp.com/EfKv6GPEgd89XgYXhiAhFk).
