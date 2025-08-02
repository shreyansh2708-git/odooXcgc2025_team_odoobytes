// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'agent' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Ticket types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_by_id: string;
  assigned_to_id?: string;
  category_id: string;
  up_votes: number;
  down_votes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  created_by: User;
  assigned_to?: User;
  category: Category;
  comments?: Comment[];
  attachments?: Attachment[];
  votes?: Vote[];
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  ticket_id: string;
  user_id: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user: User;
}

// Vote types
export type VoteType = 'up' | 'down';

export interface Vote {
  id: string;
  type: VoteType;
  ticket_id: string;
  user_id: string;
  created_at: string;
  user: User;
}

// Attachment types
export interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  ticket_id: string;
  user_id: string;
  created_at: string;
  user: User;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface CreateTicketData {
  subject: string;
  description: string;
  priority: TicketPriority;
  category_id: string;
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to_id?: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  color: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

// Filter and search types
export interface TicketFilters {
  status?: TicketStatus;
  category?: string;
  assigned_to?: string;
  created_by?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  setFilters: (filters: TicketFilters) => void;
  fetchTickets: () => Promise<void>;
  createTicket: (data: CreateTicketData) => Promise<Ticket>;
  updateTicket: (id: string, data: UpdateTicketData) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  addComment: (ticketId: string, content: string, isInternal?: boolean) => Promise<Comment>;
  voteTicket: (ticketId: string, type: VoteType) => Promise<void>;
}

// UI types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
