# 🏗️ Arquitetura do Backend

## 📊 Fluxo de Requisição

```
┌─────────────┐
│   Cliente   │ (Frontend React)
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         FastAPI App                 │
│  ┌─────────────────────────────┐   │
│  │   Routes Layer              │   │ ◄─── Endpoints HTTP
│  │  (app/routes/)              │   │
│  │  - auth.py                  │   │
│  │  - produto.py               │   │
│  │  - lista_compras.py         │   │
│  │  - compra.py                │   │
│  └────────┬────────────────────┘   │
│           │                         │
│           │ Valida request          │
│           ▼                         │
│  ┌─────────────────────────────┐   │
│  │   Schemas Layer             │   │ ◄─── Validação Pydantic
│  │  (app/schemas/)             │   │
│  │  - produto.py               │   │
│  │  - auth.py                  │   │
│  │  - lista_compras.py         │   │
│  │  - compra.py                │   │
│  └────────┬────────────────────┘   │
│           │                         │
│           │ Dados validados         │
│           ▼                         │
│  ┌─────────────────────────────┐   │
│  │   Auth Layer                │   │ ◄─── Autenticação JWT
│  │  (app/auth/)                │   │
│  │  - auth.py                  │   │
│  │    * Verifica token         │   │
│  │    * Valida usuário         │   │
│  └────────┬────────────────────┘   │
│           │                         │
│           │ Usuário autenticado     │
│           ▼                         │
│  ┌─────────────────────────────┐   │
│  │   CRUD Layer                │   │ ◄─── Lógica de Negócio
│  │  (app/crud/)                │   │
│  │  - produto.py               │   │
│  │  - user.py                  │   │
│  │  - lista_compras.py         │   │
│  │  - compra.py                │   │
│  └────────┬────────────────────┘   │
│           │                         │
│           │ Operações DB            │
│           ▼                         │
│  ┌─────────────────────────────┐   │
│  │   Models Layer              │   │ ◄─── ORM SQLAlchemy
│  │  (app/models/)              │   │
│  │  - models.py                │   │
│  │    * Produto                │   │
│  │    * User                   │   │
│  │    * ListaCompras           │   │
│  │    * Compra                 │   │
│  └────────┬────────────────────┘   │
│           │                         │
│           │ SQL Queries             │
│           ▼                         │
│  ┌─────────────────────────────┐   │
│  │   Database                  │   │ ◄─── PostgreSQL
│  │  (app/database.py)          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
       │
       │ HTTP Response
       ▼
┌─────────────┐
│   Cliente   │
└─────────────┘
```

## 📁 Organização de Pacotes

```
app/
├── __init__.py                 # Inicialização do pacote
├── main.py                     # Aplicação FastAPI
├── database.py                 # Configuração DB
│
├── models/                     # 🗄️ Camada de Dados
│   ├── __init__.py
│   └── models.py              # Tabelas do banco
│       ├── Produto
│       ├── User
│       ├── ListaCompras
│       ├── ItemListaCompras
│       ├── Compra
│       └── ItemCompra
│
├── schemas/                    # ✅ Camada de Validação
│   ├── __init__.py
│   ├── produto.py             # DTOs de Produto
│   ├── auth.py                # DTOs de Auth
│   ├── lista_compras.py       # DTOs de Lista
│   └── compra.py              # DTOs de Compra
│
├── crud/                       # 💼 Camada de Negócio
│   ├── __init__.py
│   ├── produto.py             # CRUD Produto
│   ├── user.py                # CRUD User
│   ├── lista_compras.py       # CRUD Lista
│   └── compra.py              # CRUD Compra
│
├── auth/                       # 🔐 Camada de Segurança
│   ├── __init__.py
│   └── auth.py                # JWT, Hash, Auth
│
└── routes/                     # 🛣️ Camada de Apresentação
    ├── __init__.py
    ├── auth.py                # Endpoints Auth
    ├── produto.py             # Endpoints Produto
    ├── lista_compras.py       # Endpoints Lista
    └── compra.py              # Endpoints Compra
```

## 🔄 Ciclo de Vida de uma Requisição

### Exemplo: Criar Produto

```python
# 1. Cliente faz requisição
POST /produtos/
{
  "nome": "Arroz",
  "preco": 25.90,
  "quantidade_estoque": 10
}

# 2. Routes Layer (app/routes/produto.py)
@router.post("/", response_model=ProdutoResponse)
def criar_produto(
    produto: ProdutoCreate,  # ← Valida com Schema
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ← Auth
):
    # 3. Chama CRUD
    return crud.create_produto(db, produto)

# 4. CRUD Layer (app/crud/produto.py)
def create_produto(db: Session, produto: ProdutoCreate) -> Produto:
    # 5. Cria instância do Model
    db_produto = Produto(**produto.model_dump())
    
    # 6. Salva no banco
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    
    # 7. Retorna
    return db_produto

# 8. Routes serializa com Schema e retorna JSON
{
  "id": 1,
  "nome": "Arroz",
  "preco": 25.90,
  "quantidade_estoque": 10,
  "created_at": "2026-02-05T10:30:00"
}
```

## 🎯 Responsabilidades de Cada Camada

### 1️⃣ Routes (`app/routes/`)
**Responsabilidade:** Receber requisições HTTP e devolver respostas

