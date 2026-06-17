# Velô Sprint - Configurador de Veículo Elétrico

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

---

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
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

Os scripts disponíveis são:

```bash
npm run dev           # Inicia o servidor de desenvolvimento local (Vite)
npm run build         # Gera a build de produção da aplicação
npm run lint          # Executa o ESLint para verificar a qualidade de código
npm run test          # Executa a suite de testes unitários com Vitest
npm run test:e2e      # Executa os testes de ponta a ponta com Playwright
npm run pw:install    # Instala os navegadores do Playwright necessários para rodar testes E2E localmente
```

---

## CI/CD (Integração e Entrega Contínua)

O projeto possui um pipeline de CI/CD configurado através do GitHub Actions no arquivo [.github/workflows/ci.yml](file:///c:/automatizai/velo/.github/workflows/ci.yml).

O pipeline é disparado a cada `push` na branch `main` e executa as seguintes etapas sequenciais:

1. **Unit Tests (Testes Unitários)**:
   - Configura o ambiente Node.js na versão `24`.
   - Instala as dependências do projeto através de `yarn install --frozen-lockfile`.
   - Executa os testes unitários (`yarn test` rodando com o Vitest).

2. **Build & Deploy Preview**:
   - Depende de `Unit Tests`.
   - Realiza a build e o deploy de visualização (preview) na Vercel.
   - Extrai a URL gerada dinamicamente pelo deploy de preview.

3. **E2E Tests (Testes de Ponta a Ponta)**:
   - Depende de `Build & Deploy Preview`.
   - Instala a dependência do Playwright (Chromium) no ambiente de execução.
   - Executa os testes automatizados de ponta a ponta (`yarn playwright test`) apontando para a URL de preview gerada no passo anterior.
   - Em caso de falha ou cancelamento do job, realiza o upload do relatório HTML de erros (`playwright-report`) para os artefatos do GitHub.
   - Realiza o upload dos resultados do teste no **TestDino** utilizando `tdpw`.

4. **Build & Deploy Production (Deploy em Produção)**:
   - Depende da finalização com sucesso de `E2E Tests`.
   - Compila a build de produção e faz o deploy oficial para a Vercel usando a flag `--prod`.

### Segredos de Repositório (Secrets) Necessários no GitHub

Para o funcionamento correto de todas as etapas do pipeline de CI/CD, é preciso configurar as seguintes variáveis/segredos nas configurações de CI/CD do repositório no GitHub:

* **Vercel**:
  * `VERCEL_TOKEN`: Token de autenticação da Vercel.
  * `VERCEL_PROJECT_ID`: ID do projeto na Vercel.
  * `VERCEL_ORG_ID`: ID da organização na Vercel.
* **Supabase (Testes Unitários / Geral)**:
  * `VITE_SUPABASE_URL`: URL da API do projeto Supabase.
  * `VITE_SUPABASE_PUBLISHABLE_KEY`: Chave anônima pública.
  * `VITE_SUPABASE_PROJECT_ID`: ID do projeto.
  * `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço secreta.
* **Supabase (Testes E2E / Preview)**:
  * `VITE_SUPABASE_URL_PREVIEW`: URL da API do projeto Supabase de Preview.
  * `VITE_SUPABASE_PUBLISHABLE_KEY_PREVIEW`: Chave anônima pública de Preview.
  * `VITE_SUPABASE_PROJECT_ID_PREVIEW`: ID do projeto Supabase de Preview.
  * `SUPABASE_SERVICE_ROLE_KEY_PREVIEW`: Chave de serviço secreta de Preview.
* **TestDino (Métricas de Teste)**:
  * `TT_TOKEN`: Token de API do TestDino.