const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

async function fetchWithAuth(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const doFetch = async () => {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  try {
    return await doFetch();
  } catch (err) {
    if (err.status >= 500) return doFetch();
    throw err;
  }
}

export async function checkHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    const data = await res.json();
    return res.ok && (data.ok || data.status === 'ok');
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  login: (body) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: (token) => fetchWithAuth('/auth/profile', {}, token),
  walletTopUp: (amount, token) => 
    fetchWithAuth('/auth/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }, token),
  getRestaurants: () => fetchWithAuth('/restaurants'),
  getRestaurant: (id, token) => fetchWithAuth(`/restaurants/${id}`, {}, token),
  getRestaurantMenu: (id) => fetchWithAuth(`/restaurants/${id}/menu`),
  addMenuItem: (restaurantId, body, token) =>
    fetchWithAuth(`/restaurants/${restaurantId}/menu`, { method: 'POST', body: JSON.stringify(body) }, token),
  patchRestaurant: (id, body, token) =>
    fetchWithAuth(`/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token),
  getTables: (token) => fetchWithAuth('/tables', {}, token),
  addTable: (body, token) =>
    fetchWithAuth('/tables', { method: 'POST', body: JSON.stringify(body) }, token),
  deleteTable: (id, token) =>
    fetchWithAuth(`/tables/${id}`, { method: 'DELETE' }, token),
  patchTableStatus: (id, body, token) =>
    fetchWithAuth(`/tables/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }, token),
  getReservations: (token) => fetchWithAuth('/reservations', {}, token),
  createReservation: (body, token) =>
    fetchWithAuth('/reservations', { method: 'POST', body: JSON.stringify(body) }, token),
  patchReservation: (id, body, token) =>
    fetchWithAuth(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token),
  deleteReservation: (id, token) =>
    fetchWithAuth(`/reservations/${id}`, { method: 'DELETE' }, token),
  getOrders: (token) => fetchWithAuth('/orders', {}, token),
  createOrder: (body, token) =>
    fetchWithAuth('/orders', { method: 'POST', body: JSON.stringify(body) }, token),
  patchOrderStatus: (id, status, token) =>
    fetchWithAuth(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, token),
  analyticsSummary: (token) => fetchWithAuth('/analytics/summary', {}, token),
  analyticsSalesChart: (token) => fetchWithAuth('/analytics/sales-chart', {}, token),
  analyticsReservationsChart: (token) => fetchWithAuth('/analytics/reservations-chart', {}, token),
  updateProfile: (body, token) =>
    fetchWithAuth('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }, token),
};

export default api;
