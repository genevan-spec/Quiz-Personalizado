#!/usr/bin/env bash
# scripts/start.sh — Bootstrap completo do Quiz Personalizado com Podman
#
# O que faz:
#   1. Valida pré-requisitos (podman, podman-compose, .env.container)
#   2. Gera chaves RSA-2048 se não existirem e injeta-as em .env.container
#   3. (Opcional) Constrói as imagens com scripts/build.sh
#   4. Inicia os serviços com podman-compose
#   5. Aguarda o backend ficar saudável
#   6. Mostra URLs e comandos úteis
#
# Utilização:
#   bash scripts/start.sh             # start normal
#   bash scripts/start.sh --build     # constrói imagens antes de iniciar
#   bash scripts/start.sh --seed      # popula a BD na primeira execução
#   bash scripts/start.sh --stop      # para todos os serviços
#   bash scripts/start.sh --logs      # segue logs em tempo real
#   bash scripts/start.sh --status    # mostra estado dos containers

set -euo pipefail

# ── Cores ─────────────────────────────────────────────────────────────────────
BLUE='\033[1;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${BLUE}==>  $1${NC}"; }
ok()   { echo -e "${GREEN}✔    $1${NC}"; }
warn() { echo -e "${YELLOW}⚠    $1${NC}"; }
err()  { echo -e "${RED}✘    $1${NC}"; exit 1; }
info() { echo -e "${CYAN}     $1${NC}"; }

# ── Raiz do projecto ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
cd "$ROOT"

ENV_FILE=".env.container"

# ── Banner ────────────────────────────────────────────────────────────────────
print_banner() {
  echo ""
  echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${BLUE}║  Quiz Personalizado — Stack Manager        ║${NC}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════╝${NC}"
  echo ""
}

# ── Argumentos ────────────────────────────────────────────────────────────────
DO_BUILD=false
DO_SEED=false
CMD="up"

for arg in "$@"; do
  case "$arg" in
    --build)  DO_BUILD=true ;;
    --seed)   DO_SEED=true ;;
    --stop)   CMD="stop"   ;;
    --logs)   CMD="logs"   ;;
    --status) CMD="status" ;;
    --help|-h)
      echo "Utilização: bash scripts/start.sh [opções]"
      echo ""
      echo "  --build    Reconstrói as imagens antes de iniciar"
      echo "  --seed     Popula a BD na primeira execução (SEED_DB=true)"
      echo "  --stop     Para todos os serviços"
      echo "  --logs     Segue logs em tempo real"
      echo "  --status   Mostra estado dos containers"
      exit 0
      ;;
  esac
done

print_banner

# ── Comandos especiais ────────────────────────────────────────────────────────
if [[ "$CMD" == "stop" ]]; then
  log "A parar todos os serviços..."
  podman-compose --env-file "$ENV_FILE" down
  ok "Serviços parados."
  exit 0
fi

if [[ "$CMD" == "logs" ]]; then
  exec podman-compose --env-file "$ENV_FILE" logs -f
fi

if [[ "$CMD" == "status" ]]; then
  podman-compose --env-file "$ENV_FILE" ps
  exit 0
fi

# ── 1. Verificar pré-requisitos ───────────────────────────────────────────────
log "A verificar pré-requisitos..."

command -v podman         >/dev/null 2>&1 || err "Podman não encontrado.         Instala: sudo apt install podman"
command -v podman-compose >/dev/null 2>&1 || err "podman-compose não encontrado.  Instala: pip3 install podman-compose"
command -v node           >/dev/null 2>&1 || err "Node.js não encontrado."

ok "Pré-requisitos satisfeitos."

# ── 2. Validar .env.container ─────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  warn "$ENV_FILE não encontrado. A criar a partir do exemplo..."
  cp .env.container.example "$ENV_FILE"
  echo ""
  echo -e "${YELLOW}  Edita ${BOLD}${ENV_FILE}${NC}${YELLOW} e preenche:${NC}"
  echo -e "${YELLOW}    - POSTGRES_PASSWORD${NC}"
  echo -e "${YELLOW}    - DATABASE_URL (mesma password)${NC}"
  echo ""
  err "Preenche ${ENV_FILE} e volta a executar o script."
fi

# Verificar que POSTGRES_PASSWORD não é o placeholder
if grep -q "<PREENCHER" "$ENV_FILE"; then
  err "Há valores por preencher em ${ENV_FILE}. Substitui todos os <PREENCHER_...>."
fi

ok ".env.container validado."

# ── 3. Chaves JWT RSA-2048 ────────────────────────────────────────────────────
# Verificar se as chaves já estão em .env.container
PRIV_IN_ENV=$(grep "^JWT_PRIVATE_KEY_B64=" "$ENV_FILE" | cut -d= -f2-)
PUB_IN_ENV=$(grep  "^JWT_PUBLIC_KEY_B64="  "$ENV_FILE" | cut -d= -f2-)

