import React from 'react';

function Landing({ onAcessar, onCriarConta }) {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <span className="landing-logo">🛒 Lista da Casa</span>
          <div className="landing-header-actions">
            <button type="button" className="btn-landing btn-ghost" onClick={onAcessar}>
              Entrar
            </button>
            <button type="button" className="btn-landing btn-primary-landing" onClick={() => onCriarConta()}>
              Criar conta
            </button>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Organize suas compras.<br />
            <span className="landing-hero-highlight">Nunca mais esqueça o essencial.</span>
          </h1>
          <p className="landing-hero-subtitle">
            Listas de compras, controle de estoque e histórico em um só lugar. 
            Feito para quem quer planejar melhor e gastar com consciência.
          </p>
          <div className="landing-hero-ctas">
            <button type="button" className="btn-landing btn-cta-primary" onClick={() => onCriarConta()}>
              Começar grátis
            </button>
            <button type="button" className="btn-landing btn-cta-secondary" onClick={onAcessar}>
              Já tenho conta
            </button>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-mock-card">
            <div className="mock-card-header">Minha lista</div>
            <div className="mock-card-item">🥛 Leite</div>
            <div className="mock-card-item">🍞 Pão</div>
            <div className="mock-card-item">🥚 Ovos</div>
            <div className="mock-card-item mock-done">✓ Arroz</div>
          </div>
        </div>
      </section>

      <section className="landing-value">
        <h2 className="landing-section-title">Tudo que você precisa na palma da mão</h2>
        <div className="landing-benefits">
          <div className="benefit-card">
            <div className="benefit-icon">📋</div>
            <h3>Listas de compras</h3>
            <p>Crie listas por compra ou por período. Adicione itens do seu estoque ou crie itens personalizados e acompanhe o que já foi comprado.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📦</div>
            <h3>Estoque e categorias</h3>
            <p>Cadastre produtos, defina categorias e estoque mínimo. Receba avisos quando algo estiver acabando para incluir na próxima lista.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Histórico e gastos</h3>
            <p>Finalize listas e registre compras com total e local. Veja quanto você gastou, média por compra e produtos que mais compra.</p>
          </div>
        </div>
      </section>

      <section className="landing-pricing">
        <h2 className="landing-section-title">Preços simples e transparentes</h2>
        <p className="landing-pricing-subtitle">Escolha o plano que cabe no seu bolso. Cancele quando quiser.</p>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Mensal</h3>
            <div className="pricing-value">
              <span className="pricing-currency">R$</span>
              <span className="pricing-number">9,90</span>
              <span className="pricing-period">/mês</span>
            </div>
            <p className="pricing-desc">Cobrança mensal. Flexível para testar.</p>
            <ul className="pricing-features">
              <li>Listas de compras ilimitadas</li>
              <li>Estoque e categorias</li>
              <li>Histórico de compras</li>
              <li>Alertas de estoque baixo</li>
            </ul>
            <button type="button" className="btn-landing btn-pricing" onClick={() => onCriarConta('mensal')}>
              Assinar mensal
            </button>
          </div>

          <div className="pricing-card pricing-card-featured">
            <span className="pricing-badge">Melhor custo-benefício</span>
            <h3>Anual</h3>
            <div className="pricing-value">
              <span className="pricing-currency">R$</span>
              <span className="pricing-number">90</span>
              <span className="pricing-period">/ano</span>
            </div>
            <p className="pricing-equivalent">Equivalente a R$ 7,50/mês</p>
            <p className="pricing-desc">Economize R$ 28,80 no ano.</p>
            <ul className="pricing-features">
              <li>Tudo do plano mensal</li>
              <li>12 meses pelo preço de 9</li>
              <li>Cobrança única anual</li>
              <li>Cancele quando quiser</li>
            </ul>
            <button type="button" className="btn-landing btn-pricing btn-pricing-featured" onClick={() => onCriarConta('anual')}>
              Assinar anual
            </button>
          </div>
        </div>
      </section>

      <section className="landing-cta-final">
        <h2>Pronto para organizar suas compras?</h2>
        <p>Crie sua conta em segundos e comece a usar agora.</p>
        <button type="button" className="btn-landing btn-cta-primary btn-cta-large" onClick={() => onCriarConta()}>
          Criar conta grátis
        </button>
      </section>

      <footer className="landing-footer">
        <p>© Lista da Casa · Feito para o dia a dia da sua casa</p>
      </footer>
    </div>
  );
}

export default Landing;
