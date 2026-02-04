import React, { useState, useEffect } from 'react';
import './App.css';
import ProdutoCard from './components/ProdutoCard';
import ProdutoForm from './components/ProdutoForm';
import Login from './components/Login';
import Register from './components/Register';
import ListasCompras from './components/ListasCompras';
import { produtoService, authService } from './services/api';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('produtos'); // 'produtos' ou 'listas'

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentView === 'produtos') {
      loadProdutos();
    }
  }, [isAuthenticated, currentView]);

  const checkAuth = async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        authService.logout();
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProdutos([]);
  };

  const loadProdutos = async (search = '') => {
    try {
      setLoading(true);
      const data = await produtoService.getAll(search);
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert('Erro ao carregar produtos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProdutos(searchTerm);
  };

  const handleCreate = () => {
    setEditingProduto(null);
    setShowModal(true);
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setShowModal(true);
  };

  const handleSave = async (produtoData) => {
    try {
      if (editingProduto) {
        await produtoService.update(editingProduto.id, produtoData);
        alert('Produto atualizado com sucesso!');
      } else {
        await produtoService.create(produtoData);
        alert('Produto criado com sucesso!');
      }
      setShowModal(false);
      setEditingProduto(null);
      loadProdutos(searchTerm);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtoService.delete(id);
        alert('Produto excluído com sucesso!');
        loadProdutos(searchTerm);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto.');
      }
    }
  };

  // Tela de login/registro
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Tela principal (autenticado)
  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>Gestão de Produtos</h1>
          {currentUser && (
            <p className="user-info">
              Olá, <strong>{currentUser.full_name || currentUser.username}</strong>!
            </p>
          )}
        </div>
        <div className="header-actions">
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${currentView === 'produtos' ? 'active' : ''}`}
              onClick={() => setCurrentView('produtos')}
            >
              📦 Produtos
            </button>
            <button
              className={`nav-tab ${currentView === 'listas' ? 'active' : ''}`}
              onClick={() => setCurrentView('listas')}
            >
              🛒 Listas de Compras
            </button>
          </nav>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {currentView === 'listas' ? (
        <ListasCompras />
      ) : (
        <>
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Buscar</button>
            <button type="button" className="btn btn-success" onClick={handleCreate}>
              Novo Produto
            </button>
          </form>

          {loading ? (
            <div className="loading">Carregando produtos...</div>
          ) : produtos.length === 0 ? (
            <div className="empty-state">
              <h2>Nenhum produto encontrado</h2>
              <p>Comece criando seu primeiro produto!</p>
            </div>
          ) : (
            <div className="produtos-grid">
              {produtos.map(produto => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</h2>
                <ProdutoForm
                  produto={editingProduto}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowModal(false);
                    setEditingProduto(null);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
