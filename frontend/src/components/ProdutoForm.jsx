import React, { useState, useEffect } from 'react';

function ProdutoForm({ produto, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade_estoque: '',
    categoria: '',
    codigo_barras: '',
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        preco: produto.preco || '',
        quantidade_estoque: produto.quantidade_estoque || '',
        categoria: produto.categoria || '',
        codigo_barras: produto.codigo_barras || '',
      });
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      preco: parseFloat(formData.preco),
      quantidade_estoque: parseInt(formData.quantidade_estoque) || 0,
    };

    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="nome">Nome *</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="preco">Preço *</label>
        <input
          type="number"
          id="preco"
          name="preco"
          step="0.01"
          min="0"
          value={formData.preco}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="quantidade_estoque">Quantidade em Estoque</label>
        <input
          type="number"
          id="quantidade_estoque"
          name="quantidade_estoque"
          min="0"
          value={formData.quantidade_estoque}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="categoria">Categoria</label>
        <input
          type="text"
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="codigo_barras">Código de Barras</label>
        <input
          type="text"
          id="codigo_barras"
          name="codigo_barras"
          value={formData.codigo_barras}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-success">
          {produto ? 'Atualizar' : 'Criar'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProdutoForm;
