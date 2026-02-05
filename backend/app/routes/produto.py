from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoResponse
from app.auth.auth import get_current_active_user
from app.models import User
from app.crud import produto as crud

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.get("/", response_model=List[ProdutoResponse])
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

@router.get("/{produto_id}", response_model=ProdutoResponse)
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

@router.post("/", response_model=ProdutoResponse, status_code=201)
def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cria um novo produto (requer autenticação)"""
    try:
        return crud.create_produto(db, produto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{produto_id}", response_model=ProdutoResponse)
def atualizar_produto(
    produto_id: int,
    produto: ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza um produto (requer autenticação)"""
    db_produto = crud.update_produto(db, produto_id, produto)
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return db_produto

@router.delete("/{produto_id}", status_code=204)
def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deleta um produto (requer autenticação)"""
    if not crud.delete_produto(db, produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return None
