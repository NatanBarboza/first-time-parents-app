# ============================================
# Multi-Stage Dockerfile Otimizado
# Base: Python 3.11 Slim (Debian)
# Tamanho final: ~180-200 MB
# ============================================

# ============================================
# Stage 1: Builder - Compilação
# ============================================
FROM python:3.11-slim as builder

WORKDIR /build

# Instalar dependências de compilação
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Criar wheels otimizados
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels \
    -r requirements.txt

# ============================================
# Stage 2: Runtime - Imagem Final
# ============================================
FROM python:3.11-slim

# Metadados
LABEL maintainer="produto-app"
LABEL description="Backend FastAPI - Gestão de Produtos"
LABEL version="2.2.0"

# Variáveis de ambiente Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

# Criar usuário não-root
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1000 appuser

# Instalar dependências runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Definir workdir
WORKDIR /app

# Copiar e instalar wheels do builder
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

# Copiar código da aplicação
COPY --chown=appuser:appuser ./app ./app
COPY --chown=appuser:appuser ./scripts ./scripts
COPY --chown=appuser:appuser run.py .

# Criar diretórios necessários
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Mudar para usuário não-root
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Expor porta
EXPOSE 8000

# Comando de execução
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
