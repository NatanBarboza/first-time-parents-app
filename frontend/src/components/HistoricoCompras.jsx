import React, { useState, useEffect } from 'react';
import { compraService } from '../services/api';

function HistoricoCompras() {
  const [compras, setCompras] = useState([]);
  const [compraDetalhes, setCompraDetalhes] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodoEstatisticas, setPeriodoEstatisticas] = useState(30);

  useEffect(() => {
    loadCompras();
    loadEstatisticas();
  }, []);

  const loadCompras = async () => {
    try {
      setLoading(true);
      const data = await compraService.getAll();
      setCompras(data);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      alert('Erro ao carregar histórico de compras');
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async (dias = 30) => {
    try {
      const data = await compraService.getEstatisticas(dias);
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleVerDetalhes = async (compraId) => {
    try {
      const data = await compraService.getById(compraId);
      setCompraDetalhes(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      alert('Erro ao carregar detalhes da compra');
    }
  };

  const handleDeletarCompra = async (compraId) => {
    if (window.confirm('Deseja excluir este registro de compra?')) {
      try {
        await compraService.delete(compraId);
        if (compraDetalhes?.id === compraId) {
          setCompraDetalhes(null);
        }
        loadCompras();
        loadEstatisticas(periodoEstatisticas);
        alert('Compra excluída!');
      } catch (error) {
        console.error('Erro ao excluir compra:', error);
        alert('Erro ao excluir compra');
      }
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return <div className="loading">Carregando histórico...</div>;
  }

  return (
    <div className="historico-container">
      {/* Estatísticas */}
      {estatisticas && (
        <div className="estatisticas-panel">
          <div className="estatisticas-header">
            <h2>Estatísticas</h2>
            <select 
              value={periodoEstatisticas}
              onChange={(e) => {
                const dias = parseInt(e.target.value);
                setPeriodoEstatisticas(dias);
                loadEstatisticas(dias);
              }}
              className="select-periodo"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total de Compras</div>
              <div className="stat-value">{estatisticas.total_compras}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Gasto</div>
              <div className="stat-value">{formatarValor(estatisticas.total_gasto)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Média por Compra</div>
              <div className="stat-value">{formatarValor(estatisticas.media_por_compra)}</div>
            </div>
          </div>

          {estatisticas.produtos_mais_comprados.length > 0 && (
            <div className="produtos-frequentes">
              <h3>Produtos Mais Comprados</h3>
              <div className="produtos-list">
                {estatisticas.produtos_mais_comprados.slice(0, 5).map((produto, index) => (
                  <div key={index} className="produto-freq-item">
                    <span className="produto-nome">{produto.nome}</span>
                    <div className="produto-stats">
                      <span>{produto.quantidade}x</span>
                      <span>{formatarValor(produto.total_gasto)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de Compras */}
      <div className="compras-content">
        <div className="compras-lista">
          <h2>Histórico de Compras</h2>
          
          {compras.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma compra registrada ainda</p>
            </div>
          ) : (
            <div className="compras-grid">
              {compras.map(compra => (
                <div
                  key={compra.id}
                  className={`compra-card ${compraDetalhes?.id === compra.id ? 'active' : ''}`}
                  onClick={() => handleVerDetalhes(compra.id)}
                >
                  <div className="compra-header">
                    <div className="compra-data">{formatarData(compra.data_compra)}</div>
                    <div className="compra-valor">{formatarValor(compra.valor_total)}</div>
                  </div>
                  {compra.local_compra && (
                    <div className="compra-local">📍 {compra.local_compra}</div>
                  )}
                  <div className="compra-resumo">
                    {compra.itens.length} {compra.itens.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes da Compra */}
        {compraDetalhes && (
          <div className="compra-detalhes-panel">
            <div className="detalhes-header">
              <h2>Detalhes da Compra</h2>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeletarCompra(compraDetalhes.id)}
              >
                Excluir
              </button>
            </div>

            <div className="detalhes-info">
              <div className="info-row">
                <span className="info-label">Data:</span>
                <span>{formatarData(compraDetalhes.data_compra)}</span>
              </div>
              {compraDetalhes.local_compra && (
                <div className="info-row">
                  <span className="info-label">Local:</span>
                  <span>{compraDetalhes.local_compra}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Total:</span>
                <span className="valor-destaque">{formatarValor(compraDetalhes.valor_total)}</span>
              </div>
              {compraDetalhes.observacao && (
                <div className="info-row">
                  <span className="info-label">Observação:</span>
                  <span>{compraDetalhes.observacao}</span>
                </div>
              )}
            </div>

            <div className="itens-compra">
              <h3>Itens ({compraDetalhes.itens.length})</h3>
              {compraDetalhes.itens.map(item => (
                <div key={item.id} className="item-compra-card">
                  <div className="item-compra-info">
                    <div className="item-nome">{item.nome_item}</div>
                    <div className="item-detalhes">
                      Quantidade: {item.quantidade} x {formatarValor(item.preco_unitario)}
                    </div>
                  </div>
                  <div className="item-total">
                    {formatarValor(item.preco_total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoricoCompras;
