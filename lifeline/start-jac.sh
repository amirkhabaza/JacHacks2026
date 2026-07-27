#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
set -a
source .env
set +a

# Jac/byLLM currently uses its OpenAI-compatible transport for OpenRouter.
export OPENAI_API_KEY="${OPENROUTER_API_KEY}"
export OPENAI_API_BASE="https://openrouter.ai/api/v1"
export BYLLM_DEFAULT_MODEL="${BYLLM_MODEL}"

cd jac
exec jac start main.jac --no-client --port "${JAC_PORT:-8001}"
