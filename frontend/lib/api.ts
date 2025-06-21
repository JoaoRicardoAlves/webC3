import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => api.post('/auth/register', data),
  
  me: () => api.get('/auth/me'),
  
  refresh: () => api.post('/auth/refresh'),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    avatar?: string
  }) => api.put('/users/profile', data),
  
  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }) => api.put('/users/password', data),
}

export const projectAPI = {
  getAll: (params?: {
    status?: string
    priority?: string
    search?: string
  }) => api.get('/projects', { params }),
  
  getById: (id: string) => api.get(`/projects/${id}`),
  
  create: (data: {
    name: string
    description?: string
    priority?: string
    startDate?: string
    endDate?: string
  }) => api.post('/projects', data),
  
  update: (id: string, data: {
    name?: string
    description?: string
    progress?: number
    status?: string
    priority?: string
    startDate?: string
    endDate?: string
  }) => api.put(`/projects/${id}`, data),
  
  delete: (id: string) => api.delete(`/projects/${id}`),
}

export const taskAPI = {
  getByProject: (projectId: string) =>
    api.get(`/tasks/project/${projectId}`),
  
  create: (data: {
    title: string
    description?: string
    projectId: string
    priority?: string
    dueDate?: string
  }) => api.post('/tasks', data),
  
  update: (id: string, data: {
    title?: string
    description?: string
    completed?: boolean
    priority?: string
    dueDate?: string
  }) => api.put(`/tasks/${id}`, data),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  
  getProjectProgress: () => api.get('/dashboard/project-progress'),
  
  getActivities: (params?: {
    limit?: number
    offset?: number
  }) => api.get('/dashboard/activities', { params }),
}

export const activityAPI = {
  getAll: (params?: {
    type?: string
    limit?: number
    offset?: number
  }) => api.get('/activities', { params }),
}

// Legacy endpoints (keeping your existing structure)
export const legacyAPI = {
  getMetrics: () => api.get('/metrics'),
  getRevenueSources: () => api.get('/revenue-sources'),
}