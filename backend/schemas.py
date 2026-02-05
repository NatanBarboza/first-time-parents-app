from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProdutoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    descricao: Optional[str] = None
    preco: float = Field(..., gt=0)
    quantidade_estoque: int = Field(default=0, ge=0)
    categoria: Optional[str] = Field(None, max_length=100)
    codigo_barras: Optional[str] = Field(None, max_length=50)

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    descricao: Optional[str] = None
    preco: Optional[float] = Field(None, gt=0)
    quantidade_estoque: Optional[int] = Field(None, ge=0)
    categoria: Optional[str] = Field(None, max_length=100)
    codigo_barras: Optional[str] = Field(None, max_length=50)

class ProdutoResponse(ProdutoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
