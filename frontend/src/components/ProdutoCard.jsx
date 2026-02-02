import React from 'react';

function ProdutoCard({ produto, onEdit, onDelete }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="produto-card">
      <h3>{produto.nome}</h3>
      {produto.descricao && <p>{produto.descricao}</p>}
      <p><strong>Preço:</strong> {formatPrice(produto.preco)}</p>
      <p><strong>Estoque:</strong> {produto.quantidade_estoque} unidades</p>
      {produto.categoria && <p><strong>Categoria:</strong> {produto.categoria}</p>}
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
