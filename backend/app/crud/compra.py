from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.models import Compra, ItemCompra, Produto, ListaCompras, ItemListaCompras
from app.schemas.compra import CompraCreate, CompraUpdate

# CRUD - Compras
def get_compra(db: Session, compra_id: int, user_id: int) -> Optional[Compra]:
    """Obtém uma compra específica do usuário"""
    return db.query(Compra).filter(
        Compra.id == compra_id,
        Compra.user_id == user_id
    ).first()

def get_compras(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    data_inicial: Optional[datetime] = None,
    data_final: Optional[datetime] = None
) -> List[Compra]:
    """Lista todas as compras do usuário"""
    query = db.query(Compra).filter(Compra.user_id == user_id)
    
    if data_inicial:
        query = query.filter(Compra.data_compra >= data_inicial)
    if data_final:
        query = query.filter(Compra.data_compra <= data_final)
    
    return query.order_by(desc(Compra.data_compra)).offset(skip).limit(limit).all()

def create_compra(db: Session, compra: CompraCreate, user_id: int) -> Compra:
    """Cria uma nova compra"""
    # Calcular valor total
    valor_total = sum(
        item.preco_unitario * item.quantidade 
        for item in compra.itens
    )
    
    # Criar compra
    db_compra = Compra(
        user_id=user_id,
        lista_id=compra.lista_id,
        local_compra=compra.local_compra,
        observacao=compra.observacao,
        valor_total=valor_total
    )
    db.add(db_compra)
    db.flush()
    
    # Adicionar itens
    for item in compra.itens:
        preco_total = item.preco_unitario * item.quantidade
        db_item = ItemCompra(
            compra_id=db_compra.id,
            produto_id=item.produto_id,
            nome_item=item.nome_item,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario,
            preco_total=preco_total,
            categoria=item.categoria
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_compra)
    return db_compra

def update_compra(
    db: Session,
    compra_id: int,
    compra_update: CompraUpdate,
    user_id: int
) -> Optional[Compra]:
    """Atualiza uma compra"""
    db_compra = get_compra(db, compra_id, user_id)
    if not db_compra:
        return None
    
    update_data = compra_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_compra, key, value)
    
    db.commit()
    db.refresh(db_compra)
    return db_compra

def delete_compra(db: Session, compra_id: int, user_id: int) -> bool:
    """Deleta uma compra"""
    db_compra = get_compra(db, compra_id, user_id)
    if not db_compra:
        return False
    
    db.delete(db_compra)
    db.commit()
    return True

def finalizar_lista_e_criar_compra(
    db: Session,
    lista_id: int,
    user_id: int,
    local_compra: Optional[str] = None,
    observacao: Optional[str] = None,
    adicionar_ao_estoque: bool = True,
    atualizar_precos: bool = True
) -> Optional[Compra]:
    """
    Finaliza uma lista de compras e cria registro de compra.
    Opcionalmente adiciona produtos ao estoque.
    """
    # Buscar lista
    lista = db.query(ListaCompras).filter(
        ListaCompras.id == lista_id,
        ListaCompras.user_id == user_id
    ).first()
    
    if not lista:
        return None
    
    # Buscar apenas itens comprados
    itens_comprados = [item for item in lista.itens if item.comprado]
    
    if not itens_comprados:
        return None
    
    # Calcular valor total
    valor_total = sum(
        (item.preco_estimado or 0) * item.quantidade 
        for item in itens_comprados
    )
    
    # Criar compra
    db_compra = Compra(
        user_id=user_id,
        lista_id=lista_id,
        local_compra=local_compra,
        observacao=observacao,
        valor_total=valor_total
    )
    db.add(db_compra)
    db.flush()
    
    # Processar cada item
    for item in itens_comprados:
        preco_unitario = item.preco_estimado or 0
        preco_total = preco_unitario * item.quantidade
        
        # Criar item da compra
        db_item = ItemCompra(
            compra_id=db_compra.id,
            produto_id=item.produto_id,
            nome_item=item.nome_item,
            quantidade=item.quantidade,
            preco_unitario=preco_unitario,
            preco_total=preco_total,
            categoria=None
        )
        db.add(db_item)
        
        # Adicionar/atualizar no estoque
        if adicionar_ao_estoque:
            processar_item_no_estoque(
                db, 
                item, 
                preco_unitario if atualizar_precos else None
            )
    
    # Marcar lista como concluída
    lista.concluida = True
    
    db.commit()
    db.refresh(db_compra)
    return db_compra

def processar_item_no_estoque(
    db: Session,
    item: ItemListaCompras,
    novo_preco: Optional[float] = None
):
    """
    Adiciona ou atualiza produto no estoque baseado no item da lista
    """
    produto = None
    
    # Se tem produto_id vinculado, usar esse produto
    if item.produto_id:
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
    else:
        # Tentar encontrar produto pelo nome (case-insensitive)
        produto = db.query(Produto).filter(
            Produto.nome.ilike(item.nome_item)
        ).first()
    
    if produto:
        # Atualizar produto existente
        produto.quantidade_estoque += item.quantidade
        if novo_preco is not None and novo_preco > 0:
            produto.preco = novo_preco
    else:
        # Criar novo produto
        produto = Produto(
            nome=item.nome_item,
            descricao=item.observacao or f"Adicionado automaticamente da lista de compras",
            preco=novo_preco or 0,
            quantidade_estoque=item.quantidade,
            categoria=None
        )
        db.add(produto)

def get_estatisticas_compras(db: Session, user_id: int, dias: int = 30) -> dict:
    """Retorna estatísticas de compras do usuário"""
    data_inicial = datetime.now() - timedelta(days=dias)
    
    compras = db.query(Compra).filter(
        Compra.user_id == user_id,
        Compra.data_compra >= data_inicial
    ).all()
    
    total_gasto = sum(c.valor_total for c in compras)
    total_compras = len(compras)
    media_por_compra = total_gasto / total_compras if total_compras > 0 else 0
    
    # Produtos mais comprados
    itens = db.query(ItemCompra).join(Compra).filter(
        Compra.user_id == user_id,
        Compra.data_compra >= data_inicial
    ).all()
    
    produtos_count = {}
    for item in itens:
        nome = item.nome_item
        if nome in produtos_count:
            produtos_count[nome]['quantidade'] += item.quantidade
            produtos_count[nome]['total_gasto'] += item.preco_total
        else:
            produtos_count[nome] = {
                'quantidade': item.quantidade,
                'total_gasto': item.preco_total
            }
    
    produtos_mais_comprados = sorted(
        produtos_count.items(),
        key=lambda x: x[1]['quantidade'],
        reverse=True
    )[:10]
    
    return {
        'total_compras': total_compras,
        'total_gasto': total_gasto,
        'media_por_compra': media_por_compra,
        'produtos_mais_comprados': [
            {
                'nome': nome,
                'quantidade': dados['quantidade'],
                'total_gasto': dados['total_gasto']
            }
            for nome, dados in produtos_mais_comprados
        ]
    }
