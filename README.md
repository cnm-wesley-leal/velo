# Velô Sprint — Configurador de Veículo Elétrico

Aplicação web em React para configuração e compra do veículo elétrico **Velô Sprint**.

## Sobre o Projeto

Uma SPA (Single Page Application) que permite:
- Personalizar cores, rodas e opcionais do veículo
- Calcular preços em tempo real
- Realizar pedidos com análise de crédito
- Consultar status de pedidos

**Especificações do Velô Sprint:** 450 km de autonomia | 0-100 km/h em 3.2s | 500 cv

---

## Stack Tecnológica

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Estado** | Zustand (global), React Hook Form (formulários) |
| **Validação** | Zod |
| **Data Fetching** | TanStack Query |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Testes Unitários** | Vitest |
| **Testes E2E** | Playwright |
| **CI/CD** | GitHub Actions |
| **Deploy** | Vercel |

---

## Instalação

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn dev
```

Acesse: `http://localhost:8080`

---

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Escolha um nome e senha para o banco
4. Aguarde a criação (~2 minutos)

### 2. Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_PROJECT_ID="seu_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_anon_publica"
VITE_SUPABASE_URL="https://seu_project_id.supabase.co"
```

> Encontre essas informações em: **Project Settings → API**

### 3. Deploy (banco + functions)

```bash
# Instalar CLI
yarn add supabase -D

# Login e vincular projeto
yarn supabase login
yarn supabase link --project-ref SEU_PROJECT_ID

# Aplicar migrações (cria tabelas e RLS)
supabase db push

# Deploy das Edge Functions
supabase functions deploy
```

Pronto! O banco e as functions estarão configurados.

---

## Estrutura Principal

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes React
│   ├── configurator/   # Configurador do carro
│   ├── landing/        # Landing page
│   └── ui/             # Componentes shadcn/ui
├── store/           # Estado global (Zustand)
├── hooks/           # Hooks customizados
└── integrations/    # Cliente Supabase
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/configure` | Configurador do veículo |
| `/order` | Checkout/Pedido |
| `/success` | Confirmação do pedido |
| `/lookup` | Consulta de pedidos |

---

## Modelo de Preços

- **Preço base:** R$ 40.000
- **Rodas Sport:** +R$ 2.000
- **Precision Park:** +R$ 5.500
- **Flux Capacitor:** +R$ 5.000
- **Financiamento:** 12x com juros de 2% a.m.

---

## Banco de Dados

**Tabela `orders`** — campos principais:
- `order_number` — Formato: VLO-XXXXXX
- `color`, `wheel_type`, `optionals` — Configuração
- `customer_name`, `customer_email`, `customer_cpf` — Cliente
- `payment_method`, `total_price` — Pagamento
- `status` — pending, approved, rejected, analysis

---

## Análise de Crédito

| Score | Resultado |
|-------|-----------|
| > 700 | Aprovado |
| 501-700 | Em análise |
| ≤ 500 | Reprovado |

*Se entrada ≥ 50% do total, aprova mesmo com score < 700*

---

## Fluxo Principal

```
Landing → Configurador → Checkout → Análise de Crédito → Confirmação
```

---

## Scripts

```bash
yarn dev              # Inicia o servidor de desenvolvimento local (Vite)
yarn build            # Gera a build de produção da aplicação
yarn lint             # Executa o ESLint para verificar a qualidade de código
yarn test             # Executa a suite de testes unitários com Vitest
yarn test:e2e         # Executa os testes de ponta a ponta com Playwright
yarn pw:install       # Instala os navegadores do Playwright necessários para rodar testes E2E localmente
```

---

## CI/CD — Integração e Entrega Contínua

Esta seção documenta a pipeline de CI/CD implementada com **GitHub Actions**, cobrindo conceitos, arquitetura, gatilhos e relatórios de testes.

### O que é CI/CD?

**CI (Integração Contínua)** é a prática de integrar código frequentemente em um repositório compartilhado, onde cada integração é verificada por uma build automatizada e testes. O objetivo é detectar erros rapidamente.

**CD (Entrega/Deploy Contínuo)** é a extensão do CI que automatiza a entrega do software validado para um ambiente de produção ou staging.

No projeto, o CI/CD é gerenciado pelo **GitHub Actions**, uma plataforma de automação integrada ao GitHub que permite criar workflows definidos em arquivos YAML.

---

### Arquivos de Workflow

O projeto possui **dois workflows** independentes:

| Arquivo | Finalidade |
|---|---|
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Pipeline principal: testes + build + deploy |
| [`.github/workflows/ci-scheduled.yml`](.github/workflows/ci-scheduled.yml) | Pipeline agendada: apenas testes (sem deploy) |

---

### Conceitos Utilizados

#### Gatilhos (`on`)

