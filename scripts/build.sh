#!/usr/bin/env bash
# scripts/build.sh — Constrói todas as imagens container do projecto
#
# Utilização:
#   bash scripts/build.sh            # build de todas as imagens
#   bash scripts/build.sh frontend   # só o frontend
#   bash scripts/build.sh backend    # só o backend
#
# Opções:
#   --no-cache   força rebuild sem cache de layers
#   --push       faz push das imagens após o build (requer login no registry)
#   --tag <tag>  tag adicional (ex: --tag v1.2.0)

set -euo pipefail

# ── Cores ─────────────────────────────────────────────────────────────────────
BLUE='\033[1;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}==>  $1${NC}"; }
ok()   { echo -e "${GREEN}✔    $1${NC}"; }
warn() { echo -e "${YELLOW}⚠    $1${NC}"; }
err()  { echo -e "${RED}✘    $1${NC}"; exit 1; }

# ── Verificações ──────────────────────────────────────────────────────────────
command -v podman >/dev/null 2>&1 || err "Podman não encontrado. Instala com: sudo apt install podman"

# ── Argumentos ────────────────────────────────────────────────────────────────
TARGET="${1:-all}"
NO_CACHE=""
PUSH=false
EXTRA_TAG=""

shift 2>/dev/null || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-cache) NO_CACHE="--no-cache" ;;
    --push)     PUSH=true ;;
    --tag)      EXTRA_TAG="$2"; shift ;;
    *) warn "Argumento desconhecido: $1" ;;
  esac
  shift
done

# ── Raiz do projecto ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# ── Função de build ───────────────────────────────────────────────────────────
build_image() {
  local name="$1"        # ex: quiz-backend
  local containerfile="$2"  # ex: Containerfile.backend
  local start

  log "A construir ${name}:latest  (${containerfile})"
  start=$(date +%s)

  # shellcheck disable=SC2086
  podman build \
    $NO_CACHE \
    -f "$containerfile" \
    -t "${name}:latest" \
    -t "${name}:${TIMESTAMP}" \
    ${EXTRA_TAG:+-t "${name}:${EXTRA_TAG}"} \
    .

  local elapsed=$(( $(date +%s) - start ))
  ok "${name}:latest  construído em ${elapsed}s"

  if $PUSH; then
    log "A fazer push de ${name}:latest..."
    podman push "${name}:latest"
    ok "Push concluído: ${name}:latest"
  fi
}

# ── Build ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Quiz Personalizado — Container Build  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

case "$TARGET" in
  frontend)
    build_image "quiz-frontend" "Containerfile.frontend"
    ;;
  backend)
    build_image "quiz-backend"  "Containerfile.backend"
    ;;
  all)
    build_image "quiz-backend"  "Containerfile.backend"
    build_image "quiz-frontend" "Containerfile.frontend"
    ;;
  *)
    err "Target desconhecido: '$TARGET'. Usa: all | frontend | backend"
    ;;
esac

echo ""
log "Imagens disponíveis:"
podman images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}" \
  | grep -E "^(REPOSITORY|quiz-)" || true
echo ""
ok "Build concluído!"
