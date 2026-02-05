from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routes.auth import router as auth_router
from app.routes.produto import router as produto_router
from app.routes.lista_compras import router as lista_compras_router
from app.routes.compra import router as compra_router

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Gestão de Produtos",
    description="API para gerenciar produtos, listas de compras e histórico com autenticação JWT",
    version="2.2.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth_router)
app.include_router(produto_router)
app.include_router(lista_compras_router)
app.include_router(compra_router)

@app.get("/")
def read_root():
    return {
        "message": "API de Gestão de Produtos com Autenticação JWT",
        "version": "2.2.0",
        "features": ["Produtos", "Autenticação", "Listas de Compras", "Histórico de Compras"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
