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

export default api;
