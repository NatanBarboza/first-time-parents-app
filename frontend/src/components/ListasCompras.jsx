import React, { useState, useEffect } from 'react';
import { listaComprasService } from '../services/api';

function ListasCompras() {
  const [listas, setListas] = useState([]);
  const [listaAtual, setListaAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNovaLista, setShowNovaLista] = useState(false);
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [novaLista, setNovaLista] = useState({ nome: '', descricao: '' });
  const [novoItem, setNovoItem] = useState({
    nome_item: '',
    quantidade: 1,
    preco_estimado: '',
    observacao: ''
  });

  useEffect(() => {
    loadListas();
  }, []);

  const loadListas = async () => {
    try {
      setLoading(true);
      const data = await listaComprasService.getAll();
      setListas(data);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      alert('Erro ao carregar listas de compras');
    } finally {
      setLoading(false);
    }
  };

  const loadListaDetalhada = async (id) => {
    try {
      const data = await listaComprasService.getById(id);
      setListaAtual(data);
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
      alert('Erro ao carregar detalhes da lista');
    }
  };

  const handleCriarLista = async (e) => {
    e.preventDefault();
    try {
      await listaComprasService.create(novaLista);
      setNovaLista({ nome: '', descricao: '' });
      setShowNovaLista(false);
      loadListas();
      alert('Lista criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      alert('Erro ao criar lista');
    }
  };

  const handleAdicionarItem = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...novoItem,
        preco_estimado: novoItem.preco_estimado ? parseFloat(novoItem.preco_estimado) : null
      };
      await listaComprasService.addItem(listaAtual.id, itemData);
      setNovoItem({ nome_item: '', quantidade: 1, preco_estimado: '', observacao: '' });
      setShowNovoItem(false);
      loadListaDetalhada(listaAtual.id);
      alert('Item adicionado!');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao adicionar item');
    }
  };

  const handleToggleComprado = async (itemId) => {
    try {
      await listaComprasService.toggleItemComprado(itemId);
      loadListaDetalhada(listaAtual.id);
    } catch (error) {
      console.error('Erro ao marcar item:', error);
    }
  };

  const handleRemoverItem = async (itemId) => {
    if (window.confirm('Deseja remover este item?')) {
      try {
        await listaComprasService.deleteItem(itemId);
        loadListaDetalhada(listaAtual.id);
        alert('Item removido!');
      } catch (error) {
        console.error('Erro ao remover item:', error);
        alert('Erro ao remover item');
      }
    }
  };

  const handleDeletarLista = async (id) => {
    if (window.confirm('Deseja excluir esta lista de compras?')) {
      try {
        await listaComprasService.delete(id);
        if (listaAtual?.id === id) {
          setListaAtual(null);
        }
        loadListas();
        alert('Lista excluída!');
      } catch (error) {
        console.error('Erro ao excluir lista:', error);
        alert('Erro ao excluir lista');
      }
    }
  };

  const handleConcluirLista = async (id) => {
    try {
      await listaComprasService.update(id, { concluida: true });
      loadListas();
      if (listaAtual?.id === id) {
        loadListaDetalhada(id);
      }
      alert('Lista marcada como concluída!');
    } catch (error) {
      console.error('Erro ao concluir lista:', error);
      alert('Erro ao concluir lista');
    }
  };

  const calcularTotal = () => {
    if (!listaAtual?.itens) return 0;
    return listaAtual.itens.reduce((total, item) => {
      return total + ((item.preco_estimado || 0) * item.quantidade);
    }, 0);
  };

  const calcularProgresso = () => {
    if (!listaAtual?.itens || listaAtual.itens.length === 0) return 0;
    const comprados = listaAtual.itens.filter(item => item.comprado).length;
    return Math.round((comprados / listaAtual.itens.length) * 100);
  };

  if (loading) {
    return <div className="loading">Carregando listas de compras...</div>;
  }

  return (
    <div className="listas-compras-container">
      <div className="listas-sidebar">
        <div className="sidebar-header">
          <h2>Minhas Listas</h2>
          <button 
            className="btn btn-success btn-sm"
            onClick={() => setShowNovaLista(true)}
          >
            + Nova Lista
          </button>
        </div>

        <div className="listas-list">
          {listas.length === 0 ? (
            <p className="empty-message">Nenhuma lista criada ainda</p>
          ) : (
            listas.map(lista => (
              <div
                key={lista.id}
                className={`lista-item ${listaAtual?.id === lista.id ? 'active' : ''} ${lista.concluida ? 'concluida' : ''}`}
                onClick={() => loadListaDetalhada(lista.id)}
              >
                <div className="lista-item-header">
                  <h3>{lista.nome}</h3>
                  {lista.concluida && <span className="badge-concluida">✓ Concluída</span>}
                </div>
                {lista.descricao && <p className="lista-descricao">{lista.descricao}</p>}
                <div className="lista-stats">
                  <span>{lista.itens?.length || 0} itens</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lista-detalhes">
        {!listaAtual ? (
          <div className="empty-state">
            <h2>Selecione uma lista</h2>
            <p>Escolha uma lista ao lado ou crie uma nova</p>
          </div>
        ) : (
          <>
            <div className="detalhes-header">
              <div>
                <h1>{listaAtual.nome}</h1>
                {listaAtual.descricao && <p className="lista-descricao-full">{listaAtual.descricao}</p>}
              </div>
              <div className="detalhes-actions">
                {!listaAtual.concluida && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => setShowNovoItem(true)}
                    >
                      + Adicionar Item
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleConcluirLista(listaAtual.id)}
                    >
                      Concluir Lista
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeletarLista(listaAtual.id)}
                >
                  Excluir
                </button>
              </div>
            </div>

            <div className="lista-progresso">
              <div className="progresso-info">
                <span>{listaAtual.itens.filter(i => i.comprado).length} de {listaAtual.itens.length} itens comprados</span>
                <span className="progresso-valor">Total estimado: R$ {calcularTotal().toFixed(2)}</span>
              </div>
              <div className="progresso-bar">
                <div 
                  className="progresso-fill" 
                  style={{ width: `${calcularProgresso()}%` }}
                ></div>
              </div>
            </div>

            <div className="itens-lista">
              {listaAtual.itens.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum item na lista ainda</p>
                </div>
              ) : (
                listaAtual.itens.map(item => (
                  <div key={item.id} className={`item-card ${item.comprado ? 'comprado' : ''}`}>
                    <div className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={item.comprado}
                        onChange={() => handleToggleComprado(item.id)}
                        disabled={listaAtual.concluida}
                      />
                    </div>
                    <div className="item-info">
                      <h3>{item.nome_item}</h3>
                      <div className="item-detalhes">
                        <span>Quantidade: {item.quantidade}</span>
                        {item.preco_estimado && (
                          <span>R$ {(item.preco_estimado * item.quantidade).toFixed(2)}</span>
                        )}
                      </div>
                      {item.observacao && (
                        <p className="item-observacao">{item.observacao}</p>
                      )}
                    </div>
                    {!listaAtual.concluida && (
                      <button
                        className="btn-remove-item"
                        onClick={() => handleRemoverItem(item.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Nova Lista */}
      {showNovaLista && (
        <div className="modal-overlay" onClick={() => setShowNovaLista(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Lista de Compras</h2>
            <form onSubmit={handleCriarLista}>
              <div className="form-group">
                <label>Nome da Lista *</label>
                <input
                  type="text"
                  value={novaLista.nome}
                  onChange={(e) => setNovaLista({...novaLista, nome: e.target.value})}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={novaLista.descricao}
                  onChange={(e) => setNovaLista({...novaLista, descricao: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Criar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNovaLista(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Item */}
      {showNovoItem && (
        <div className="modal-overlay" onClick={() => setShowNovoItem(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Adicionar Item</h2>
            <form onSubmit={handleAdicionarItem}>
              <div className="form-group">
                <label>Nome do Item *</label>
                <input
                  type="text"
                  value={novoItem.nome_item}
                  onChange={(e) => setNovoItem({...novoItem, nome_item: e.target.value})}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={novoItem.quantidade}
                  onChange={(e) => setNovoItem({...novoItem, quantidade: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Preço Estimado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoItem.preco_estimado}
                  onChange={(e) => setNovoItem({...novoItem, preco_estimado: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Observação</label>
                <textarea
                  value={novoItem.observacao}
                  onChange={(e) => setNovoItem({...novoItem, observacao: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Adicionar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNovoItem(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListasCompras;
