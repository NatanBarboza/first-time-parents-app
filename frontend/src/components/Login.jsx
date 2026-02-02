import React, { useState } from 'react';
import { authService } from '../services/api';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData);
      const user = await authService.getCurrentUser();
      onLoginSuccess(user);
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(
        err.response?.data?.detail || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Gestão de Produtos</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem uma conta?{' '}
            <button 
              type="button"
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Registre-se
            </button>
          </p>
        </div>

        <div className="demo-credentials">
          <p><strong>Credenciais de demonstração:</strong></p>
          <p>Usuário: <code>admin</code></p>
          <p>Senha: <code>admin123</code></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
