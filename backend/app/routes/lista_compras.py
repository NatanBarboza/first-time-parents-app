from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.auth import get_current_active_user
from app.models import User, ItemListaCompras
from app.schemas.lista_compras import (
    ListaComprasCreate,
    ListaComprasUpdate,
    ListaComprasResponse,
    ItemListaComprasCreate,
    ItemListaComprasUpdate,
    ItemListaComprasResponse
)
from app.crud import lista_compras as crud

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

@router.get("/{lista_id}/produtos-sugeridos", response_model=List[dict])
def listar_produtos_para_lista(
    lista_id: int,
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista produtos disponíveis para adicionar à lista"""
    from app.crud import produto as produto_crud
    
    # Verificar se lista pertence ao usuário
    lista = crud.get_lista_compras(db, lista_id, current_user.id)
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    
    # Buscar produtos
    produtos = produto_crud.get_produtos(db, search=search, limit=50)
    
    # Retornar com formato adequado
    return [
        {
            "id": p.id,
            "nome": p.nome,
            "preco": p.preco,
            "categoria": p.categoria,
            "quantidade_estoque": p.quantidade_estoque
        }
        for p in produtos
    ]

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

@router.post("/{lista_id}/adicionar-produto/{produto_id}", response_model=ItemListaComprasResponse)
def adicionar_produto_existente(
    lista_id: int,
    produto_id: int,
    quantidade: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Adiciona um produto existente à lista de compras.
    Se o produto já estiver na lista, incrementa a quantidade.
    """
    from app.crud import produto as produto_crud
    
    # Verificar se lista existe e pertence ao usuário
    lista = crud.get_lista_compras(db, lista_id, current_user.id)
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista de compras não encontrada"
        )
    
    # Buscar produto
    produto = produto_crud.get_produto(db, produto_id)
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    # Verificar se produto já está na lista
    item_existente = db.query(ItemListaCompras).filter(
        ItemListaCompras.lista_id == lista_id,
        ItemListaCompras.produto_id == produto_id
    ).first()
    
    if item_existente:
        # Atualizar quantidade do item existente
        item_existente.quantidade += quantidade
        db.commit()
        db.refresh(item_existente)
        return item_existente
    
    # Criar novo item da lista vinculado ao produto
    from app.schemas.lista_compras import ItemListaComprasCreate
    item_data = ItemListaComprasCreate(
        nome_item=produto.nome,
        quantidade=quantidade,
        preco_estimado=produto.preco,
        produto_id=produto.id,
        observacao=produto.descricao if produto.descricao else None
    )
    
    db_item = crud.create_item_lista(db, item_data, lista_id, current_user.id)
    return db_item
