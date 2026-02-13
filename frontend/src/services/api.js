import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirecionar para login
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Serviços de Categorias
export const categoriaService = {
  getAll: async (search = '') => {
    const response = await api.get('/categorias/', {
      params: { search: search || undefined }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  getProdutos: async (id, skip = 0, limit = 100) => {
    const response = await api.get(`/categorias/${id}/produtos`, {
      params: { skip, limit }
    });
    return response.data;
  },

  create: async (categoria) => {
    const response = await api.post('/categorias/', categoria);
    return response.data;
  },

  update: async (id, categoria) => {
    const response = await api.put(`/categorias/${id}`, categoria);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/categorias/${id}`);
  },
};

// Serviços de Produtos
export const produtoService = {
  getAll: async (search = '') => {
    const response = await api.get('/produtos/', {
      params: { search: search || undefined }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  getEstoqueBaixo: async (limite = 5) => {
    const response = await api.get('/produtos/estoque-baixo', {
      params: { limite }
    });
    return response.data;
  },

  create: async (produto) => {
    const response = await api.post('/produtos/', produto);
    return response.data;
  },

  update: async (id, produto) => {
    const response = await api.put(`/produtos/${id}`, produto);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/produtos/${id}`);
  },
};

// Serviços de Listas de Compras
export const listaComprasService = {
  // Listas
  getAll: async (apenasAtivas = false) => {
    const response = await api.get('/listas-compras/', {
      params: { apenas_ativas: apenasAtivas }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/listas-compras/${id}`);
    return response.data;
  },

  getResumo: async (id) => {
    const response = await api.get(`/listas-compras/${id}/resumo`);
    return response.data;
  },

  create: async (lista) => {
    const response = await api.post('/listas-compras/', lista);
    return response.data;
  },

  update: async (id, lista) => {
    const response = await api.put(`/listas-compras/${id}`, lista);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/listas-compras/${id}`);
  },

  // Itens
  addItem: async (listaId, item) => {
    const response = await api.post(`/listas-compras/${listaId}/itens`, item);
    return response.data;
  },

  updateItem: async (itemId, item) => {
    const response = await api.put(`/listas-compras/itens/${itemId}`, item);
    return response.data;
  },

  deleteItem: async (itemId) => {
    await api.delete(`/listas-compras/itens/${itemId}`);
  },

  toggleItemComprado: async (itemId) => {
    const response = await api.patch(`/listas-compras/itens/${itemId}/toggle-comprado`);
    return response.data;
  },

  // Produtos
  getProdutosSugeridos: async (listaId, search = '') => {
    const response = await api.get(`/listas-compras/${listaId}/produtos-sugeridos`, {
      params: { search: search || undefined }
    });
    return response.data;
  },

  addProdutoExistente: async (listaId, produtoId, quantidade = 1) => {
    const response = await api.post(
      `/listas-compras/${listaId}/adicionar-produto/${produtoId}`,
      null,
      { params: { quantidade } }
    );
    return response.data;
  },
};

// Serviços de Histórico de Compras
export const compraService = {
  getAll: async (dataInicial = null, dataFinal = null) => {
    const params = {};
    if (dataInicial) params.data_inicial = dataInicial;
    if (dataFinal) params.data_final = dataFinal;
    
    const response = await api.get('/compras/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },

  getEstatisticas: async (dias = 30) => {
    const response = await api.get('/compras/estatisticas', {
      params: { dias }
    });
    return response.data;
  },

  create: async (compra) => {
    const response = await api.post('/compras/', compra);
    return response.data;
  },

  finalizarLista: async (listaId, dados) => {
    const response = await api.post(`/compras/finalizar-lista/${listaId}`, dados);
    return response.data;
  },

  update: async (id, compra) => {
    const response = await api.put(`/compras/${id}`, compra);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/compras/${id}`);
  },
};

// Serviços de Assinatura
export const assinaturaService = {
  create: async (plano) => {
    const response = await api.post('/assinaturas/', { plano });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/assinaturas/me');
    return response.data;
  },

  cancelar: async () => {
    const response = await api.patch('/assinaturas/me/cancelar');
    return response.data;
  },
};

export default api;
