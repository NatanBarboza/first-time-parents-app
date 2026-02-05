# 🚀 Quick Start - Backend Refatorado

## Início Rápido em 3 Passos

### 1️⃣ Configurar Ambiente

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 2️⃣ Configurar Banco de Dados

```bash
# Iniciar PostgreSQL (Docker)
cd ..
docker-compose up -d

# Criar usuário admin
cd backend
python scripts/create_admin.py
```

### 3️⃣ Executar Servidor

```bash
# Opção A: Script dedicado (recomendado)
python run.py

# Opção B: Uvicorn direto
uvicorn app.main:app --reload

# Opção C: Como módulo
python -m app.main
```

## ✅ Verificar Funcionamento

1. **Servidor rodando:**
   - URL: http://localhost:8000
   - Resposta: `{"message": "API de Gestão de Produtos..."}`

2. **Documentação:**
   - Swagger: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

3. **Login teste:**
   ```bash
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

## 📁 Estrutura Rápida

```
backend/
├── app/              # Código principal
│   ├── routes/       # Endpoints
│   ├── crud/         # Lógica de dados
│   ├── schemas/      # Validação
│   ├── models/       # Banco de dados
│   └── auth/         # Autenticação
├── scripts/          # Utilitários
└── run.py            # Executar
```

## 🔧 Comandos Úteis

```bash
# Criar admin
python scripts/create_admin.py

# Executar servidor
python run.py

# Executar com reload (desenvolvimento)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ver rotas disponíveis
# Acesse http://localhost:8000/docs
```

## 📚 Mais Informações

- **Documentação completa:** `README.md`
- **Guia de migração:** `MIGRATION_GUIDE.md`
- **Arquitetura:** `ARCHITECTURE.md`
- **Resumo refatoração:** `REFACTORING_SUMMARY.md`

## ⚡ Dica Rápida

Execute tudo com um comando:

```bash
# Terminal 1: Banco de dados
docker-compose up -d

# Terminal 2: Backend
cd backend && python run.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

Pronto! Sistema completo rodando! 🎉