if [ -z "$PRIV_IN_ENV" ] || [ -z "$PUB_IN_ENV" ]; then
  log "Chaves JWT não encontradas em ${ENV_FILE}."

  # Gerar chaves de ficheiro se não existirem
  if [ ! -f "apps/backend/keys/private.pem" ]; then
    log "A gerar par de chaves RSA-2048..."
    node scripts/generate-keys.js
  fi

  # Codificar em Base64 e injetar em .env.container
  PRIV_B64=$(base64 -w0 < apps/backend/keys/private.pem)
  PUB_B64=$(base64  -w0 < apps/backend/keys/public.pem)

  # Substituir (ou acrescentar) as linhas no .env.container
  if grep -q "^JWT_PRIVATE_KEY_B64=" "$ENV_FILE"; then
    sed -i "s|^JWT_PRIVATE_KEY_B64=.*|JWT_PRIVATE_KEY_B64=${PRIV_B64}|" "$ENV_FILE"
  else
    echo "JWT_PRIVATE_KEY_B64=${PRIV_B64}" >> "$ENV_FILE"
  fi

  if grep -q "^JWT_PUBLIC_KEY_B64=" "$ENV_FILE"; then
    sed -i "s|^JWT_PUBLIC_KEY_B64=.*|JWT_PUBLIC_KEY_B64=${PUB_B64}|" "$ENV_FILE"
  else
    echo "JWT_PUBLIC_KEY_B64=${PUB_B64}" >> "$ENV_FILE"
  fi

  ok "Chaves JWT injetadas em ${ENV_FILE}."
else
  ok "Chaves JWT já presentes em ${ENV_FILE}."
fi

# ── 4. Activar seed se pedido ─────────────────────────────────────────────────
if $DO_SEED; then
  sed -i "s|^SEED_DB=.*|SEED_DB=true|" "$ENV_FILE"
  ok "SEED_DB=true activado. A BD será populada no arranque."
fi

# ── 5. Build das imagens ──────────────────────────────────────────────────────
if $DO_BUILD; then
  log "A construir imagens..."
  bash scripts/build.sh
fi

# Verificar se as imagens existem; sugerir build se não
if ! podman image exists quiz-backend:latest 2>/dev/null || ! podman image exists quiz-frontend:latest 2>/dev/null; then
  warn "Imagens não encontradas. A construir automaticamente..."
  bash scripts/build.sh
fi

# ── 6. Iniciar serviços ───────────────────────────────────────────────────────
log "A iniciar serviços com podman-compose..."
podman-compose --env-file "$ENV_FILE" up -d

# ── 7. Aguardar backend saudável ──────────────────────────────────────────────
log "À espera do backend ficar pronto..."
MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  if podman healthcheck run quiz_backend >/dev/null 2>&1; then
    ok "Backend saudável!"
    break
  fi
  RETRY=$(( RETRY + 1 ))
  echo -ne "\r     Tentativa ${RETRY}/${MAX_RETRIES}..."
  sleep 3
done
echo ""

if [ $RETRY -eq $MAX_RETRIES ]; then
  warn "Backend não respondeu em tempo útil. Verifica os logs:"
  info "podman logs quiz_backend"
fi

# ── 8. Desactivar seed após primeiro arranque ─────────────────────────────────
if $DO_SEED; then
  sed -i "s|^SEED_DB=.*|SEED_DB=false|" "$ENV_FILE"
  ok "SEED_DB revertido para false (evita re-seed em próximos restarts)."
fi

# ── 9. Resumo ─────────────────────────────────────────────────────────────────
FRONTEND_PORT=$(grep "^FRONTEND_PORT=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' || echo "8080")
FRONTEND_PORT="${FRONTEND_PORT:-8080}"

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║  Stack iniciada com sucesso!               ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Frontend:${NC}   http://localhost:${FRONTEND_PORT}"
echo -e "  ${BOLD}Backend:${NC}    http://localhost:3000/health"
echo -e "  ${BOLD}API Docs:${NC}   http://localhost:3000/api/leaderboard"
echo ""
echo -e "  ${CYAN}Comandos úteis:${NC}"
echo -e "    Parar:   ${BOLD}bash scripts/start.sh --stop${NC}"
echo -e "    Logs:    ${BOLD}bash scripts/start.sh --logs${NC}"
echo -e "    Estado:  ${BOLD}bash scripts/start.sh --status${NC}"
echo -e "    Rebuild: ${BOLD}bash scripts/start.sh --build${NC}"
echo ""
