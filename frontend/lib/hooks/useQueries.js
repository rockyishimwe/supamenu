import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: api.getRestaurants,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRestaurantMenu(restaurantId) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => api.getRestaurantMenu(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTables(token) {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => api.getTables(token),
    enabled: !!token,
    staleTime: 30 * 1000,
  });
}

export function useOrders(token) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(token),
    enabled: !!token,
    staleTime: 15 * 1000,
  });
}

export function useReservations(token) {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: () => api.getReservations(token),
    enabled: !!token,
    staleTime: 30 * 1000,
  });
}

export function useAnalytics(token) {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async (t) => {
      const [summary, salesChart, reservationsChart] = await Promise.all([
        api.analyticsSummary(t),
        api.analyticsSalesChart(t),
        api.analyticsReservationsChart(t),
      ]);
      return { summary, salesChart, reservationsChart };
    },
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body) => api.login(body),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body) => api.register(body),
  });
}
