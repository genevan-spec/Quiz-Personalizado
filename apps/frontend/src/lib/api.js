// Cliente HTTP centralizado — injeta o JWT em cada pedido autenticado
const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('quiz_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const msg = body?.error ?? body?.message ?? res.statusText;
    throw new Error(msg);
  }

  // 204 No Content — sem body
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get:  (path)        => request(path),
  post: (path, body)  => request(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:  (path, body)  => request(path, { method: 'PUT',   body: JSON.stringify(body) }),
  del:  (path)        => request(path, { method: 'DELETE' }),
};
