# Relatório Técnico — Quiz Personalizado
## Melhoria Incremental de uma Aplicação Web React

**Autor:** Smilley  
**Data:** 10 de junho de 2026  
**Repositório:** Quiz-Personalizado  
**Stack final:** React 19 · Vite · Fastify 5 · Prisma 6 · PostgreSQL 16 · Podman · Vitest · Playwright · GitHub Actions

---

## Índice

1. [Contexto e Objectivos](#1-contexto-e-objectivos)
2. [Arquitectura Global](#2-arquitectura-global)
3. [Fase 1 — Fundação: qualidade de código e estrutura](#3-fase-1--fundação-qualidade-de-código-e-estrutura)
4. [Fase 2 — UX, Acessibilidade e SEO](#4-fase-2--ux-acessibilidade-e-seo)
5. [Fase 3 — Backend: Fastify + Prisma + PostgreSQL](#5-fase-3--backend-fastify--prisma--postgresql)
6. [Polimento UX — Melhoria Intercalar](#6-polimento-ux--melhoria-intercalar)
7. [Fase 4 — Containerização com Podman](#7-fase-4--containerização-com-podman)
8. [Fase 5 — Leaderboard e Autenticação no Frontend](#8-fase-5--leaderboard-e-autenticação-no-frontend)
9. [Fase 6 — Testes e CI](#9-fase-6--testes-e-ci)
10. [Conclusão e Análise Crítica](#10-conclusão-e-análise-crítica)

---

## 1. Contexto e Objectivos

### 1.1 Ponto de partida

O projeto **Quiz Personalizado** existia como uma Single Page Application (SPA) básica desenvolvida com React 19 e Vite. O estado inicial era funcional — o utilizador podia responder a perguntas de cultura geral sobre Angola e África, com suporte a temas visuais e ajudas (50/50, saltar). Porém, a aplicação carecia de todas as características que distinguem um projecto académico de um produto de qualidade:

| Característica | Estado inicial |
|---|:---:|
| React 19 + Vite | ✅ |
| Dados estáticos em JS | ✅ |
| Temas visuais (3) | ✅ |
| Ajudas 50/50 e saltar | ✅ |
| Backend / API | ❌ |
| Persistência de scores | ❌ |
| Autenticação JWT | ❌ |
| Leaderboard | ❌ |
| Acessibilidade (WCAG) | ❌ mínima |
| SEO / Meta tags | ❌ |
| Testes automatizados | ❌ |
| CI/CD | ❌ |
| Containerização | ❌ |

### 1.2 Princípio orientador

O desenvolvimento foi organizado em **seis fases sequenciais**, cada uma correspondendo a um commit atómico e a uma secção deste relatório. O princípio é o dos *small increments* do Agile: cada fase entrega valor real e verificável antes de avançar para a seguinte.

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
fundação   a11y    backend  deploy  auth/lb   testes
```

---

## 2. Arquitectura Global

Antes de detalhar cada fase, importa compreender a arquitectura final do sistema para que cada decisão técnica faça sentido no seu contexto.

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (cliente)                     │
│  React 19 SPA  ·  React Router v7  ·  react-hot-toast   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST + JWT
┌──────────────────────▼──────────────────────────────────┐
│               Nginx 1.27-alpine (reverse proxy)          │
│   /          → serve dist/ (static)                     │
│   /api/*     → proxy → backend:3000                     │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│           Fastify 5  (apps/backend)                      │
│  Plugins: @fastify/jwt (RS256)  ·  @fastify/rate-limit   │
│  Routes: /api/auth  /api/questions  /api/scores          │
│           /api/leaderboard                              │
│  ORM: Prisma 6                                          │
└────────────┬────────────────────────────────────────────┘
             │ prisma client
┌────────────▼────────────────────────────────────────────┐
│           PostgreSQL 16-alpine                           │
│  Modelos: User · Score · Question · Category             │
└─────────────────────────────────────────────────────────┘

Todos os serviços correm em containers Podman (rootless)
sobre uma rede interna isolada `quiz_net`.
```

### 2.1 Estrutura de monorepo

A partir da Fase 3, o projecto adoptou a estrutura de *Yarn workspaces*:

```
quiz-personalizado/
├── apps/
│   ├── frontend/          (React + Vite)
│   └── backend/           (Fastify + Prisma)
├── e2e/                   (Playwright)
├── scripts/               (generate-keys.js, start.sh, build.sh)
├── .github/workflows/     (ci.yml)
├── Containerfile.frontend
├── Containerfile.backend
├── podman-compose.yml
└── nginx.conf
```

---

## 3. Fase 1 — Fundação: qualidade de código e estrutura

**Commit:** `77c909b feat: restructure frontend foundation — env, router, error boundary`

### 3.1 O problema

Uma aplicação React sem routing real, sem variáveis de ambiente separadas e sem isolamento de erros é tecnicamente frágil. Qualquer funcionalidade nova — backend, autenticação, leaderboard — requer estas fundações. Construir sobre uma base instável multiplica o custo de cada fase seguinte.

### 3.2 Decisões técnicas

#### React Router DOM v7

O projecto usava navegação simulada com estado local. A substituição por React Router DOM introduziu:

- **Rotas reais** (`/`, `/quiz`, `/resultados`, `/leaderboard`, `*`), com URLs partilháveis e histórico do browser funcional.
- **Separação de páginas** em `src/pages/` — cada rota é um módulo independente, testável isoladamente.
- O router v7 (React Router DOM 7) foi escolhido por ser a versão estável actual com suporte a React 19 e data loaders nativos.

#### Variáveis de ambiente via `.env` (Vite VITE_*)

Configurações que mudam entre ambientes (URL da API, número máximo de perguntas) foram extraídas para `.env`:

```env
VITE_APP_NAME="Quiz Personalizado"
VITE_APP_VERSION="1.0.0"
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MAX_QUESTIONS=20
```

O prefixo `VITE_` é obrigatório para que o Vite exponha a variável ao bundle do browser (variáveis sem prefixo ficam apenas no processo de build). O ficheiro `.env` é ignorado pelo git; existe um `.env.example` como template.

#### Error Boundary global

React não intercepta erros de rendering por omissão — um crash num componente desce em branco para o utilizador. O componente `ErrorBoundary` (classe React, pois `componentDidCatch` não existe em componentes funcionais) envolve toda a árvore e mostra uma mensagem de recuperação amigável em vez de uma página em branco.

#### PropTypes

Sem TypeScript, `PropTypes` é o mecanismo de contrato de interface. Em cada componente, o bloco `Component.propTypes` documenta os tipos esperados e gera avisos no console em desenvolvimento quando são violados. Isto actua como documentação executável e detecta erros de integração cedo.

#### Estrutura de contexto

O estado global do quiz foi encapsulado em `QuizContext` com `useReducer`-like logic: `startQuiz`, `answerQuestion`, `advanceQuestion`, `activateFiftyFifty`, `activateSkip`, `finishQuiz`, `resetQuiz`. Este padrão isola o estado da UI e prepara a extensão para contextos de autenticação futuros.

### 3.3 Resultado

```
src/
├── context/QuizContext.jsx   — estado global do quiz
├── pages/                    — HomePage, QuizPage, ResultsPage, LeaderboardPage, NotFoundPage
├── components/               — componentes reutilizáveis
└── App.jsx                   — router + providers
```

---

## 4. Fase 2 — UX, Acessibilidade e SEO

**Commit:** `2d57b47 feat: a11y, SEO meta tags, responsive polish`

### 4.1 O problema

Acessibilidade (a11y) e SEO são características que *não se retrofitam facilmente* — mudar a semântica HTML de uma aplicação já construída requer rever cada componente. A estratégia correcta é fazê-las desde cedo. Para uma aplicação universitária, demonstrar conformidade com WCAG 2.1 AA é um diferencial técnico relevante.

### 4.2 Decisões técnicas

#### `react-helmet-async` — títulos dinâmicos por rota

Cada página define o seu próprio `<title>` e meta tags:

```jsx
<Helmet>
  <title>Leaderboard — Quiz de Cultura Geral</title>
  <meta name="description" content="Os melhores resultados..." />
</Helmet>
```

`react-helmet-async` foi escolhido em vez do `react-helmet` original por suporte a React 19 e rendering concorrente sem *race conditions* no servidor.

#### ARIA roles e labels

Todos os elementos interactivos receberam atributos semânticos:
- `role="progressbar"` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax` na barra de progresso
- `aria-labelledby` nos `<section>` e `<main>` para definir o título acessível
- `aria-live="polite"` nas zonas que actualizam dinamicamente (pontuação, timer)
- `aria-pressed` nos botões de opção seleccionados
- `aria-hidden="true"` em decorações e emojis que não acrescentam informação

#### Loading Skeleton

Transições entre estados de carregamento com o componente `SkeletonCard`:
- `variant="question"` — esqueleto de card de pergunta
- `variant="leaderboard"` — esqueleto de tabela com linhas animadas

A animação de shimmer é puramente CSS (sem JavaScript), usando `@keyframes` e `linear-gradient`.

#### PWA: `manifest.json`

O ficheiro `public/manifest.json` define nome, ícones e `display: standalone`, permitindo ao browser oferecer a instalação da app. Sem service worker (considerado fora do escopo da versão actual), mas a fundação PWA está em place.

#### `robots.txt` e `sitemap.xml`

Servidos como ficheiros estáticos em `public/`:
- `robots.txt` permite indexação de todas as páginas públicas e bloqueia `/resultados` (conteúdo pessoal sem valor SEO)
- `sitemap.xml` lista as rotas públicas com frequência e prioridade

#### Página 404 dedicada

`NotFoundPage.jsx` usa `<Route path="*">` para interceptar qualquer URL não reconhecido, com link de retorno à página inicial.

### 4.3 Resultado

A aplicação passou a ter títulos correctos por rota, navegação acessível por teclado, e uma base de acessibilidade compatível com leitores de ecrã.

---

## 5. Fase 3 — Backend: Fastify + Prisma + PostgreSQL

**Commit:** `97bf4ff feat: backend api — fastify, prisma ORM, postgres`

### 5.1 O problema

Uma aplicação de quiz sem backend é um jogo de salão: os scores perdem-se ao fechar o browser, não há leaderboard real, e qualquer utilizador pode manipular os dados. O backend transforma a aplicação num produto com persistência real.

### 5.2 Decisões técnicas

#### Monorepo com Yarn Workspaces

```json
// package.json raiz
{ "workspaces": ["apps/*"] }
```

O monorepo unifica `frontend` e `backend` num único repositório com um único `yarn install`. As vantagens são:
- Dependências partilhadas instaladas uma vez
- Scripts orquestrados na raiz (`yarn dev`, `yarn build`, `yarn test`)
- Builds de container mais simples (ambos os pacotes acessíveis)

#### Fastify 5

**Por que Fastify em vez de Express?**

| Critério | Express | Fastify |
|---|---|---|
| Performance | ~15k req/s | ~30k req/s |
| Validação de input | manual | JSON Schema nativo |
| Tipagem | via @types | nativa |
| Plugins | middleware simples | sistema de plugins coeso |
| Maturidade | 2010 | 2016, v5 em 2024 |

A arquitectura de plugins do Fastify (`fastify-plugin` + `fp`) permite decorar a instância com `app.prisma`, `app.jwt`, `app.authenticate` de forma limpa e testável. O `buildApp(opts)` em `app.js` separa a criação da app da sua inicialização (padrão *app factory*), essencial para testes.

#### PostgreSQL + Prisma 6

**Por que PostgreSQL em vez de SQLite?**

SQLite seria mais simples, mas PostgreSQL foi escolhido por:
- Suporte nativo a tipos complexos (`String[]` para opções de pergunta)
- Índices descrescentes (`percentage(sort: Desc)`) para o leaderboard
- `onDelete: Cascade` para consistência referencial
- Alinhamento com ambientes de produção reais

**Prisma** oferece migrations versionadas, um cliente type-safe, e um CLI para gestão do esquema. O esquema final define quatro modelos:

```
User (id, username, email, password, createdAt)
  └── Score[] (id, userId, score, total, percentage, category, createdAt)

Question (id, question, options[], correctAnswer, explanation, hint, categoryId)
  └── Category (id, name)
```

#### JWT RS256 (assimétrico)

**Por que RS256 em vez de HS256?**

HS256 usa uma chave simétrica — o mesmo segredo para assinar e verificar. Num sistema com múltiplos serviços, qualquer serviço com capacidade de verificar pode também emitir tokens. RS256 usa um par de chaves RSA-2048:
- **Chave privada** (só no backend) → assina tokens
- **Chave pública** (pode ser distribuída) → verifica tokens

As chaves são geradas por `scripts/generate-keys.js` usando `node:crypto` nativo (sem dependências externas) e persistidas em `apps/backend/keys/` (ignorado pelo git). Para containers, são injectadas como variáveis de ambiente em Base64.

#### Rate Limiting

`@fastify/rate-limit` com dois níveis:
- **Global**: 100 req/min — protege contra abusos gerais
- **Auth routes**: 10 req/min — mitiga ataques de força bruta em `/login` e `/register`

O plugin usa `X-RateLimit-*` headers standard, compatíveis com proxies e load balancers.

#### Bcrypt (cost 12)

As passwords são sempre armazenadas como hash bcrypt com custo 12 (~250ms de hashing). O custo 12 é o compromisso actual entre segurança (resistência a ataques de dicionário acelerados por GPU) e UX (tempo de login aceitável).

Para prevenir *timing attacks* no login (que revelariam se um email existe ou não), o código executa sempre `bcrypt.compare`, mesmo quando o utilizador não existe, usando um hash fictício:

```js
const dummyHash = '$2a$12$placeholder...';
const hash = user?.password ?? dummyHash;
const valid = await bcrypt.compare(password, hash);
```

#### API REST

```
POST /api/auth/register   → { token, user }
POST /api/auth/login      → { token, user }
GET  /api/questions       → Question[]  (query: category, limit)
GET  /api/categories      → Category[]
POST /api/scores          → Score (requer JWT)
GET  /api/leaderboard     → top 10 entries
GET  /health              → { status: "ok", timestamp }
```

A validação de input é feita pelo JSON Schema nativo do Fastify em cada rota, devolvendo 400 automático com mensagem estruturada para qualquer campo inválido.

### 5.3 Resultado

Backend completo, seguro e testável, com API REST documentada por JSON Schemas e persistência em PostgreSQL.

---

## 6. Polimento UX — Melhoria Intercalar

**Commit:** `e368026 ux: professional polish — timer, keyboard nav, streak, confetti, share`

Esta fase não estava no plano original mas foi inserida entre a Fase 3 e a Fase 4 para elevar a qualidade percepcionada da aplicação antes da containerização.

### 6.1 Componentes adicionados

#### QuestionTimer (SVG circular)

Contador decrescente de 30 segundos por pergunta, implementado como SVG animado. Mudança de cor progressiva:
- Verde (>10s restantes)
- Amarelo (≤10s) — com transição CSS
- Vermelho pulsante (≤5s) — com `@keyframes pulse`

Quando o tempo esgota, a pergunta é registada como errada (`handleTimeUp`) e o quiz avança.

#### Navegação por teclado

Atalhos de teclado para acessibilidade e velocidade:
| Tecla | Acção |
|---|---|
| `1`–`4` | Seleccionar opção A–D |
| `H` | Activar ajuda 50/50 |
| `F` | Activar saltar |
| `S` | Partilhar resultado (na tela de resultados) |

#### Streak badge

Contador de respostas consecutivas correctas com animação de escala quando actualiza. A lógica reside no `QuizContext` — `answerQuestion` incrementa `streak` em acertos e repõe a zero em erros, mantendo `maxStreak` para as estatísticas finais.

#### Confetti

40 peças de confetti em 8 cores geradas dinamicamente via CSS, sem biblioteca externa. Activado quando o utilizador obtém ≥80% de aproveitamento.

#### Web Share API

Botão "Partilhar" na tela de resultados que usa `navigator.share()` quando disponível (mobile/desktop moderno) com fallback para `navigator.clipboard.writeText()`.

---

## 7. Fase 4 — Containerização com Podman

**Commit:** `8f9c09b feat: containerize full stack with podman and podman-compose`

### 7.1 O problema

"Funciona na minha máquina" é uma das frases mais comuns em ambientes de desenvolvimento. A containerização elimina este problema: qualquer máquina com Podman pode executar o sistema completo com um único comando.

### 7.2 Por que Podman em vez de Docker?

| Critério | Docker | Podman |
|---|---|---|
| Daemon root | Requer daemon root | Rootless por omissão |
| Segurança | Daemon com privilégios altos | Sem daemon, cada processo é filho do utilizador |
| Compatibilidade | OCI standard | OCI standard |
| Ambientes académicos/Linux | Requer configuração extra | Funciona out-of-the-box |

Em sistemas universitários Linux, Docker frequentemente requer permissões de administrador. Podman rootless corre com as permissões do utilizador normal, sem modificar o sistema.

### 7.3 Containerfile.frontend — build multi-stage

```
Stage 1 (build):  node:22-alpine
  └── yarn install + vite build
      ARG VITE_API_BASE_URL=/api  ← relativo, não hardcoded

Stage 2 (serve):  nginx:1.27-alpine
  └── Copia dist/ para /usr/share/nginx/html
      Usa nginx.conf customizado
```

O `nginx.conf` faz duas coisas críticas:
1. **SPA routing**: todas as rotas devolvem `index.html` (necessário para React Router funcionar em refresh directo)
2. **Proxy `/api`**: pedidos para `/api/*` são reencaminhados para `http://backend:3000`

```nginx
location /api {
    proxy_pass         http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

#### Por que `VITE_API_BASE_URL=/api` (relativo)?

Em desenvolvimento, o frontend e backend correm em portas diferentes (5173 e 3000), então `VITE_API_BASE_URL=http://localhost:3000/api`. Em produção, ambos estão atrás do mesmo Nginx, então `/api` (relativo) é suficiente e evita hardcoding de IPs/portas.

### 7.4 Containerfile.backend — multi-stage

```
Stage 1 (builder):  node:22-alpine
  └── yarn install + prisma generate

Stage 2 (runtime):  node:22-alpine (slim)
  └── Copia node_modules + src
      Utilizador não-root "fastify" (UID 1001)
      ENTRYPOINT: entrypoint.sh
```

O `entrypoint.sh` executa em sequência:
1. `prisma migrate deploy` — aplica migrations pendentes
2. Seed opcional se `SEED_DB=true`
3. `exec node src/server.js` — `exec` garante que o Node é o processo 1 (PID 1), recebendo sinais do container correctamente

O utilizador não-root `fastify` segue o princípio de *least privilege* — o processo não tem permissão para modificar o sistema operativo do container.

### 7.5 podman-compose.yml

```yaml
services:
  db:       postgres:16-alpine
  backend:  Containerfile.backend
  frontend: Containerfile.frontend

networks:
  quiz_net:  # rede interna, backend e db não são expostos ao exterior

volumes:
  quiz_postgres_data:  # dados do Postgres persistem entre restarts
```

Health checks em todos os serviços:
- `db`: `pg_isready`
- `backend`: `curl /health`
- `frontend`: `curl /`

O `frontend` tem `depends_on: backend: condition: service_healthy` — o Nginx só inicia depois do backend estar saudável.

### 7.6 scripts/start.sh

Script de bootstrap completo com flags:

```bash
./scripts/start.sh              # inicia tudo
./scripts/start.sh --build      # força rebuild das imagens
./scripts/start.sh --seed       # seed da base de dados após arranque
./scripts/start.sh --stop       # para todos os serviços
./scripts/start.sh --logs       # segue os logs em tempo real
./scripts/start.sh --status     # mostra estado de cada serviço
```

O script valida o ambiente (Podman instalado, variáveis obrigatórias), gera as chaves RSA se não existirem, e aguarda 90 segundos pelos health checks antes de declarar sucesso.

---

## 8. Fase 5 — Leaderboard e Autenticação no Frontend

**Commit:** `dc98ec1 feat: leaderboard page and auth flow`

### 8.1 O problema

O backend criado na Fase 3 não tinha qualquer integração com o frontend: as rotas de autenticação e scores existiam mas nunca eram chamadas. Esta fase fecha o ciclo — o utilizador pode criar conta, guardar scores, e ver-se no leaderboard.

### 8.2 Decisões técnicas

#### `src/lib/api.js` — cliente HTTP centralizado

Em vez de `fetch` espalhado pelo código, um módulo centralizado trata de:
- Prefixar todas as chamadas com `VITE_API_BASE_URL`
- Injectar o header `Authorization: Bearer <token>` automaticamente a partir do `localStorage`
- Converter respostas não-ok em `Error` com a mensagem da API

```js
const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('quiz_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
  return res.json();
}
```

#### `AuthContext` — estado global de autenticação

`AuthContext` complementa o `QuizContext` existente:
- `user` — objeto `{id, username, email}` ou null
- `token` — string JWT ou null
- `isLoggedIn` — booleano derivado
- `login()`, `register()`, `logout()`, `submitScore()`

O estado persiste em `localStorage` (`quiz_token` + `quiz_user`) para sobreviver a refreshes. Na inicialização, `loadStored()` tenta restaurar o estado com `JSON.parse` protegido por `try/catch` — dados corrompidos no localStorage não crasham a app.

#### `AuthModal` — modal acessível

O modal de autenticação segue as práticas de acessibilidade WCAG para diálogos:
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Foco automático no primeiro input ao abrir (`useRef` + `useEffect`)
- Tecla Escape fecha o modal (event listener limpo no unmount)
- Click no overlay fecha o modal

O componente tem dois modos em tabs (`Login` / `Registo`) com o mesmo formulário, evitando duplicação. Erros da API são apresentados num bloco com `role="alert"` para que leitores de ecrã os anunciem imediatamente.

#### `LeaderboardPage` — dados reais

A página substituiu o placeholder da Fase 1 por:
1. `useEffect` que chama `GET /api/leaderboard` ao montar
2. `SkeletonCard variant="leaderboard"` durante o carregamento
3. Tabela responsiva com medalhas 🥇🥈🥉 para o pódio, badges coloridos para a percentagem (verde/amarelo/vermelho), e timestamps relativos ("há 2h")
4. CTA de autenticação integrado no cabeçalho da página
5. Botão de actualização manual

#### Auto-save de scores

Em `ResultsPage`, um `useEffect` executado uma vez ao montar verifica se o utilizador está autenticado e chama `submitScore`:

```js
useEffect(() => {
  if (!isLoggedIn || quizQuestions.length === 0 || scoreSaved) return;
  submitScore(score, quizQuestions.length, category)
    .then(() => { setScoreSaved(true); toast.success('🏆 Score guardado!'); })
    .catch(() => toast.error('Não foi possível guardar o score.'));
}, [isLoggedIn]);
```

A categoria é detectada automaticamente: se todas as perguntas pertencem à mesma categoria, usa essa; caso contrário, usa `'todas'`.

O `ResultScreen` exibe três estados:
- `isLoggedIn && !scoreSaved` → spinner "A guardar…"
- `isLoggedIn && scoreSaved` → badge verde "✅ Score guardado no leaderboard!"
- `!isLoggedIn` → botão CTA "🔑 Guardar score no leaderboard"

---

## 9. Fase 6 — Testes e CI

**Commit:** `cc4228c feat: testing suite and github actions ci`

### 9.1 O problema

Sem testes, cada alteração ao código é um ato de fé. Com testes, é uma operação verificável. O CI garante que nenhum commit quebra a aplicação antes de chegar ao repositório principal.

### 9.2 Estratégia de testes

Foram adoptadas três camadas de testes, seguindo a pirâmide de testes:

```
        /\
       /E2E\       ← Playwright (2 suites)
      /------\
     / Integr.\    ← Vitest + Fastify inject (3 suites, 12 testes)
    /----------\
   /   Unitários\  ← Vitest + RTL (4 suites, 21 testes)
  /--------------\
```

**Unitários** → rápidos, focados, sem efeitos secundários  
**Integração** → testam rotas HTTP reais com mocks de base de dados  
**E2E** → testam o fluxo completo no browser real

### 9.3 Frontend — Vitest + React Testing Library

#### Configuração

```js
// vite.config.js
test: {
  environment: 'jsdom',     // simula o DOM do browser
  globals: true,            // describe/it/expect disponíveis sem import
  setupFiles: ['./src/test/setup.js'],  // carrega @testing-library/jest-dom
}
```

`jsdom` simula o browser em Node.js. `@testing-library/jest-dom` adiciona *matchers* como `toBeInTheDocument()`, `toHaveAttribute()`, `toBeDisabled()`.

**Filosofia do RTL:** testar como o utilizador interage, não como o componente é implementado. Por isso usa-se `getByRole('button', { name: /começar/i })` em vez de `querySelector('.btn-primary')`.

#### Suites criadas

| Suite | Testes | O que verifica |
|---|:---:|---|
| `WelcomeScreen.test.jsx` | 5 | Render, trim de nome, fallback "Anónimo", categorias, tema+limite |
| `ProgressBar.test.jsx` | 4 | Label, percentagem, atributos ARIA, 0% inicial |
| `AuthModal.test.jsx` | 6 | Tab padrão, tab registo, mudança de tab, Escape, erro API, sucesso |
| `ResultScreen.test.jsx` | 6 | Nome, total, restart, CTA guardar, badge guardado, onRestart |
| **Total** | **21** | **21/21 ✅** |

#### Mock da API no AuthModal

Os testes do `AuthModal` não devem fazer chamadas HTTP reais. O módulo `../../lib/api` é substituído por um mock:

```js
vi.mock('../../lib/api', () => ({
  api: { post: vi.fn() },
}));
```

Cada teste configura o comportamento: `api.post.mockResolvedValueOnce(...)` para sucesso, `api.post.mockRejectedValueOnce(...)` para erro.

### 9.4 Backend — Vitest + Fastify inject

#### Estratégia de mock do Prisma

O backend usa Prisma para aceder à base de dados. Correr testes contra uma base de dados real seria lento, frágil (dependeria de estado externo), e impossível sem PostgreSQL em CI sem serviços adicionais. A solução é mockar `@prisma/client`:

```js
// vi.hoisted() garante que mockDb está disponível na factory do vi.mock,
// que é hoisted (movida para o topo do ficheiro) pelo Vitest
const mockDb = vi.hoisted(() => ({
  user: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));
```

**Porquê `class` em vez de `vi.fn()`?**

`vi.fn(() => mockDb)` cria uma *arrow function* internamente. Arrow functions não têm `[[Construct]]` — não podem ser usadas como constructores com `new`. O `PrismaClient` é instanciado com `new PrismaClient()`, por isso é necessário uma `class` (ou `function` regular) que retorne o objecto mock.

**Porquê `vi.hoisted()`?**

O Vitest hoista (move para o topo do ficheiro) todas as chamadas `vi.mock()`, fazendo-as executar antes da declaração das variáveis. `vi.hoisted()` garante que `mockDb` é inicializado antes do hoisting, tornando-o acessível na factory do mock.

#### Chaves RSA em testes

O plugin JWT requer chaves RSA. Em vez de mockar o plugin, o ficheiro de setup gera um par de chaves RSA-2048 temporárias em cada corrida e define as variáveis de ambiente:

```js
// apps/backend/src/__tests__/setup.js
import { generateKeyPairSync } from 'node:crypto';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PRIVATE_KEY_B64 = Buffer.from(privateKey.export(...)).toString('base64');
process.env.JWT_PUBLIC_KEY_B64  = Buffer.from(publicKey.export(...)).toString('base64');
```

Esta abordagem testa o plugin JWT real (não um mock), garantindo que a autenticação funciona correctamente.

#### Fastify inject

Em vez de Supertest (que levanta um servidor HTTP real), os testes usam o método nativo `app.inject()` do Fastify, que simula pedidos HTTP na memória:

```js
const res = await app.inject({
  method: 'POST',
  url: '/api/auth/register',
  payload: { username: 'Smilley', email: 'test@test.com', password: 'pass1234' },
});
expect(res.statusCode).toBe(201);
```

`inject()` é mais rápido que Supertest (sem overhead de TCP/IP), e o Fastify cria a instância com `buildApp({ logger: false })` para suprimir logs nos testes.

| Suite | Testes | O que verifica |
|---|:---:|---|
| `auth.test.js` | 5 | Register 201/409/400, Login 401/400 |
| `leaderboard.test.js` | 3 | Rank, lista vazia, dedup por utilizador |
| `scores.test.js` | 4 | 401 sem auth, 201 criação, 400 score>total, 400 inválido |
| **Total** | **12** | **12/12 ✅** |

### 9.5 E2E — Playwright

Os testes E2E correm no browser Chromium real contra o servidor Vite dev. São os mais lentos mas os mais fiéis ao comportamento do utilizador.

**`e2e/quiz.spec.js`** — fluxo do quiz:
- Página inicial carrega com título correcto
- Botão "Começar" visível
- Selecção de categoria e número de perguntas
- Início do quiz navega para `/quiz`
- Quatro opções visíveis na página do quiz
- Navegação para leaderboard e 404

**`e2e/auth.spec.js`** — fluxo de autenticação:
- Botões Login e Criar conta visíveis quando não autenticado
- Modal abre e fecha (Escape)
- Mudança de tab no modal
- Intercepção de rede (`page.route()`) para testar erro de API sem backend real:
  ```js
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: 'Credenciais inválidas.' }) });
  });
  ```
- Login bem sucedido fecha o modal e mostra o utilizador autenticado

### 9.6 GitHub Actions CI

O workflow `.github/workflows/ci.yml` define cinco jobs em pipeline:

```
lint ──→ test-frontend ──→ test-backend ──→ build ──→ test-e2e
```

```yaml
on:
  push:    { branches: [main, develop] }
  pull_request: { branches: [main] }
```

| Job | O que faz |
|---|---|
| `lint` | `yarn workspace frontend lint` |
| `test-frontend` | Vitest 21 testes, artefacto de coverage |
| `test-backend` | Vitest 12 testes + `prisma generate`, artefacto de coverage |
| `build` | `vite build` com `VITE_API_BASE_URL=/api`, artefacto `dist/` |
| `test-e2e` | Playwright Chromium, artefacto HTML report |

O `test-e2e` usa `needs: [build]` para garantir que só corre após build bem-sucedido. O `webServer` do Playwright arranca o Vite dev automaticamente:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

A flag `--with-deps` instala as dependências do sistema (libglib, libnss, etc.) necessárias para Chromium em Ubuntu.

---

## 10. Conclusão e Análise Crítica

### 10.1 O que foi atingido

| Fase | Commit | Estado |
|---|---|:---:|
| 1 — Fundação | `77c909b` | ✅ |
| 2 — A11y + SEO | `2d57b47` | ✅ |
| 3 — Backend API | `97bf4ff` | ✅ |
| UX Polish | `e368026` | ✅ |
| 4 — Containerização | `8f9c09b` | ✅ |
| 5 — Auth + Leaderboard | `dc98ec1` | ✅ |
| 6 — Testes + CI | `cc4228c` | ✅ |

A aplicação evoluiu de um protótipo local sem backend para um sistema full-stack containerizado com:
- **API REST** segura (JWT RS256, rate limiting, bcrypt)
- **Leaderboard** persistente em PostgreSQL
- **Autenticação** completa (registo, login, logout)
- **33 testes automatizados** (21 frontend + 12 backend)
- **Pipeline CI** que garante qualidade em cada commit
- **Deploy reproduzível** com Podman rootless

### 10.2 Decisões que teriam sido diferentes com mais tempo

**TypeScript** em vez de PropTypes — oferece verificação em tempo de compilação, refactoring seguro, e intellisense mais rico. O custo de migração num projecto existente é elevado; a decisão de usar PropTypes foi pragmática.

**SQL Distinct em vez de dedup em JS** — o leaderboard faz deduplicação em JavaScript após buscar todos os scores. A query correcta seria:

```sql
SELECT DISTINCT ON (userId) * FROM Score ORDER BY userId, percentage DESC
```

Ou com uma CTE `ROW_NUMBER`. A implementação em JS foi uma simplificação consciente.

**Service Worker para PWA completa** — o `manifest.json` existe mas sem service worker a app não funciona offline. Uma versão futura poderia cachear perguntas localmente com Workbox.

**Refresh Token** — o JWT actual expira em 7 dias sem renovação automática. Um sistema de refresh tokens prolongaria a sessão sem requerer novo login.

### 10.3 Lições aprendidas

1. **Testar antes de escrever código é mais difícil do que parece**, mas o custo de não o fazer aparece na Fase 6 — escrever testes para código já existente revela acoplamentos que não seriam criados com TDD.

2. **`vi.hoisted()` é necessário com ESM e Vitest** — a hoisting automática de `vi.mock()` é invisível em CommonJS mas visível em ESM, onde as bindings são inicializadas na ordem do módulo.

3. **Podman rootless em Linux é a escolha correcta para CI académico** — sem daemon root, os containers correm como o utilizador normal sem configuração extra.

4. **A separação `buildApp(opts)` vs `server.js` é indispensável** para testes de integração Fastify — sem ela, os testes levariam um servidor HTTP real em cada suite.

---

*Relatório gerado em 10 de junho de 2026.*  
*Todos os commits são verificáveis no histórico do repositório.*
