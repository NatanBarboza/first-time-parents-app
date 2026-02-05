from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Produto
from app.schemas.produto import ProdutoCreate, ProdutoUpdate
from typing import List, Optional

def get_produto(db: Session, produto_id: int) -> Optional[Produto]:
    return db.query(Produto).filter(Produto.id == produto_id).first()

def get_produtos(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Produto]:
    query = db.query(Produto)
    
    if search:
        search_filter = or_(
            Produto.nome.ilike(f"%{search}%"),
            Produto.descricao.ilike(f"%{search}%"),
            Produto.categoria.ilike(f"%{search}%"),
            Produto.codigo_barras.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    return query.offset(skip).limit(limit).all()

def create_produto(db: Session, produto: ProdutoCreate) -> Produto:
    db_produto = Produto(**produto.model_dump())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def update_produto(db: Session, produto_id: int, produto: ProdutoUpdate) -> Optional[Produto]:
    db_produto = get_produto(db, produto_id)
    if db_produto:
        update_data = produto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_produto, key, value)
        db.commit()
        db.refresh(db_produto)
    return db_produto

def delete_produto(db: Session, produto_id: int) -> bool:
    db_produto = get_produto(db, produto_id)
    if db_produto:
        db.delete(db_produto)
        db.commit()
        return True
    return False
