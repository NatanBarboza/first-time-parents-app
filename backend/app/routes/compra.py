from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.auth.auth import get_current_active_user
from app.models import User
from app.schemas.compra import (
    CompraCreate,
    CompraUpdate,
    CompraResponse,
    CompraSummary,
    FinalizarListaRequest
)
from app.crud import compra as crud

router = APIRouter(prefix="/compras", tags=["Histórico de Compras"])

@router.get("/", response_model=List[CompraResponse])
def listar_compras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    data_inicial: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    data_final: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as compras do usuário"""
    # Converter strings para datetime se fornecidas
    dt_inicial = datetime.fromisoformat(data_inicial) if data_inicial else None
    dt_final = datetime.fromisoformat(data_final) if data_final else None
    
    compras = crud.get_compras(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        data_inicial=dt_inicial,
        data_final=dt_final
    )
    return compras

@router.get("/estatisticas")
def obter_estatisticas(
    dias: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém estatísticas de compras do usuário"""
    return crud.get_estatisticas_compras(db, current_user.id, dias)

@router.get("/{compra_id}", response_model=CompraResponse)
def obter_compra(
    compra_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém uma compra específica"""
    compra = crud.get_compra(db, compra_id, current_user.id)
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra não encontrada"
        )
    return compra

@router.post("/", response_model=CompraResponse, status_code=status.HTTP_201_CREATED)
def criar_compra(
    compra: CompraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cria uma nova compra manualmente"""
    return crud.create_compra(db, compra, current_user.id)

@router.post("/finalizar-lista/{lista_id}", response_model=CompraResponse)
def finalizar_lista(
    lista_id: int,
    request: FinalizarListaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Finaliza uma lista de compras:
    - Cria registro de compra com itens marcados como comprados
    - Adiciona produtos ao estoque (opcional)
    - Atualiza preços dos produtos (opcional)
    - Marca lista como concluída
    """
    compra = crud.finalizar_lista_e_criar_compra(
        db,
        lista_id=lista_id,
        user_id=current_user.id,
        local_compra=request.local_compra,
        observacao=request.observacao,
        adicionar_ao_estoque=request.adicionar_ao_estoque,
        atualizar_precos=request.atualizar_precos
    )
    
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista não encontrada ou não possui itens comprados"
        )
    
    return compra

@router.put("/{compra_id}", response_model=CompraResponse)
def atualizar_compra(
    compra_id: int,
    compra_update: CompraUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza informações da compra (local, observação)"""
    compra = crud.update_compra(db, compra_id, compra_update, current_user.id)
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra não encontrada"
        )
    return compra

@router.delete("/{compra_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_compra(
    compra_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deleta uma compra do histórico"""
    if not crud.delete_compra(db, compra_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra não encontrada"
        )
    return None
