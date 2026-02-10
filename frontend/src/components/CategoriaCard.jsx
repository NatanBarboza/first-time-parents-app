import React from 'react';

function CategoriaCard({ categoria, onEdit, onDelete }) {
  return (
    <div className="produto-card categoria-card">
      <h3>{categoria.nome}</h3>
      {categoria.descricao && <p>{categoria.descricao}</p>}
      <div className="produto-actions">
        <button className="btn btn-primary" onClick={() => onEdit(categoria)}>
          Editar
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(categoria.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}

export default CategoriaCard;
