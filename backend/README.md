# Backend - API de Gestão de Produtos

Backend refatorado com arquitetura em camadas.

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI principal
│   ├── database.py          # Configuração do banco de dados
│   │
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   └── models.py
│   │
│   ├── schemas/             # Schemas Pydantic (validação)
│   │   ├── __init__.py
│   │   ├── produto.py
│   │   ├── auth.py
│   │   ├── lista_compras.py
│   │   └── compra.py
│   │
│   ├── crud/                # Operações de banco de dados
│   │   ├── __init__.py
│   │   ├── produto.py
│   │   ├── user.py
│   │   ├── lista_compras.py
│   │   └── compra.py
│   │
│   ├── auth/                # Autenticação e autorização
│   │   ├── __init__.py
│   │   └── auth.py
│   │
│   └── routes/              # Rotas da API
│       ├── __init__.py
│       ├── auth.py
│       ├── produto.py
│       ├── lista_compras.py
│       └── compra.py
│
├── scripts/                 # Scripts utilitários
│   ├── create_admin.py
│   └── test_hash.py
│
├── run.py                   # Script para executar servidor
├── requirements.txt
└── .env
```

## 🏗️ Arquitetura em Camadas

### 1. **Models** (`app/models/`)
- Definição das tabelas do banco de dados
- Relacionamentos entre entidades
- Usando SQLAlchemy ORM

### 2. **Schemas** (`app/schemas/`)
- Validação de dados de entrada/saída
- Serialização/deserialização
- Usando Pydantic

### 3. **CRUD** (`app/crud/`)
- Operações de banco de dados (Create, Read, Update, Delete)
- Lógica de negócio relacionada a dados
- Camada de acesso a dados

### 4. **Auth** (`app/auth/`)
- Autenticação JWT
- Geração e validação de tokens
- Hash de senhas
- Middlewares de autenticação

### 5. **Routes** (`app/routes/`)
- Endpoints da API
- Validação de requisições
- Respostas HTTP
- Documentação automática (Swagger)

## 🚀 Como Executar

### Opção 1: Usando run.py (Recomendado)
```bash
python run.py
```

### Opção 2: Usando uvicorn diretamente
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Opção 3: Através do main.py
```bash
python -m app.main
```

## 📝 Scripts Utilitários

### Criar usuário admin
```bash
python scripts/create_admin.py
```

### Testar hash de senha
```bash
python scripts/test_hash.py
```

## 🔌 Endpoints Disponíveis

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário atual
- `POST /auth/refresh` - Renovar token

### Produtos
- `GET /produtos/` - Listar produtos
- `GET /produtos/{id}` - Obter produto
- `POST /produtos/` - Criar produto
- `PUT /produtos/{id}` - Atualizar produto
- `DELETE /produtos/{id}` - Deletar produto

### Listas de Compras
- `GET /listas-compras/` - Listar listas
- `GET /listas-compras/{id}` - Obter lista
- `POST /listas-compras/` - Criar lista
- `PUT /listas-compras/{id}` - Atualizar lista
- `DELETE /listas-compras/{id}` - Deletar lista
- `POST /listas-compras/{id}/itens` - Adicionar item
- `PUT /listas-compras/itens/{id}` - Atualizar item
- `DELETE /listas-compras/itens/{id}` - Deletar item
- `PATCH /listas-compras/itens/{id}/toggle-comprado` - Marcar comprado

### Compras (Histórico)
- `GET /compras/` - Listar compras
- `GET /compras/{id}` - Obter compra
- `GET /compras/estatisticas` - Estatísticas
- `POST /compras/` - Criar compra
- `POST /compras/finalizar-lista/{id}` - Finalizar lista
- `PUT /compras/{id}` - Atualizar compra
- `DELETE /compras/{id}` - Deletar compra

## 📚 Documentação da API

Acesse: http://localhost:8000/docs (Swagger UI)
Ou: http://localhost:8000/redoc (ReDoc)

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Database
POSTGRES_USER=app_user
POSTGRES_PASSWORD=app_passwd
POSTGRES_DB=db_app_matteo
DATABASE_URL=postgresql://app_user:app_passwd@localhost:5432/db_app_matteo

# JWT
JWT_SECRET_KEY=sua-chave-secreta-aqui
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App
SECRET_KEY=your-secret-key-here
DEBUG=True
```

## 🧪 Testes

Para adicionar testes no futuro, crie a estrutura:
```
backend/
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_produtos.py
│   ├── test_listas.py
│   └── test_compras.py
```

## 🎯 Benefícios da Arquitetura

1. **Separação de Responsabilidades**
   - Cada camada tem uma função específica
   - Fácil de entender e manter

2. **Reutilização de Código**
   - CRUD functions podem ser usadas em múltiplas rotas
   - Schemas podem ser compartilhados

3. **Testabilidade**
   - Cada camada pode ser testada isoladamente
   - Mocks são mais fáceis de criar

4. **Escalabilidade**
   - Fácil adicionar novos recursos
   - Estrutura clara para novos desenvolvedores

5. **Manutenibilidade**
   - Bugs são mais fáceis de localizar
   - Mudanças são mais seguras

## 📦 Dependências

Ver `requirements.txt` para lista completa.

Principais:
- **FastAPI** - Framework web
- **SQLAlchemy** - ORM
- **Pydantic** - Validação
- **python-jose** - JWT
- **passlib** - Hash de senhas
- **psycopg2-binary** - Driver PostgreSQL

## 🔒 Segurança

- Senhas com hash bcrypt
- Tokens JWT para autenticação
- CORS configurado
- Validação de dados em todas as camadas
- Proteção contra SQL injection (ORM)

## 📈 Próximos Passos

- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
- [ ] Implementar logging
- [ ] Adicionar rate limiting
- [ ] Configurar CI/CD
- [ ] Adicionar migrations (Alembic)
- [ ] Documentar com docstrings
- [ ] Adicionar type hints completos
