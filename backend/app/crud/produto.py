from sqlalchemy.orm import Session
from sqlalchemy import or_, case
from app.models import Produto, Categoria
from app.schemas.produto import ProdutoCreate, ProdutoUpdate
from typing import List, Optional

# Limite padrão quando o produto não tem estoque_minimo definido
ESTOQUE_MINIMO_PADRAO = 5


def get_produto(db: Session, produto_id: int) -> Optional[Produto]:
    return db.query(Produto).filter(Produto.id == produto_id).first()


def get_produtos(
    db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None
) -> List[Produto]:
    query = db.query(Produto)
    if search:
        query = query.outerjoin(Categoria).filter(
            or_(
                Produto.nome.ilike(f"%{search}%"),
                Produto.descricao.ilike(f"%{search}%"),
                Categoria.nome.ilike(f"%{search}%"),
                Produto.codigo_barras.ilike(f"%{search}%"),
            )
        )
    return query.offset(skip).limit(limit).all()


def get_produtos_estoque_baixo(
    db: Session,
    limite_padrao: int = ESTOQUE_MINIMO_PADRAO,
) -> List[Produto]:
    """
    Retorna produtos em estoque baixo: quantidade_estoque <= estoque_minimo (ou limite_padrao se estoque_minimo for null).
    """
    limite = case((Produto.estoque_minimo.is_(None), limite_padrao), else_=Produto.estoque_minimo)
    return db.query(Produto).filter(Produto.quantidade_estoque <= limite).all()


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
