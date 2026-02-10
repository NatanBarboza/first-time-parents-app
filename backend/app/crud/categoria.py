from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Categoria, Produto
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate
from typing import List, Optional


def get_categoria(db: Session, categoria_id: int) -> Optional[Categoria]:
    return db.query(Categoria).filter(Categoria.id == categoria_id).first()


def get_produtos_by_categoria(
    db: Session, categoria_id: int, skip: int = 0, limit: int = 100
) -> List[Produto]:
    return (
        db.query(Produto)
        .filter(Produto.categoria_id == categoria_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_categorias(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
) -> List[Categoria]:
    query = db.query(Categoria)
    if search:
        query = query.filter(
            or_(
                Categoria.nome.ilike(f"%{search}%"),
                Categoria.descricao.ilike(f"%{search}%"),
            )
        )
    return query.offset(skip).limit(limit).all()


def create_categoria(db: Session, categoria: CategoriaCreate) -> Categoria:
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


def update_categoria(
    db: Session, categoria_id: int, categoria: CategoriaUpdate
) -> Optional[Categoria]:
    db_categoria = get_categoria(db, categoria_id)
    if db_categoria:
        update_data = categoria.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_categoria, key, value)
        db.commit()
        db.refresh(db_categoria)
    return db_categoria


def delete_categoria(db: Session, categoria_id: int) -> bool:
    db_categoria = get_categoria(db, categoria_id)
    if db_categoria:
        db.query(Produto).filter(Produto.categoria_id == categoria_id).update(
            {Produto.categoria_id: None}
        )
        db.delete(db_categoria)
        db.commit()
        return True
    return False
