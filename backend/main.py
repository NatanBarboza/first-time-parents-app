from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
import crud
from database import engine, get_db
from auth_routes import router as auth_router
from lista_compras_routes import router as lista_compras_router
from compra_routes import router as compra_router
from auth import get_current_active_user
from models import User

# Criar tabelas
models.Base.metadata.create_all(bind=engine)

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
app.include_router(lista_compras_router)
app.include_router(compra_router)

@app.get("/")
def read_root():
    return {
        "message": "API de Gestão de Produtos com Autenticação JWT",
        "version": "2.2.0",
        "features": ["Produtos", "Autenticação", "Listas de Compras", "Histórico de Compras"]
    }

@app.get("/produtos/", response_model=List[schemas.ProdutoResponse])
def listar_produtos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista produtos (requer autenticação)"""
    produtos = crud.get_produtos(db, skip=skip, limit=limit, search=search)
    return produtos

@app.get("/produtos/{produto_id}", response_model=schemas.ProdutoResponse)
def obter_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém um produto específico (requer autenticação)"""
    produto = crud.get_produto(db, produto_id)
    if produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@app.post("/produtos/", response_model=schemas.ProdutoResponse, status_code=201)
def criar_produto(
    produto: schemas.ProdutoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cria um novo produto (requer autenticação)"""
    try:
        return crud.create_produto(db, produto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/produtos/{produto_id}", response_model=schemas.ProdutoResponse)
def atualizar_produto(
    produto_id: int,
    produto: schemas.ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza um produto (requer autenticação)"""
    db_produto = crud.update_produto(db, produto_id, produto)
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return db_produto

@app.delete("/produtos/{produto_id}", status_code=204)
def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deleta um produto (requer autenticação)"""
    if not crud.delete_produto(db, produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
