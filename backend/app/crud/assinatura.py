from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Assinatura
from app.schemas.assinatura import AssinaturaCreate
from typing import Optional, List


def create_assinatura(db: Session, user_id: int, dados: AssinaturaCreate) -> Assinatura:
    data_inicio = datetime.utcnow()
    data_fim = None
    if dados.plano == "anual":
        data_fim = data_inicio + timedelta(days=365)
    assinatura = Assinatura(
        user_id=user_id,
        plano=dados.plano,
        status="ativa",
        data_inicio=data_inicio,
        data_fim=data_fim,
    )
    db.add(assinatura)
    db.commit()
    db.refresh(assinatura)
    return assinatura


def get_ultima_assinatura(db: Session, user_id: int) -> Optional[Assinatura]:
    return (
        db.query(Assinatura)
        .filter(Assinatura.user_id == user_id)
        .order_by(Assinatura.created_at.desc())
        .first()
    )


def get_assinatura_ativa(db: Session, user_id: int) -> Optional[Assinatura]:
    return (
        db.query(Assinatura)
        .filter(Assinatura.user_id == user_id, Assinatura.status == "ativa")
        .order_by(Assinatura.created_at.desc())
        .first()
    )


def cancelar_assinatura(db: Session, assinatura_id: int, user_id: int) -> Optional[Assinatura]:
    assinatura = db.query(Assinatura).filter(
        Assinatura.id == assinatura_id,
        Assinatura.user_id == user_id,
    ).first()
    if assinatura:
        assinatura.status = "cancelada"
        db.commit()
        db.refresh(assinatura)
    return assinatura
