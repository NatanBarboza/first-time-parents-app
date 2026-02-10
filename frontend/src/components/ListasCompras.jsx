import React, { useState, useEffect } from 'react';
import { listaComprasService, compraService, produtoService } from '../services/api';

function ListasCompras() {
  const [listas, setListas] = useState([]);
  const [listaAtual, setListaAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNovaLista, setShowNovaLista] = useState(false);
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [showFinalizarLista, setShowFinalizarLista] = useState(false);
  const [showSelecionarProduto, setShowSelecionarProduto] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [quantidadePorProduto, setQuantidadePorProduto] = useState({});
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([]);
  const [novaLista, setNovaLista] = useState({ nome: '', descricao: '' });
  const [novoItem, setNovoItem] = useState({
    nome_item: '',
    quantidade: 1,
    preco_estimado: '',
    observacao: ''
  });
  const [finalizacaoData, setFinalizacaoData] = useState({
    local_compra: '',
    observacao: '',
    adicionar_ao_estoque: true,
    atualizar_precos: true
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

  const handleAbrirFinalizacao = () => {
    setShowFinalizarLista(true);
  };

  const handleFinalizarLista = async (e) => {
    e.preventDefault();
    try {
      const response = await compraService.finalizarLista(listaAtual.id, finalizacaoData);
      
      setShowFinalizarLista(false);
      setFinalizacaoData({
        local_compra: '',
        observacao: '',
        adicionar_ao_estoque: true,
        atualizar_precos: true
      });
      
      loadListas();
      setListaAtual(null);
      
      const mensagem = finalizacaoData.adicionar_ao_estoque
        ? 'Lista finalizada e produtos adicionados ao estoque!'
        : 'Lista finalizada com sucesso!';
      
      alert(mensagem + `\nTotal: R$ ${response.valor_total.toFixed(2)}`);
    } catch (error) {
      console.error('Erro ao finalizar lista:', error);
      alert('Erro ao finalizar lista: ' + (error.response?.data?.detail || error.message));
    }
  };

  const loadProdutosEstoqueBaixo = async (limite = 5) => {
    try {
      const data = await produtoService.getEstoqueBaixo(limite);
      setProdutosEstoqueBaixo(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar produtos com estoque baixo:', error);
      setProdutosEstoqueBaixo([]);
    }
  };

  const handleAbrirNovaLista = () => {
    setShowNovaLista(true);
    loadProdutosEstoqueBaixo();
  };

  const handleAbrirSelecionarProduto = async () => {
    setShowSelecionarProduto(true);
    setQuantidadePorProduto({});
    loadProdutosEstoqueBaixo();
    loadProdutos();
  };

  const loadProdutos = async (search = '') => {
    try {
      setLoadingProdutos(true);
      const data = await listaComprasService.getProdutosSugeridos(listaAtual.id, search);
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleSearchProduto = (e) => {
    const value = e.target.value;
    setSearchProduto(value);
    loadProdutos(value);
  };

  const handleAdicionarProdutoExistente = async (produtoId) => {
    const qty = Math.max(1, parseInt(quantidadePorProduto[produtoId], 10) || 1);
    try {
      await listaComprasService.addProdutoExistente(listaAtual.id, produtoId, qty);
      loadListaDetalhada(listaAtual.id);
      setShowSelecionarProduto(false);
      setSearchProduto('');
      setQuantidadePorProduto({});
      alert(`Produto adicionado à lista (quantidade: ${qty})!`);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto');
    }
  };

  const setQuantidadeProduto = (produtoId, valor) => {
    const num = parseInt(valor, 10);
    setQuantidadePorProduto(prev => ({
      ...prev,
      [produtoId]: isNaN(num) || num < 1 ? 1 : num
    }));
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
            onClick={handleAbrirNovaLista}
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
                      onClick={handleAbrirSelecionarProduto}
                    >
                      🛍️ Adicionar do Estoque
                    </button>
                    <button 
                      className="btn btn-info"
                      onClick={() => setShowNovoItem(true)}
                    >
                      ✏️ Novo Item
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleAbrirFinalizacao}
                    >
                      Finalizar e Registrar Compra
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
                  <p>Adicione produtos do seu estoque ou crie itens personalizados</p>
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
                      <h3>
                        {item.nome_item}
                        {item.produto_id && <span className="badge-produto">📦 Do estoque</span>}
                      </h3>
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
            {produtosEstoqueBaixo.length > 0 && (
              <div className="alerta-estoque-baixo">
                <strong>⚠️ Produtos com estoque baixo:</strong>
                <p>Considere incluir na lista: {produtosEstoqueBaixo.map(p => p.nome).join(', ')}</p>
              </div>
            )}
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

      {/* Modal Selecionar Produto */}
      {showSelecionarProduto && (
        <div className="modal-overlay" onClick={() => setShowSelecionarProduto(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Adicionar Produto do Estoque</h2>
            <p className="modal-subtitle">Selecione um produto já cadastrado no seu estoque</p>
            {produtosEstoqueBaixo.length > 0 && (
              <div className="alerta-estoque-baixo">
                <strong>⚠️ Produtos com estoque baixo:</strong>{' '}
                {produtosEstoqueBaixo.map(p => p.nome).join(', ')}
              </div>
            )}
            <div className="form-group">
              <input
                type="text"
                placeholder="🔍 Buscar produto..."
                value={searchProduto}
                onChange={handleSearchProduto}
                className="search-input"
              />
            </div>

            <div className="produtos-grid">
              {loadingProdutos ? (
                <div className="loading">Carregando produtos...</div>
              ) : produtos.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum produto encontrado</p>
                  <button className="btn btn-info" onClick={() => setShowNovoItem(true)}>
                    Criar Novo Item
                  </button>
                </div>
              ) : (
                produtos.map(produto => (
                  <div key={produto.id} className="produto-card produto-card-lista">
                    <div className="produto-info">
                      <h3>{produto.nome}</h3>
                      {(produto.categoria_nome || produto.categoria) && (
                        <span className="categoria-badge">{produto.categoria_nome || produto.categoria}</span>
                      )}
                      <div className="produto-detalhes">
                        <span className="preco">R$ {produto.preco.toFixed(2)}</span>
                        <span className="estoque">Estoque: {produto.quantidade_estoque}</span>
                      </div>
                    </div>
                    <div className="produto-add-row">
                      <label className="quantidade-label">
                        Qtd:
                        <input
                          type="number"
                          min="1"
                          value={quantidadePorProduto[produto.id] ?? 1}
                          onChange={(e) => setQuantidadeProduto(produto.id, e.target.value)}
                          className="quantidade-input-num"
                        />
                      </label>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAdicionarProdutoExistente(produto.id)}
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-info"
                onClick={() => {
                  setShowSelecionarProduto(false);
                  setShowNovoItem(true);
                }}
              >
                Criar Item Personalizado
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowSelecionarProduto(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Item */}
      {showNovoItem && (
        <div className="modal-overlay" onClick={() => setShowNovoItem(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Criar Item Personalizado</h2>
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

      {/* Modal Finalizar Lista */}
      {showFinalizarLista && (
        <div className="modal-overlay" onClick={() => setShowFinalizarLista(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Finalizar Lista e Registrar Compra</h2>
            <p className="modal-subtitle">
              Esta ação irá criar um registro de compra e, opcionalmente, adicionar os produtos ao estoque.
            </p>
            <form onSubmit={handleFinalizarLista}>
              <div className="form-group">
                <label>Local da Compra</label>
                <input
                  type="text"
                  placeholder="Ex: Supermercado XYZ"
                  value={finalizacaoData.local_compra}
                  onChange={(e) => setFinalizacaoData({...finalizacaoData, local_compra: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Observação</label>
                <textarea
                  placeholder="Notas sobre esta compra..."
                  value={finalizacaoData.observacao}
                  onChange={(e) => setFinalizacaoData({...finalizacaoData, observacao: e.target.value})}
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={finalizacaoData.adicionar_ao_estoque}
                    onChange={(e) => setFinalizacaoData({...finalizacaoData, adicionar_ao_estoque: e.target.checked})}
                  />
                  <span>Adicionar produtos ao estoque</span>
                </label>
                <p className="help-text">
                  Os itens comprados serão adicionados automaticamente ao seu estoque de produtos
                </p>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={finalizacaoData.atualizar_precos}
                    onChange={(e) => setFinalizacaoData({...finalizacaoData, atualizar_precos: e.target.checked})}
                    disabled={!finalizacaoData.adicionar_ao_estoque}
                  />
                  <span>Atualizar preços dos produtos</span>
                </label>
                <p className="help-text">
                  Os preços dos produtos existentes serão atualizados com os valores desta compra
                </p>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Finalizar e Registrar
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFinalizarLista(false)}>
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
