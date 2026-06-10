# Plano de Melhoria — Quiz Personalizado

> Cada fase corresponde a um commit e a uma secção do relatório técnico.  
> Princípio: **pequenos incrementos verificáveis**, cada um entregando valor real.

---

## Estado actual (baseline)

| Característica | Estado |
|---|---|
| React 19 + Vite | ✅ Funcional |
| Dados estáticos em JS | ✅ |
| Temas visuais (3) | ✅ |
| Ajudas 50/50 e saltar | ✅ |
| Barra de progresso | ✅ |
| Backend | ❌ Inexistente |
| Persistência de scores | ❌ |
| Autenticação | ❌ |
| Leaderboard | ❌ |
| PWA / Offline | ❌ |
| Acessibilidade (a11y) | ❌ Mínima |
| SEO / Meta tags | ❌ |
| Testes | ❌ |
| CI/CD | ❌ |
| Containerização | ❌ |

---

## Fases de desenvolvimento

### FASE 1 — Fundação: qualidade de código e estrutura
**Commit:** `feat: restructure frontend foundation — env, router, error boundary`

O que entra:
- Variáveis de ambiente via `.env` (Vite `VITE_*`)
- React Router DOM v6 com rotas tipadas (`/`, `/quiz`, `/resultados`, `/leaderboard`)
- Error Boundary global para capturar crashes em runtime
- `PropTypes` em todos os componentes (contrato de interface)
- Normalização do `package.json` com scripts de teste e lint

Porquê:
> Uma aplicação web de produção precisa de isolamento de configuração (env), navegação real (SPA routing) e resiliência a erros. Sem estas fundações qualquer funcionalidade nova é frágil.

---

### FASE 2 — UX, Acessibilidade e SEO
**Commit:** `feat: a11y, SEO meta tags, responsive polish`

O que entra:
- `<Helmet>` / `<title>` dinâmico por rota
- ARIA roles e labels em todos os elementos interactivos
- Modo de alto contraste CSS
- Página 404 dedicada
- Loading skeleton para transições
- `manifest.json` + ícones para instalação PWA
- `robots.txt` + `sitemap.xml`

Porquê:
> Acessibilidade é obrigatória (WCAG 2.1 AA). SEO e PWA aumentam o alcance. Estes atributos são difíceis de retrofitar — é mais barato fazê-los agora.

---

### FASE 3 — Backend: Fastify + Prisma + PostgreSQL
**Commit:** `feat: backend api — fastify, prisma ORM, postgres`

O que entra:
- Monorepo com workspaces npm: `apps/frontend` + `apps/backend`
- **Fastify** como servidor HTTP (mais rápido que Express, schema-first)
- **Prisma** como ORM com migrations versionadas
- **PostgreSQL** como base de dados relacional
- Modelos: `User`, `Score`, `Question`, `Category`
- Endpoints REST:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET  /api/questions?category=&limit=`
  - `POST /api/scores`
  - `GET  /api/leaderboard`
- JWT para autenticação stateless
- Validação de input com JSON Schema (Fastify nativo)
- Rate limiting com `@fastify/rate-limit`

Porquê:
> Fastify é escolhido pela performance (benchmarks ~30k req/s) e pelo sistema de plugins coeso. Prisma torna as migrations seguras e tipadas. PostgreSQL oferece ACID, relações reais e full-text search futuro.

---

### FASE 4 — Containerização com Podman
**Commit:** `feat: containerize full stack with podman and podman-compose`

O que entra:
- `Containerfile.frontend` — build multi-stage (Node → Nginx)
- `Containerfile.backend` — build multi-stage (Node builder → Node runtime slim)
- `podman-compose.yml` com serviços: `db`, `backend`, `frontend`
- Rede interna isolada entre containers
- Volumes nomeados para persistência do Postgres
- Health checks em todos os serviços
- `.env.container` para segredos de produção
- Script `scripts/start.sh` para bootstrap

Porquê:
> Podman é rootless por design (mais seguro que Docker em ambientes universitários/Linux). A containerização garante reprodutibilidade: "funciona na minha máquina" torna-se "funciona em qualquer máquina".

---

### FASE 5 — Leaderboard e Autenticação no Frontend
**Commit:** `feat: leaderboard page and auth flow`

O que entra:
- Página `/leaderboard` com top 10 scores em tempo real
- Formulário de registo / login integrado com o backend JWT
- Context API para estado de autenticação global
- Guardar score automaticamente após completar quiz (se autenticado)
- Toast notifications (`react-hot-toast`)

Porquê:
> O leaderboard fecha o ciclo: dá razão para o utilizador criar conta e voltar. A persistência de scores é o principal valor acrescentado do backend.

---

### FASE 6 — Testes e CI
**Commit:** `feat: testing suite and github actions ci`

O que entra:
- **Vitest** + **React Testing Library** para testes unitários de componentes
- **Supertest** para testes de integração da API Fastify
- **Playwright** para testes E2E (`quiz completo → score guardado`)
- GitHub Actions workflow: lint → test → build → push image

Porquê:
> Testes são a rede de segurança que permite refatorar sem medo. O CI garante que nenhum commit quebra a aplicação antes de chegar a produção.

---

## Stack final

```
Frontend        React 19 + Vite + React Router v6
Backend         Fastify 4 + Prisma 5
Base de dados   PostgreSQL 16
ORM             Prisma (migrations + type-safe client)
Auth            JWT (RS256)
Containerização Podman + podman-compose
Testes          Vitest + RTL + Playwright
CI              GitHub Actions
```

---

## Ordem de execução

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
  (pode fazer-se 1+2 em paralelo, 3+4 são dependentes sequenciais)
```
