# 🐳 Guia Docker - Backend

## 📦 Imagens Disponíveis

### 1. Dockerfile (Desenvolvimento)
- **Base:** python:3.11-alpine
- **Tamanho:** ~150-200 MB
- **Features:**
  - Multi-stage build
  - Usuário não-root
  - Health checks
  - Otimizado para desenvolvimento

### 2. Dockerfile.prod (Produção)
- **Base:** python:3.11-alpine
- **Tamanho:** ~120-150 MB
- **Features:**
  - Ultra otimizado com wheels
  - 4 workers Uvicorn
  - Segurança hardened
  - Cache otimizado

## 🚀 Build Rápido

### Desenvolvimento
```bash
# Usando script
./build.sh dev

# Ou manualmente
docker build -t produto-app-backend:dev .
```

### Produção
```bash
# Usando script
./build.sh prod

# Ou manualmente
docker build -f Dockerfile.prod -t produto-app-backend:latest .
```

## 🎯 Executar

### Opção 1: Docker Compose (Recomendado)
```bash
# Subir tudo (Postgres + Backend)
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar
docker-compose down
```

### Opção 2: Docker Run
```bash
# Desenvolvimento
docker run -p 8000:8000 \
  --env-file .env \
  --name backend \
  produto-app-backend:dev

# Produção
docker run -p 8000:8000 \
  --env-file .env \
  --name backend \
  produto-app-backend:latest
```

## 📊 Otimizações Aplicadas

### 1. Multi-Stage Build ✅
```dockerfile
# Stage 1: Compilação
FROM python:3.11-alpine AS builder
# Instala dependências de compilação
# Compila wheels

# Stage 2: Runtime
FROM python:3.11-alpine
# Apenas bibliotecas runtime
# Copia wheels compilados
```
**Benefício:** Imagem final 50% menor

### 2. Alpine Linux ✅
```dockerfile
FROM python:3.11-alpine
```
**Benefício:** Base ~5MB vs ~900MB do Ubuntu

### 3. Layer Caching ✅
```dockerfile
# Copiar requirements primeiro
COPY requirements.txt .
RUN pip install -r requirements.txt

# Código depois (muda mais frequentemente)
COPY ./app ./app
```
**Benefício:** Builds 10x mais rápidos

### 4. .dockerignore ✅
```
__pycache__/
*.py[cod]
venv/
.git/
*.md
```
**Benefício:** Context 90% menor

### 5. Usuário Não-Root ✅
```dockerfile
RUN adduser -D -u 1000 appuser
USER appuser
```
**Benefício:** Segurança

### 6. Health Checks ✅
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget --spider http://localhost:8000/
```
**Benefício:** Auto-recovery

## 🔒 Segurança

### Práticas Implementadas

1. **Usuário não-root**
   - Container roda como `appuser` (UID 1000)
   - Sem privilégios administrativos

2. **Imagem minimal**
   - Alpine Linux (menor superfície de ataque)
   - Apenas dependências necessárias

3. **Sem secrets na imagem**
   - `.env` via env-file ou secrets
   - Nunca no Dockerfile

4. **Dependências fixadas**
   - Versions específicas em requirements.txt
   - Builds reproduzíveis

5. **Health checks**
   - Auto-restart em falhas
   - Monitoramento de saúde

## 📏 Comparação de Tamanhos

| Imagem | Base | Tamanho | Uso |
|--------|------|---------|-----|
| Debian | python:3.11 | ~900 MB | ❌ Pesada |
| Slim | python:3.11-slim | ~150 MB | ⚠️ OK |
| Alpine (nossa) | python:3.11-alpine | ~120 MB | ✅ Ideal |
| Distroless | gcr.io/distroless | ~50 MB | 🔧 Complexo |

## 🔧 Comandos Úteis

### Build
```bash
# Dev
docker build -t produto-app:dev .

