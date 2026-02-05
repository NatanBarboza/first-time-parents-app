from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_active_user
from models import User
from lista_compras_schemas import (
    ListaComprasCreate,
    ListaComprasUpdate,
    ListaComprasResponse,
    ItemListaComprasCreate,
    ItemListaComprasUpdate,
    ItemListaComprasResponse
)
import lista_compras_crud as crud

router = APIRouter(prefix="/listas-compras", tags=["Listas de Compras"])

# Rotas de Listas de Compras
@router.get("/", response_model=List[ListaComprasResponse])
def listar_listas_compras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    apenas_ativas: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as listas de compras do usuário"""
    listas = crud.get_listas_compras(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        apenas_ativas=apenas_ativas
    )
    return listas

@router.get("/{lista_id}", response_model=ListaComprasResponse)
def obter_lista_compras(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém uma lista de compras específica"""
    lista = crud.get_lista_compras(db, lista_id, current_user.id)
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    return lista

@router.get("/{lista_id}/resumo")
def obter_resumo_lista(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém resumo da lista de compras"""
    resumo = crud.get_resumo_lista(db, lista_id, current_user.id)
    if not resumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    return resumo

@router.post("/", response_model=ListaComprasResponse, status_code=status.HTTP_201_CREATED)
def criar_lista_compras(
    lista: ListaComprasCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cria uma nova lista de compras"""
    return crud.create_lista_compras(db, lista, current_user.id)

@router.put("/{lista_id}", response_model=ListaComprasResponse)
def atualizar_lista_compras(
    lista_id: int,
    lista_update: ListaComprasUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza uma lista de compras"""
    lista = crud.update_lista_compras(db, lista_id, lista_update, current_user.id)
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    return lista

@router.delete("/{lista_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_lista_compras(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deleta uma lista de compras"""
    if not crud.delete_lista_compras(db, lista_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    return None

# Rotas de Itens da Lista
@router.post("/{lista_id}/itens", response_model=ItemListaComprasResponse, status_code=status.HTTP_201_CREATED)
def adicionar_item_lista(
    lista_id: int,
    item: ItemListaComprasCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Adiciona um item à lista de compras"""
    db_item = crud.create_item_lista(db, item, lista_id, current_user.id)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    return db_item

@router.put("/itens/{item_id}", response_model=ItemListaComprasResponse)
def atualizar_item_lista(
    item_id: int,
    item_update: ItemListaComprasUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza um item da lista"""
    item = crud.update_item_lista(db, item_id, item_update, current_user.id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    return item

@router.delete("/itens/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_item_lista(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove um item da lista"""
    if not crud.delete_item_lista(db, item_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    return None

@router.patch("/itens/{item_id}/toggle-comprado", response_model=ItemListaComprasResponse)
def toggle_item_comprado(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marca/desmarca um item como comprado"""
    item = crud.toggle_item_comprado(db, item_id, current_user.id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    return item
