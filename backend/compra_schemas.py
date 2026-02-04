from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Item da Compra
class ItemCompraBase(BaseModel):
    nome_item: str = Field(..., min_length=1, max_length=255)
    quantidade: int = Field(..., ge=1)
    preco_unitario: float = Field(..., ge=0)
    categoria: Optional[str] = Field(None, max_length=100)
    produto_id: Optional[int] = None

class ItemCompraCreate(ItemCompraBase):
    pass

class ItemCompraResponse(ItemCompraBase):
    id: int
    compra_id: int
    preco_total: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Compra
class CompraBase(BaseModel):
    local_compra: Optional[str] = Field(None, max_length=255)
    observacao: Optional[str] = None
    lista_id: Optional[int] = None

class CompraCreate(CompraBase):
    itens: List[ItemCompraCreate]

class CompraUpdate(BaseModel):
    local_compra: Optional[str] = Field(None, max_length=255)
    observacao: Optional[str] = None

class CompraResponse(CompraBase):
    id: int
    user_id: int
    data_compra: datetime
    valor_total: float
    created_at: datetime
    itens: List[ItemCompraResponse] = []
    
    class Config:
        from_attributes = True

class CompraSummary(BaseModel):
    """Resumo da compra sem itens detalhados"""
    id: int
    data_compra: datetime
    local_compra: Optional[str]
    valor_total: float
    total_itens: int
    
    class Config:
        from_attributes = True

class FinalizarListaRequest(BaseModel):
    """Request para finalizar lista e criar compra"""
    local_compra: Optional[str] = None
    observacao: Optional[str] = None
    adicionar_ao_estoque: bool = True
    atualizar_precos: bool = True
