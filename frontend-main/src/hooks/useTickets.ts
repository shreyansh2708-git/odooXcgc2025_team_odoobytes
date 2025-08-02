ASUS\Desktop\Web P\odooXcgc2025_team_odoobytes\frontend-main\src\hooks\useTickets.ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export const useTickets = (filters?: any) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => apiService.getTickets(filters),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });
};