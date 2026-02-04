from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from models import ListaCompras, ItemListaCompras
from lista_compras_schemas import (
    ListaComprasCreate,
    ListaComprasUpdate,
    ItemListaComprasCreate,
    ItemListaComprasUpdate
)

# CRUD - Lista de Compras
def get_lista_compras(db: Session, lista_id: int, user_id: int) -> Optional[ListaCompras]:
    """Obtém uma lista de compras específica do usuário"""
    return db.query(ListaCompras).filter(
        ListaCompras.id == lista_id,
        ListaCompras.user_id == user_id
    ).first()

def get_listas_compras(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    apenas_ativas: bool = False
) -> List[ListaCompras]:
    """Lista todas as listas de compras do usuário"""
    query = db.query(ListaCompras).filter(ListaCompras.user_id == user_id)
    
    if apenas_ativas:
        query = query.filter(ListaCompras.concluida == False)
    
    return query.order_by(ListaCompras.created_at.desc()).offset(skip).limit(limit).all()

def create_lista_compras(db: Session, lista: ListaComprasCreate, user_id: int) -> ListaCompras:
    """Cria uma nova lista de compras"""
    db_lista = ListaCompras(
        **lista.model_dump(),
        user_id=user_id
    )
    db.add(db_lista)
    db.commit()
    db.refresh(db_lista)
    return db_lista

def update_lista_compras(
    db: Session,
    lista_id: int,
    lista_update: ListaComprasUpdate,
    user_id: int
) -> Optional[ListaCompras]:
    """Atualiza uma lista de compras"""
    db_lista = get_lista_compras(db, lista_id, user_id)
    if not db_lista:
        return None
    
    update_data = lista_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lista, key, value)
    
    db.commit()
    db.refresh(db_lista)
    return db_lista

def delete_lista_compras(db: Session, lista_id: int, user_id: int) -> bool:
    """Deleta uma lista de compras"""
    db_lista = get_lista_compras(db, lista_id, user_id)
    if not db_lista:
        return False
    
    db.delete(db_lista)
    db.commit()
    return True

# CRUD - Itens da Lista
def get_item_lista(db: Session, item_id: int, user_id: int) -> Optional[ItemListaCompras]:
    """Obtém um item específico da lista do usuário"""
    return db.query(ItemListaCompras).join(ListaCompras).filter(
        ItemListaCompras.id == item_id,
        ListaCompras.user_id == user_id
    ).first()

def create_item_lista(
    db: Session,
    item: ItemListaComprasCreate,
    lista_id: int,
    user_id: int
) -> Optional[ItemListaCompras]:
    """Adiciona um item à lista de compras"""
    # Verificar se a lista pertence ao usuário
    lista = get_lista_compras(db, lista_id, user_id)
    if not lista:
        return None
    
    db_item = ItemListaCompras(
        **item.model_dump(),
        lista_id=lista_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item_lista(
    db: Session,
    item_id: int,
    item_update: ItemListaComprasUpdate,
    user_id: int
) -> Optional[ItemListaCompras]:
    """Atualiza um item da lista"""
    db_item = get_item_lista(db, item_id, user_id)
    if not db_item:
        return None
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_item_lista(db: Session, item_id: int, user_id: int) -> bool:
    """Remove um item da lista"""
    db_item = get_item_lista(db, item_id, user_id)
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True

def toggle_item_comprado(db: Session, item_id: int, user_id: int) -> Optional[ItemListaCompras]:
    """Marca/desmarca um item como comprado"""
    db_item = get_item_lista(db, item_id, user_id)
    if not db_item:
        return None
    
    db_item.comprado = not db_item.comprado
    db.commit()
    db.refresh(db_item)
    return db_item

def get_resumo_lista(db: Session, lista_id: int, user_id: int) -> Optional[dict]:
    """Retorna resumo da lista de compras"""
    lista = get_lista_compras(db, lista_id, user_id)
    if not lista:
        return None
    
    total_itens = len(lista.itens)
    itens_comprados = sum(1 for item in lista.itens if item.comprado)
    valor_total = sum(
        (item.preco_estimado or 0) * item.quantidade 
        for item in lista.itens
    )
    
    return {
        "id": lista.id,
        "nome": lista.nome,
        "descricao": lista.descricao,
        "concluida": lista.concluida,
        "total_itens": total_itens,
        "itens_comprados": itens_comprados,
        "valor_estimado_total": valor_total,
        "created_at": lista.created_at
    }