O bloco `on` define **quando** um workflow é disparado. O projeto utiliza três tipos:

```yaml
on:
  push:               # 1. Por push de código
    branches:
      - main
  workflow_dispatch:  # 2. Manualmente, pelo painel do GitHub
    inputs:
      motivo:
        description: 'Motivo da execução manual'
  schedule:           # 3. Automaticamente, por agendamento (cron)
    - cron: '0 6 * * 1-5'
```

| Gatilho | Quando Dispara | Arquivo |
|---|---|---|
| `push` | A cada push na branch `main` | `ci.yml` |
| `workflow_dispatch` | Manualmente, pelo painel do GitHub Actions | `ci.yml` e `ci-scheduled.yml` |
| `schedule` | Segunda a sexta às 03h BRT (06h UTC), automaticamente | `ci-scheduled.yml` |

**Sintaxe Cron:**
```
┌── minuto (0-59)
│  ┌── hora (0-23)
│  │  ┌── dia do mês (1-31)
│  │  │  ┌── mês (1-12)
│  │  │  │  ┌── dia da semana (0-7, dom=0 ou 7)
│  │  │  │  │
0  6  *  *  1-5
```
O agendamento `0 6 * * 1-5` significa: **todo dia de semana (seg–sex) às 06:00 UTC**.

---

#### Jobs

Um **job** é um conjunto de steps que roda em um runner (máquina virtual). Jobs são executados **em paralelo por padrão**, mas podem ser sequenciados com `needs`.

```yaml
jobs:
  unit-tests:          # Job 1: testes unitários
    runs-on: ubuntu-latest

  build-preview:       # Job 2: aguarda unit-tests
    needs: [unit-tests]

  e2e-tests:           # Job 3: aguarda build-preview
    needs: [build-preview]

  build-production:    # Job 4: aguarda e2e-tests
    needs: [e2e-tests]
```

**Diagrama da pipeline principal (`ci.yml`):**

```
push / workflow_dispatch
         │
         ▼
   ┌─────────────┐
   │ unit-tests  │  ← Vitest (testes unitários)
   └──────┬──────┘
          │ (needs)
          ▼
   ┌──────────────────┐
   │  build-preview   │  ← Build + Deploy Preview (Vercel)
   └────────┬─────────┘
            │ (needs + output: deployment-url)
            ▼
   ┌─────────────┐
   │  e2e-tests  │  ← Playwright contra URL de preview
   └──────┬──────┘
          │ (needs)
          ▼
   ┌──────────────────────┐
   │  build-production    │  ← Deploy Produção (Vercel)
   └──────────────────────┘
```

**Diagrama da pipeline agendada (`ci-scheduled.yml`):**

```
schedule (cron) / workflow_dispatch
         │
         ▼
   ┌─────────────┐
   │ unit-tests  │  ← Vitest (testes unitários)
   └──────┬──────┘
          │ (needs)
          ▼
   ┌─────────────┐
   │  e2e-tests  │  ← Playwright (sem deploy)
   └─────────────┘
```

---

#### Steps

Cada job é composto por **steps** (passos) executados sequencialmente. Um step pode ser:

- **`uses`**: chama uma **Action** pré-construída do marketplace do GitHub
- **`run`**: executa comandos shell diretamente

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4        # Action: faz checkout do repositório

  - name: Setup Node
    uses: actions/setup-node@v4      # Action: instala o Node.js
    with:
      node-version: '24'
      cache: 'yarn'                  # Cache automático de dependências

  - name: Install Dependencies
    run: yarn install --frozen-lockfile  # Comando shell

  - name: Run Unit Tests
    run: yarn test --reporter=default --reporter=json --outputFile=vitest-report/results.json
```

---

#### Artefatos (Artifacts)

Artefatos são **arquivos gerados durante a pipeline** que ficam armazenados no GitHub e podem ser baixados posteriormente. São usados para preservar relatórios de teste, builds, logs, etc.

```yaml
- name: Upload Vitest Report
  if: ${{ !cancelled() }}          # Executa sempre (sucesso ou falha)
  uses: actions/upload-artifact@v4
  with:
    name: vitest-report-${{ github.run_number }}  # Nome único por execução
    path: vitest-report/                           # Pasta gerada pelo Vitest
    retention-days: 30                             # Mantido por 30 dias
