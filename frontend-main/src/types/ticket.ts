export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  categoryId: string;
  assignedTo?: string;
  assignedAgent?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  isPublic: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'agent' | 'user';
  };
  createdAt: string;
  updatedAt?: string;
  isInternal: boolean; // Internal comments only visible to agents/admin
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  ticketCount: number;
}

export interface TicketFilter {
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'upvotes' | 'comments';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTime: number; // in hours
  totalComments: number;
}