import api from './api';
import {
  Ticket,
  CreateTicketData,
  UpdateTicketData,
  TicketFilters,
  PaginatedResponse,
  Comment,
  VoteType,
} from '../types';

export const ticketService = {
  // Tickets
  async getTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get<PaginatedResponse<Ticket>>(`/tickets?${params.toString()}`);
    return response.data;
  },

  async getTicket(id: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await api.post<Ticket>('/tickets', data);
    return response.data;
  },

  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    const response = await api.put<Ticket>(`/tickets/${id}`, data);
    return response.data;
  },

  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  // Comments
  async addComment(ticketId: string, content: string, isInternal = false): Promise<Comment> {
    const response = await api.post<Comment>(`/tickets/${ticketId}/comments`, {
      content,
      is_internal: isInternal,
    });
    return response.data;
  },

  // Voting
  async voteTicket(ticketId: string, type: VoteType): Promise<void> {
    await api.post(`/tickets/${ticketId}/vote`, { type });
  },

  // Assignment
  async assignTicket(ticketId: string, assignedToId: string): Promise<void> {
    await api.post(`/tickets/${ticketId}/assign`, {
      assigned_to_id: assignedToId,
    });
  },
};