✅ Faz:
- Define endpoints (GET, POST, PUT, DELETE)
- Injeta dependências (DB, Auth)
- Trata erros HTTP
- Documenta API (docstrings → Swagger)

❌ Não faz:
- Lógica de negócio
- Acesso direto ao banco
- Validação de dados (usa Schemas)

### 2️⃣ Schemas (`app/schemas/`)
**Responsabilidade:** Validar e serializar dados

✅ Faz:
- Valida tipos de dados
- Valida regras de negócio simples (min, max, regex)
- Serializa objetos para JSON
- Define estrutura de entrada/saída

❌ Não faz:
- Lógica de negócio complexa
- Acesso ao banco
- Autenticação

### 3️⃣ Auth (`app/auth/`)
**Responsabilidade:** Autenticação e autorização

✅ Faz:
- Gera e valida tokens JWT
- Hash de senhas
- Verifica permissões
- Middleware de autenticação

❌ Não faz:
- CRUD de usuários (isso é CRUD)
- Validação de dados (isso é Schema)
- Endpoints (isso é Route)

### 4️⃣ CRUD (`app/crud/`)
**Responsabilidade:** Operações de banco e lógica de negócio

✅ Faz:
- Create, Read, Update, Delete
- Queries complexas
- Lógica de negócio
- Transações

❌ Não faz:
- Validação de entrada (usa Schemas)
- Autenticação (usa Auth)
- Respostas HTTP (retorna objetos)

### 5️⃣ Models (`app/models/`)
**Responsabilidade:** Estrutura do banco de dados

✅ Faz:
- Define tabelas
- Define relacionamentos
- Define tipos de colunas
- Índices e constraints

❌ Não faz:
- Queries (isso é CRUD)
- Validação (isso é Schema)
- Lógica de negócio

### 6️⃣ Database (`app/database.py`)
**Responsabilidade:** Configuração e conexão

✅ Faz:
- Configuração do SQLAlchemy
- Pool de conexões
- Session management
- Dependency injection

❌ Não faz:
- Queries
- Validação
- Lógica de negócio

## 🔗 Dependências Entre Camadas

```
Routes
  ↓ usa
Schemas + Auth
  ↓ usa
CRUD
  ↓ usa
Models
  ↓ usa
Database
```

**Regra de Ouro:** Camadas superiores podem usar inferiores, mas não o contrário!

❌ **Errado:**
```python
# Em models.py
from app.crud import produto  # Models não deve conhecer CRUD!
```

✅ **Certo:**
```python
# Em crud/produto.py
from app.models import Produto  # CRUD pode usar Models
```

## 📦 Imports Corretos

```python
# ✅ Bom
from app.models import Produto, User
from app.schemas.produto import ProdutoCreate
from app.crud import produto as produto_crud
from app.auth.auth import get_current_user

# ❌ Evitar
from app.models.models import *  # Não use *
from models import Produto  # Import relativo sem 'app'
```

## 🎨 Design Patterns Utilizados

### 1. **Repository Pattern** (CRUD Layer)
Abstrai acesso aos dados

### 2. **Dependency Injection** (FastAPI)
Injeta DB session, Auth, etc.

### 3. **DTO Pattern** (Schemas)
Data Transfer Objects para validação

### 4. **Layered Architecture**
Separação clara de responsabilidades

### 5. **Factory Pattern** (Database)
SessionLocal cria sessions

## 🚀 Vantagens desta Arquitetura

1. **Testabilidade** 🧪
   - Cada camada testável isoladamente
   - Mocks fáceis de criar

2. **Manutenibilidade** 🔧
   - Código organizado
   - Fácil localizar bugs

3. **Escalabilidade** 📈
   - Fácil adicionar features
   - Padrão claro para seguir

4. **Reutilização** ♻️
   - CRUD reutilizável em múltiplas routes
   - Schemas compartilhados

5. **Clareza** 📖
   - Responsabilidades bem definidas
   - Fluxo de dados claro

## 📝 Exemplo Completo: Finalizar Lista

```python
# 1. Route recebe requisição
@router.post("/finalizar-lista/{lista_id}")
def finalizar_lista(
    lista_id: int,
    request: FinalizarListaRequest,  # Schema valida
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # Auth
):
    # 2. Delega para CRUD
    compra = compra_crud.finalizar_lista_e_criar_compra(
        db, lista_id, current_user.id, **request.model_dump()
    )
    
    if not compra:
        raise HTTPException(404, "Lista não encontrada")
    
    return compra

# 3. CRUD executa lógica complexa
def finalizar_lista_e_criar_compra(...):
    # Busca lista
    lista = db.query(ListaCompras).filter(...).first()
    
    # Cria compra
    compra = Compra(...)
    db.add(compra)
    
    # Processa cada item
    for item in lista.itens:
        # Lógica de negócio
        processar_item_no_estoque(db, item, ...)
    
    db.commit()
    return compra

# 4. Model define estrutura
class Compra(Base):
    __tablename__ = "compras"
    id = Column(Integer, primary_key=True)
    ...

# 5. Schema valida resposta
class CompraResponse(BaseModel):
    id: int
    valor_total: float
    ...
```

Esta arquitetura garante código limpo, testável e escalável! ✨
