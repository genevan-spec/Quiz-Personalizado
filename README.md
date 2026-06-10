# Quiz Personalizado 🧠

Quiz de Cultura Geral com foco em Angola e África. Full-stack React + Fastify + PostgreSQL, containerizado com Podman.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Necessário para |
|---|---|---|
| Node.js | 22 | Desenvolvimento local |
| Yarn | 1.22 | Gestão de dependências |
| Podman | 4+ | Execução em containers |
| podman-compose | 1+ | Orquestração de containers |

---

## Modo 1 — Desenvolvimento local (sem Podman)

Requer Node 22 + Yarn + uma instância de PostgreSQL local.

### 1. Instalar dependências

```bash
yarn install
```

### 2. Configurar variáveis de ambiente

```bash
# Frontend
cp apps/frontend/.env.example apps/frontend/.env
# Edita VITE_API_BASE_URL se necessário (padrão: http://localhost:3000/api)

# Backend — cria apps/backend/.env com o conteúdo abaixo
```

Conteúdo base de `apps/backend/.env`:

```env
DATABASE_URL="postgresql://quiz_user:quiz_pass@localhost:5432/quiz_db?schema=public"
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Gerar chaves JWT

```bash
node scripts/generate-keys.js
```

As chaves RSA-2048 são guardadas em `apps/backend/keys/` (ignorado pelo git).

### 4. Preparar a base de dados

```bash
# Criar e aplicar as migrations
yarn workspace backend db:migrate

# (Opcional) Popular com perguntas de exemplo
yarn workspace backend db:seed
```

### 5. Iniciar os servidores

```bash
# Frontend e backend em paralelo
yarn dev

# Ou em terminais separados:
yarn dev:frontend   # http://localhost:5173
yarn dev:backend    # http://localhost:3000
```

---

## Modo 2 — Containers com Podman (recomendado)

Não requer Node, Yarn, nem PostgreSQL instalados — tudo corre dentro dos containers.

### 1. Configurar variáveis de produção

```bash
cp .env.container.example .env.container
# Edita .env.container com passwords fortes e origens CORS correctas
```

### 2. Arranque automático (recomendado)

O script `start.sh` faz tudo: gera chaves RSA, constrói imagens se necessário, inicia os containers e aguarda os health checks.

```bash
bash scripts/start.sh
```

**Flags disponíveis:**

```bash
bash scripts/start.sh --build    # força rebuild das imagens
bash scripts/start.sh --seed     # popula a BD na primeira execução
bash scripts/start.sh --stop     # para todos os serviços
bash scripts/start.sh --logs     # segue os logs em tempo real
bash scripts/start.sh --status   # mostra estado de cada container
```

A aplicação fica disponível em **http://localhost:8080** após o arranque.

### 3. Arranque manual (alternativo)

```bash
# Gerar chaves RSA (só na primeira vez)
node scripts/generate-keys.js

# Injetar chaves no .env.container
JWT_PRIVATE_KEY_B64=$(base64 -w0 < apps/backend/keys/private.pem)
JWT_PUBLIC_KEY_B64=$(base64 -w0  < apps/backend/keys/public.pem)
echo "JWT_PRIVATE_KEY_B64=$JWT_PRIVATE_KEY_B64" >> .env.container
echo "JWT_PUBLIC_KEY_B64=$JWT_PUBLIC_KEY_B64"   >> .env.container

# Construir imagens
bash scripts/build.sh

# Iniciar serviços
podman-compose --env-file .env.container up -d

# Ver logs
podman-compose logs -f
```

### 4. Parar os containers

```bash
bash scripts/start.sh --stop
# ou
podman-compose down
```

---

## Testes

```bash
# Todos os testes (frontend + backend)
yarn test

# Só frontend (Vitest + React Testing Library)
yarn test:frontend

# Só backend (Vitest + Fastify inject, sem DB real)
yarn test:backend

# Testes E2E (Playwright — requer servidor Vite dev a correr)
yarn test:e2e

# Cobertura de código
yarn test:coverage
```

---

## Scripts úteis

```bash
yarn build                        # build do frontend para produção
yarn lint                         # lint em todos os workspaces
yarn workspace backend db:studio  # Prisma Studio (GUI da base de dados)
yarn workspace backend db:migrate # criar/aplicar migrations
yarn workspace backend db:seed    # popular BD com perguntas de exemplo
```

---

## Estrutura do projecto

```
apps/
├── frontend/          React 19 + Vite + React Router v7
└── backend/           Fastify 5 + Prisma 6 + PostgreSQL
e2e/                   Testes Playwright
scripts/               generate-keys.js · start.sh · build.sh
.github/workflows/     ci.yml (lint → test → build → E2E)
Containerfile.frontend
Containerfile.backend
podman-compose.yml
nginx.conf
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite 8, React Router v7, react-hot-toast |
| Backend | Fastify 5, Prisma 6, bcryptjs, @fastify/jwt (RS256) |
| Base de dados | PostgreSQL 16 |
| Containers | Podman (rootless), Nginx 1.27-alpine |
| Testes | Vitest, React Testing Library, Playwright |
| CI | GitHub Actions |
