import React, { useState, useEffect } from 'react';
import { compraService, produtoService, listaComprasService } from '../services/api';

function Dashboard() {
  const [compras, setCompras] = useState([]);
  const [compraDetalhes, setCompraDetalhes] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([]);
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodoEstatisticas, setPeriodoEstatisticas] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [comprasData, statsData, estoqueBaixoData, listasData] = await Promise.all([
        compraService.getAll(),
        compraService.getEstatisticas(30),
        produtoService.getEstoqueBaixo(5),
        listaComprasService.getAll(),
      ]);
      setCompras(Array.isArray(comprasData) ? comprasData : []);
      setEstatisticas(statsData || null);
      setProdutosEstoqueBaixo(Array.isArray(estoqueBaixoData) ? estoqueBaixoData : []);
      setListas(Array.isArray(listasData) ? listasData : []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setCompras([]);
      setEstatisticas(null);
      setProdutosEstoqueBaixo([]);
      setListas([]);
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
        setCompras(prev => prev.filter(c => c.id !== compraId));
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

  const listasAtivas = listas.filter(l => !l.concluida).length;

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Visão geral dos seus indicadores</p>

      {/* KPIs principais */}
      <div className="dashboard-kpis">
        <div className="kpi-card kpi-gasto">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <span className="kpi-label">Total gasto (30 dias)</span>
            <span className="kpi-value">
              {estatisticas ? formatarValor(estatisticas.total_gasto) : 'R$ 0,00'}
            </span>
          </div>
        </div>
        <div className="kpi-card kpi-compras">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-content">
            <span className="kpi-label">Compras (30 dias)</span>
            <span className="kpi-value">
              {estatisticas?.total_compras ?? 0}
            </span>
          </div>
        </div>
        <div className="kpi-card kpi-estoque">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <span className="kpi-label">Estoque baixo</span>
            <span className="kpi-value">{produtosEstoqueBaixo.length}</span>
            {produtosEstoqueBaixo.length > 0 && (
              <span className="kpi-hint">produtos para repor</span>
            )}
          </div>
        </div>
        <div className="kpi-card kpi-listas">
          <div className="kpi-icon">📋</div>
          <div className="kpi-content">
            <span className="kpi-label">Listas ativas</span>
            <span className="kpi-value">{listasAtivas}</span>
            <span className="kpi-hint">de {listas.length} listas</span>
          </div>
        </div>
      </div>

      {/* Histórico de compras integrado */}
      <div className="dashboard-historico">
        <div className="historico-header">
          <h2>Histórico de Compras</h2>
          <div className="historico-periodo">
            <label htmlFor="periodo-dash">Período das estatísticas:</label>
            <select
              id="periodo-dash"
              value={periodoEstatisticas}
              onChange={(e) => {
                const dias = parseInt(e.target.value, 10);
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
        </div>

        <div className="historico-stats-row">
          {estatisticas && (
            <>
              <div className="mini-stat">
                <span className="mini-stat-label">Média por compra</span>
                <span className="mini-stat-value">{formatarValor(estatisticas.media_por_compra)}</span>
              </div>
              {estatisticas.produtos_mais_comprados?.length > 0 && (
                <div className="mini-stat produtos-top">
                  <span className="mini-stat-label">Mais comprados</span>
                  <span className="mini-stat-value">
                    {estatisticas.produtos_mais_comprados.slice(0, 3).map(p => p.nome).join(', ')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="compras-content">
          <div className="compras-lista">
            {compras.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma compra registrada ainda</p>
                <p className="empty-hint">Finalize uma lista de compras para ver o histórico aqui.</p>
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
                      {compra.itens?.length ?? 0} {compra.itens?.length === 1 ? 'item' : 'itens'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                <h3>Itens ({compraDetalhes.itens?.length ?? 0})</h3>
                {(compraDetalhes.itens || []).map(item => (
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
    </div>
  );
}

export default Dashboard;
