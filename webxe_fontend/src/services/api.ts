// Utility service for API calls with automatic JWT token attachment and 401 interceptor handling
import { safeStorage } from '@/utils/storage';

// Route API requests through this Next.js deployment to avoid browser CORS restrictions.
export const BACKEND_URL = '/api/backend';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = safeStorage.getItem<string | null>('token', null);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        safeStorage.clearAll();
        if (!window.location.pathname.includes('/Login')) {
          window.location.href = '/Login/Login';
        }
      }
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra khi gọi API.');
  }
  return data as T;
}
