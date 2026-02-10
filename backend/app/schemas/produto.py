from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from datetime import datetime


def _normalize_categoria_id(v: Any) -> Optional[int]:
    if v is None or v == "" or (isinstance(v, str) and not v.strip()):
        return None
    if isinstance(v, int):
        return v
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


class ProdutoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    descricao: Optional[str] = None
    preco: float = Field(..., gt=0)
    quantidade_estoque: int = Field(default=0, ge=0)
    estoque_minimo: Optional[int] = Field(None, ge=0, description="Abaixo ou igual = estoque baixo; se vazio, usa limite padrão")
    categoria_id: Optional[int] = None
    codigo_barras: Optional[str] = Field(None, max_length=50)

    @field_validator("categoria_id", mode="before")
    @classmethod
    def normalize_categoria_id(cls, v: Any) -> Optional[int]:
        return _normalize_categoria_id(v)

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    descricao: Optional[str] = None
    preco: Optional[float] = Field(None, gt=0)
    quantidade_estoque: Optional[int] = Field(None, ge=0)
    estoque_minimo: Optional[int] = Field(None, ge=0)
    categoria_id: Optional[int] = None
    codigo_barras: Optional[str] = Field(None, max_length=50)

    @field_validator("categoria_id", mode="before")
    @classmethod
    def normalize_categoria_id(cls, v: Any) -> Optional[int]:
        return _normalize_categoria_id(v)

class ProdutoResponse(ProdutoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
