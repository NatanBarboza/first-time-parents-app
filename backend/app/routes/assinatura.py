from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.assinatura import AssinaturaCreate, AssinaturaResponse
from app.auth.auth import get_current_active_user
from app.models import User
from app.crud import assinatura as crud
from app.email_service import enviar_confirmacao_assinatura

router = APIRouter(prefix="/assinaturas", tags=["Assinaturas"])


@router.post("/", response_model=AssinaturaResponse, status_code=201)
def criar_assinatura(
    dados: AssinaturaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Cria uma assinatura para o usuário logado e envia confirmação por e-mail."""
    assinatura = crud.create_assinatura(db, current_user.id, dados)
    enviar_confirmacao_assinatura(
        current_user.email,
        current_user.full_name or current_user.username,
        assinatura.plano,
    )
    return assinatura


@router.get("/me", response_model=Optional[AssinaturaResponse])
def minha_assinatura(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna a assinatura ativa do usuário (ou a mais recente)."""
    assinatura = crud.get_assinatura_ativa(db, current_user.id)
    if assinatura is None:
        assinatura = crud.get_ultima_assinatura(db, current_user.id)
    return assinatura


@router.patch("/me/cancelar", response_model=AssinaturaResponse)
def cancelar_minha_assinatura(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Cancela a assinatura ativa do usuário."""
    assinatura = crud.get_assinatura_ativa(db, current_user.id)
    if assinatura is None:
        raise HTTPException(status_code=404, detail="Nenhuma assinatura ativa encontrada")
    return crud.cancelar_assinatura(db, assinatura.id, current_user.id)
