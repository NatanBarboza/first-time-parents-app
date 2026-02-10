import React, { useState, useEffect } from 'react';

function ProdutoForm({ produto, categorias = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade_estoque: '',
    estoque_minimo: '',
    categoria_id: '',
    codigo_barras: '',
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        preco: produto.preco || '',
        quantidade_estoque: produto.quantidade_estoque ?? '',
        estoque_minimo: produto.estoque_minimo ?? '',
        categoria_id: produto.categoria_id ?? '',
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
    const catId = formData.categoria_id && String(formData.categoria_id).trim();
    const dataToSend = {
      nome: String(formData.nome).trim(),
      descricao: formData.descricao ? String(formData.descricao).trim() : null,
      preco: parseFloat(formData.preco),
      quantidade_estoque: parseInt(formData.quantidade_estoque, 10) || 0,
      estoque_minimo: formData.estoque_minimo !== '' && formData.estoque_minimo !== undefined
        ? parseInt(String(formData.estoque_minimo), 10)
        : null,
      codigo_barras: formData.codigo_barras ? String(formData.codigo_barras).trim() : null,
      categoria_id: catId ? parseInt(catId, 10) : null,
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
        <label htmlFor="estoque_minimo">Estoque mínimo (alerta)</label>
        <input
          type="number"
          id="estoque_minimo"
          name="estoque_minimo"
          min="0"
          placeholder="Vazio = usa padrão (5)"
          value={formData.estoque_minimo}
          onChange={handleChange}
        />
        <small className="help-text">Quando o estoque ficar ≤ este valor, o produto aparece como &quot;estoque baixo&quot; na lista de compras.</small>
      </div>

      <div className="form-group">
        <label htmlFor="categoria_id">Categoria</label>
        <select
          id="categoria_id"
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleChange}
        >
          <option value="">Nenhuma</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
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
