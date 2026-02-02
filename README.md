# Sistema de Gestão de Produtos

Sistema completo para gerenciamento de produtos com backend FastAPI, PostgreSQL e frontend React.

## 📋 Estrutura do Projeto

```
produto-app/
├── backend/
│   ├── main.py              # Aplicação FastAPI
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Schemas Pydantic
│   ├── crud.py              # Operações CRUD
│   ├── database.py          # Configuração do banco
│   ├── requirements.txt     # Dependências Python
│   └── .env.example         # Exemplo de variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # Serviços de API
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Dependências Node
│   └── vite.config.js       # Configuração Vite
└── docker-compose.yml       # Configuração PostgreSQL
```

## 🚀 Como Executar

### 1. Configurar o Banco de Dados

Primeiro, inicie o PostgreSQL com Docker:

```bash
cd produto-app
docker-compose up -d
```

Isso criará um container PostgreSQL rodando na porta 5432.

### 2. Configurar o Backend

```bash
cd backend

# Criar arquivo .env
cp .env.example .env

# Criar ambiente virtual Python
python -m venv venv

# Ativar o ambiente virtual
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar o servidor
python main.py
```

O backend estará disponível em: http://localhost:8000
Documentação da API (Swagger): http://localhost:8000/docs

### 3. Configurar o Frontend

Abra um novo terminal:

```bash
cd frontend

# Instalar dependências
npm install

# Executar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:3000

## 🎯 Funcionalidades

### Backend (FastAPI)

- ✅ API RESTful completa
- ✅ CRUD de produtos
- ✅ Validação de dados com Pydantic
- ✅ Busca por nome, descrição, categoria e código de barras
- ✅ Documentação automática (Swagger/OpenAPI)
- ✅ CORS configurado
- ✅ PostgreSQL como banco de dados

### Frontend (React)

- ✅ Interface moderna e responsiva
- ✅ Listagem de produtos em grid
- ✅ Busca/filtro de produtos
- ✅ Criar novos produtos
- ✅ Editar produtos existentes
- ✅ Excluir produtos
- ✅ Modal para formulários
- ✅ Formatação de moeda (BRL)

## 📊 Modelo de Dados

```python
Produto:
- id (Integer, Primary Key)
- nome (String, obrigatório)
- descricao (Text, opcional)
- preco (Float, obrigatório)
- quantidade_estoque (Integer, padrão: 0)
- categoria (String, opcional)
- codigo_barras (String, único, opcional)
- created_at (DateTime)
- updated_at (DateTime)
```

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Rota raiz |
| GET | `/produtos/` | Lista todos os produtos (com busca opcional) |
| GET | `/produtos/{id}` | Obtém um produto específico |
| POST | `/produtos/` | Cria um novo produto |
| PUT | `/produtos/{id}` | Atualiza um produto |
| DELETE | `/produtos/{id}` | Exclui um produto |

### Exemplo de Request (POST /produtos/)

```json
{
  "nome": "Notebook Dell",
  "descricao": "Notebook Dell Inspiron 15",
  "preco": 3500.00,
  "quantidade_estoque": 10,
  "categoria": "Eletrônicos",
  "codigo_barras": "7891234567890"
}
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **PostgreSQL** - Banco de dados relacional
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

### Frontend
- **React** - Biblioteca para interfaces
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP

## 📝 Próximos Passos

Algumas sugestões para expandir o projeto:

1. **Autenticação e Autorização**
   - Implementar JWT tokens
   - Sistema de usuários e permissões

2. **Funcionalidades Adicionais**
   - Upload de imagens de produtos
   - Histórico de movimentações de estoque
   - Relatórios e dashboards
   - Exportação de dados (Excel, PDF)

3. **Melhorias de UX**
   - Paginação
   - Ordenação de colunas
   - Filtros avançados
   - Notificações toast

4. **Infraestrutura**
   - Testes unitários e de integração
   - CI/CD
   - Docker para toda aplicação
   - Deploy em produção

## 🤝 Contribuindo

Este é um projeto inicial. Sinta-se livre para adaptá-lo às suas necessidades!

## 📄 Licença

Projeto livre para uso pessoal e educacional.
