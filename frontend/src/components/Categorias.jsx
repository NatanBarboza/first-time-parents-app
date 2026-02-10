import React, { useState, useEffect } from 'react';
import CategoriaCard from './CategoriaCard';
import CategoriaForm from './CategoriaForm';
import { categoriaService } from '../services/api';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async (search = '') => {
    try {
      setLoading(true);
      const data = await categoriaService.getAll(search);
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCategorias(searchTerm);
  };

  const handleCreate = () => {
    setEditingCategoria(null);
    setShowModal(true);
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleSave = async (categoriaData) => {
    try {
      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id, categoriaData);
        alert('Categoria atualizada com sucesso!');
      } else {
        await categoriaService.create(categoriaData);
        alert('Categoria criada com sucesso!');
      }
      setShowModal(false);
      setEditingCategoria(null);
      loadCategorias(searchTerm);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Os produtos vinculados ficarão sem categoria.')) {
      try {
        await categoriaService.delete(id);
        alert('Categoria excluída com sucesso!');
        loadCategorias(searchTerm);
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria.');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Buscar</button>
        <button type="button" className="btn btn-success" onClick={handleCreate}>
          Nova Categoria
        </button>
      </form>

      {loading ? (
        <div className="loading">Carregando categorias...</div>
      ) : categorias.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhuma categoria encontrada</h2>
          <p>Comece criando sua primeira categoria!</p>
        </div>
      ) : (
        <div className="produtos-grid">
          {categorias.map(categoria => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <CategoriaForm
              categoria={editingCategoria}
              onSave={handleSave}
              onCancel={() => {
                setShowModal(false);
                setEditingCategoria(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Categorias;
