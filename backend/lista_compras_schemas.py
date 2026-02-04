from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Item da Lista de Compras
class ItemListaComprasBase(BaseModel):
    nome_item: str = Field(..., min_length=1, max_length=255)
    quantidade: int = Field(default=1, ge=1)
    produto_id: Optional[int] = None
    preco_estimado: Optional[float] = Field(None, ge=0)
    observacao: Optional[str] = None

class ItemListaComprasCreate(ItemListaComprasBase):
    pass

class ItemListaComprasUpdate(BaseModel):
    nome_item: Optional[str] = Field(None, min_length=1, max_length=255)
    quantidade: Optional[int] = Field(None, ge=1)
    comprado: Optional[bool] = None
    preco_estimado: Optional[float] = Field(None, ge=0)
    observacao: Optional[str] = None

class ItemListaComprasResponse(ItemListaComprasBase):
    id: int
    lista_id: int
    comprado: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Lista de Compras
class ListaComprasBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    descricao: Optional[str] = None

class ListaComprasCreate(ListaComprasBase):
    pass

class ListaComprasUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    descricao: Optional[str] = None
    concluida: Optional[bool] = None

class ListaComprasResponse(ListaComprasBase):
    id: int
    user_id: int
    concluida: bool
    created_at: datetime
    updated_at: Optional[datetime]
    itens: List[ItemListaComprasResponse] = []
    
    class Config:
        from_attributes = True

class ListaComprasSummary(BaseModel):
    """Resumo da lista sem os itens"""
    id: int
    nome: str
    descricao: Optional[str]
    concluida: bool
    total_itens: int
    itens_comprados: int
    created_at: datetime
    
    class Config:
        from_attributes = True
