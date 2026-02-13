from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AssinaturaCreate(BaseModel):
    plano: str = Field(..., pattern="^(mensal|anual)$")


class AssinaturaResponse(BaseModel):
    id: int
    user_id: int
    plano: str
    status: str
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