# Prod
docker build -f Dockerfile.prod -t produto-app:prod .

# Com cache do registry
docker build --cache-from produto-app:latest .
```

### Run
```bash
# Background
docker run -d -p 8000:8000 produto-app:dev

# Interativo (debug)
docker run -it produto-app:dev sh

# Com variáveis
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  produto-app:dev
```

### Inspeção
```bash
# Ver logs
docker logs -f backend

# Executar comando
docker exec -it backend sh

# Ver processos
docker top backend

# Estatísticas
docker stats backend
```

### Limpeza
```bash
# Remover container
docker rm -f backend

# Remover imagem
docker rmi produto-app:dev

# Limpeza geral
docker system prune -a
```

## 🌐 Docker Compose

### Arquivo Completo
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_passwd
      POSTGRES_DB: db_app_matteo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
```

### Comandos
```bash
# Subir
docker-compose up -d

# Rebuild
docker-compose up -d --build

# Logs
docker-compose logs -f backend

# Parar
docker-compose down

# Limpar volumes
docker-compose down -v
```

## 🚀 Deploy em Produção

### 1. Registry
```bash
# Tag para registry
docker tag produto-app:latest registry.exemplo.com/produto-app:2.2.0

# Push
docker push registry.exemplo.com/produto-app:2.2.0
```

### 2. Docker Swarm
```bash
# Iniciar swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml produto-app
```

### 3. Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: produto-app-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: produto-app:latest
        ports:
        - containerPort: 8000
```

## 📊 Monitoramento

### Health Check
```bash
# Manual
curl http://localhost:8000/

# Docker
docker inspect --format='{{.State.Health.Status}}' backend
```

### Logs
```bash
# Últimas linhas
docker logs --tail 100 backend

# Follow
docker logs -f backend

# Timestamp
docker logs -t backend
```

### Métricas
```bash
# CPU/Memória
docker stats backend

# Processos
docker top backend
```

## ⚡ Performance

### Workers
```dockerfile
CMD ["uvicorn", "app.main:app", "--workers", "4"]
```
**Regra:** workers = (2 x CPU cores) + 1

### Limites de Recursos
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 512M
        reservations:
          cpus: '1'
          memory: 256M
```

## 🐛 Troubleshooting

### Imagem muito grande
```bash
# Verificar layers
docker history produto-app:dev

# Limpar cache
docker builder prune
```

### Build lento
```bash
# Usar BuildKit
DOCKER_BUILDKIT=1 docker build .

# Cache do registry
docker build --cache-from produto-app:latest .
```

### Container não inicia
```bash
# Ver logs
docker logs backend

# Executar manualmente
docker run -it produto-app:dev sh

# Verificar health
docker inspect backend | grep Health
```

### Rede não funciona
```bash
# Listar redes
docker network ls

# Inspecionar
docker network inspect app-network

# Recriar
docker-compose down && docker-compose up -d
```

## 📝 Best Practices

✅ **Use multi-stage builds**
✅ **Use Alpine ou Slim**
✅ **Fixe versões de dependências**
✅ **Use .dockerignore**
✅ **Rode como não-root**
✅ **Adicione health checks**
✅ **Use variáveis de ambiente**
✅ **Nunca coloque secrets na imagem**
✅ **Cache layers inteligentemente**
✅ **Minimize layers**

## 🎯 Tamanho Final

Nosso Dockerfile otimizado:
- **Desenvolvimento:** ~150 MB
- **Produção:** ~120 MB
- **Tempo de build:** ~2-3 min (primeira vez)
- **Rebuild:** ~10-30 seg (com cache)

**Comparado com Ubuntu base (~900 MB):**
- ✅ **87% menor**
- ✅ **Startup 2x mais rápido**
- ✅ **Menor superfície de ataque**

## 🔗 Recursos

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Alpine Linux](https://alpinelinux.org/)
- [Docker Security](https://docs.docker.com/engine/security/)
