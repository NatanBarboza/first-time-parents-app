from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse
from app.schemas.produto import ProdutoResponse
from app.auth.auth import get_current_active_user
from app.models import User
from app.crud import categoria as crud

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista categorias de itens (requer autenticação)."""
    return crud.get_categorias(db, skip=skip, limit=limit, search=search)


@router.get("/{categoria_id}/produtos", response_model=List[ProdutoResponse])
def listar_produtos_da_categoria(
    categoria_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista produtos vinculados à categoria (requer autenticação)."""
    categoria = crud.get_categoria(db, categoria_id)
    if categoria is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return crud.get_produtos_by_categoria(db, categoria_id, skip=skip, limit=limit)


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obter_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Obtém uma categoria específica (requer autenticação)."""
    categoria = crud.get_categoria(db, categoria_id)
    if categoria is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria


@router.post("/", response_model=CategoriaResponse, status_code=201)
def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Cria uma nova categoria (requer autenticação)."""
    try:
        return crud.create_categoria(db, categoria)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def atualizar_categoria(
    categoria_id: int,
    categoria: CategoriaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Atualiza uma categoria (requer autenticação)."""
    db_categoria = crud.update_categoria(db, categoria_id, categoria)
    if db_categoria is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return db_categoria


@router.delete("/{categoria_id}", status_code=204)
def deletar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove uma categoria (requer autenticação)."""
    if not crud.delete_categoria(db, categoria_id):
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return None