```

O projeto publica dois artefatos em cada execução:

| Artefato | Conteúdo | Gerado por |
|---|---|---|
| `vitest-report-{N}` | `results.json` com resultados dos testes unitários | Vitest |
| `playwright-report-{N}` | Relatório HTML interativo com capturas de tela e traces | Playwright |

**Como acessar os artefatos:**
1. Acesse o repositório no GitHub
2. Clique em **Actions**
3. Selecione uma execução do workflow
4. Role até a seção **Artifacts** no final da página
5. Clique no artefato desejado para baixar o `.zip`

---

#### Secrets (Segredos)

Secrets são **variáveis de ambiente cifradas** armazenadas nas configurações do repositório. Nunca ficam expostas nos logs da pipeline.

```yaml
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}  # Referência ao secret
```

**Configuração:** `GitHub → Repositório → Settings → Secrets and variables → Actions`

Os secrets utilizados no projeto:

| Secret | Descrição |
|---|---|
| `VERCEL_TOKEN` | Token de autenticação da Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |
| `VERCEL_ORG_ID` | ID da organização na Vercel |
| `VITE_SUPABASE_URL` | URL da API do Supabase (produção) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anônima pública do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço secreta do Supabase |
| `VITE_SUPABASE_URL_PREVIEW` | URL do Supabase (ambiente de preview/testes E2E) |
| `VITE_SUPABASE_PUBLISHABLE_KEY_PREVIEW` | Chave anônima pública (preview) |
| `VITE_SUPABASE_PROJECT_ID_PREVIEW` | ID do projeto Supabase (preview) |
| `SUPABASE_SERVICE_ROLE_KEY_PREVIEW` | Chave de serviço (preview) |
| `TT_TOKEN` | Token de API do TestDino |
| `PREVIEW_URL` | URL fixa do ambiente de preview (usado no workflow agendado) |

---

#### Cache

O cache acelera as execuções ao reutilizar arquivos entre runs. O projeto usa dois tipos:

```yaml
# Cache do yarn (gerenciado automaticamente pelo setup-node)
- uses: actions/setup-node@v4
  with:
    cache: 'yarn'

# Cache dos browsers do Playwright (evita download a cada run)
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/yarn.lock') }}
```

---

#### Outputs entre Jobs

O job `build-preview` passa a URL de deploy para o job `e2e-tests` via **outputs**:

```yaml
build-preview:
  outputs:
    deployment-url: ${{ steps.deploy.outputs.deployment-url }}  # Declaração

e2e-tests:
  needs: [build-preview]
  steps:
    - run: yarn playwright test
      env:
        BASE_URL: ${{ needs.build-preview.outputs.deployment-url }}  # Consumo
```

---

#### Variáveis de Contexto

O GitHub Actions disponibiliza variáveis de contexto que podem ser usadas nos workflows:

| Variável | Descrição | Exemplo de uso |
|---|---|---|
| `github.run_number` | Número sequencial da execução | `vitest-report-42` |
| `runner.os` | Sistema operacional do runner | `Linux` |
| `github.sha` | Hash do commit que disparou a execução | Rastreabilidade |
| `github.actor` | Usuário que disparou o workflow | Notificações |

---

### Relatórios de Testes

#### Testes Unitários — Vitest

Configuração em [`vitest.config.ts`](vitest.config.ts):

```ts
reporters: ['default', 'json'],
outputFile: {
  json: 'vitest-report/results.json'
}
```

O arquivo `results.json` gerado contém:
- Total de testes executados
- Testes passados, falhos e ignorados
- Duração de cada teste
- Mensagens de erro detalhadas em caso de falha

#### Testes E2E — Playwright

Configuração em [`playwright.config.ts`](playwright.config.ts):

```ts
reporter: [
  ['html', { outputDir: 'playwright-report' }],
  ['json', { outputFile: 'playwright-report/results.json' }]
]
```

O relatório HTML do Playwright (pasta `playwright-report/`) inclui:
- Lista de todos os testes com status
- Capturas de tela dos momentos de falha
- **Trace viewer**: gravação passo a passo de cada teste
- Vídeos de execução (quando configurado)

> **Os relatórios são publicados em TODA execução**, independente de sucesso ou falha. A condição `if: ${{ !cancelled() }}` garante que o upload só é ignorado se o job for cancelado manualmente.

---

### Como Executar Manualmente

1. Acesse o repositório no GitHub
2. Clique na aba **Actions**
3. No menu lateral esquerdo, selecione **"Continuous Integration"** ou **"Scheduled Tests"**
4. Clique no botão **"Run workflow"** (canto superior direito da lista de execuções)
5. Preencha o campo "Motivo" (opcional) e clique em **"Run workflow"**

A execução aparecerá na lista em segundos.

---

### Ferramentas Utilizadas

| Ferramenta | Versão | Papel na Pipeline |
|---|---|---|
| **GitHub Actions** | — | Plataforma de CI/CD |
| **Vitest** | ^4.x | Execução de testes unitários |
| **Playwright** | ^1.60 | Execução de testes E2E |
| **Vercel CLI** | ^52.x | Build e deploy automatizados |
| **TestDino (`tdpw`)** | ^1.x | Publicação de métricas de teste |
| **Node.js** | 24 | Runtime de execução |
| **Yarn** | (via Corepack) | Gerenciador de pacotes com cache |