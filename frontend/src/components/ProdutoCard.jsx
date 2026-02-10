import React from 'react';

function ProdutoCard({ produto, categorias = [], onEdit, onDelete }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const categoriaNome = produto.categoria_id && categorias.length
    ? (categorias.find(c => c.id === produto.categoria_id)?.nome ?? null)
    : null;

  const limite = produto.estoque_minimo != null ? produto.estoque_minimo : 5;
  const estoqueBaixo = produto.quantidade_estoque <= limite;

  return (
    <div className={`produto-card ${estoqueBaixo ? 'estoque-baixo' : ''}`}>
      <h3>{produto.nome}</h3>
      {produto.descricao && <p>{produto.descricao}</p>}
      <p><strong>Preço:</strong> {formatPrice(produto.preco)}</p>
      <p><strong>Estoque:</strong> {produto.quantidade_estoque} unidades {estoqueBaixo && <span className="badge-estoque-baixo">Estoque baixo</span>}</p>
      {produto.estoque_minimo != null && <p><strong>Estoque mínimo:</strong> {produto.estoque_minimo}</p>}
      {categoriaNome && <p><strong>Categoria:</strong> {categoriaNome}</p>}
      {produto.codigo_barras && <p><strong>Código:</strong> {produto.codigo_barras}</p>}
      
      <div className="produto-actions">
        <button className="btn btn-primary" onClick={() => onEdit(produto)}>
          Editar
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(produto.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}

export default ProdutoCard;
