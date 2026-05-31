// API 客户端

const API_BASE = '/api';

// Token 管理
let authToken: string | null = localStorage.getItem('inkflow-token');

export function getToken(): string | null {
  return authToken;
}

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('inkflow-token', token);
  } else {
    localStorage.removeItem('inkflow-token');
  }
}

export function clearToken() {
  authToken = null;
  localStorage.removeItem('inkflow-token');
}

// 通用请求方法
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('登录已过期，请重新登录');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

// ====== 用户 API ======

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authAPI = {
  register(username: string, email: string, password: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe() {
    return request<User>('/auth/me');
  },

  updateAvatar(avatar: string) {
    return request<{ avatar: string }>('/auth/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar }),
    });
  },
};

// ====== 笔记 API ======

export interface NoteData {
  id: string;
  userId: string;
  title: string;
  content: string;
  icon: string;
  tags: string[];
  isFavorite: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const notesAPI = {
  getAll() {
    return request<NoteData[]>('/notes');
  },

  getById(id: string) {
    return request<NoteData>(`/notes/${id}`);
  },

  create(data: Partial<NoteData>) {
    return request<NoteData>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<NoteData>) {
    return request<NoteData>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  permanentDelete(id: string) {
    return request<{ message: string }>(`/notes/${id}/permanent`, {
      method: 'DELETE',
    });
  },

  restore(id: string) {
    return request<NoteData>(`/notes/${id}/restore`, {
      method: 'POST',
    });
  },
};

// ====== 设置 API ======

export interface UserSettings {
  userId: string;
  theme: string;
}

export const settingsAPI = {
  get() {
    return request<UserSettings>('/settings');
  },

  update(data: Partial<UserSettings>) {
    return request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
