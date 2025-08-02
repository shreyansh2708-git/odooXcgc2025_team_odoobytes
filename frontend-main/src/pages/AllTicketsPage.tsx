import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
// Extended mock ticket data for admin view
const mockAllTickets = [
  {
    id: 'TCK-001',
    subject: 'Unable to access email account',
    description: 'Cannot log into my corporate email account since yesterday...',
    status: 'open',
    priority: 'high',
    category: 'Email & Communication',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: { 
      name: 'John Doe', 
      email: 'john.doe@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' 
    },
    assignedAgent: { name: 'Sarah Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    comments: 5,
    upvotes: 3,
  },
  {
    id: 'TCK-002',
    subject: 'Software installation request',
    description: 'Need to install Adobe Creative Suite on my workstation...',
    status: 'in-progress',
    priority: 'medium',
    category: 'Software & Applications',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T14:22:00Z',
    createdBy: { 
      name: 'Jane Smith', 
      email: 'jane.smith@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane' 
    },
    assignedAgent: { name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
    comments: 8,
    upvotes: 2,
  },
  {
    id: 'TCK-003',
    subject: 'Printer not working in conference room',
    description: 'The main printer in conference room B is not responding...',
    status: 'resolved',
    priority: 'low',
    category: 'Hardware',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    createdBy: { 
      name: 'Mike Johnson', 
      email: 'mike.johnson@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' 
    },
    assignedAgent: { name: 'Sarah Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    comments: 3,
    upvotes: 1,
  },
  {
    id: 'TCK-004',
    subject: 'Request for new laptop',
    description: 'My current laptop is very slow and affecting productivity...',
    status: 'closed',
    priority: 'medium',
    category: 'Hardware',
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    createdBy: { 
      name: 'Alice Brown', 
      email: 'alice.brown@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' 
    },
    assignedAgent: { name: 'Tom Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom' },
    comments: 12,
    upvotes: 5,
  },
];

const AllTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertTriangle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-status-open text-white';
      case 'in-progress': return 'bg-status-in-progress text-white';
      case 'resolved': return 'bg-status-resolved text-white';
      case 'closed': return 'bg-status-closed text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-priority-urgent text-white';
      case 'high': return 'bg-priority-high text-white';
      case 'medium': return 'bg-priority-medium text-white';
      case 'low': return 'bg-priority-low text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const canManageTickets = user?.role === 'admin' || user?.role === 'agent';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and overview all support tickets in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/create-ticket">
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">{mockAllTickets.length}</p>
              </div>
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-status-open">{mockAllTickets.filter(t => t.status === 'open').length}</p>
              </div>
              <Clock className="h-8 w-8 text-status-open" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-status-in-progress">{mockAllTickets.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-status-in-progress" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-status-resolved">{mockAllTickets.filter(t => t.status === 'resolved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-resolved" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets by subject, description, ID, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="software">Software & Applications</SelectItem>
                <SelectItem value="email">Email & Communication</SelectItem>
                <SelectItem value="network">Network</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-xl">Tickets Overview</CardTitle>
          <CardDescription>Complete list of all tickets in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAllTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-card transition-shadow">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {ticket.id}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(ticket.status)} border-0`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(ticket.priority)} border-0`}>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {ticket.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-foreground">
                    {ticket.subject}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.createdBy.avatar} />
                        <AvatarFallback className="text-xs">{ticket.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{ticket.createdBy.name}</span>
                    </div>
                    <span>•</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                    {ticket.assignedAgent && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignedAgent.avatar} />
                            <AvatarFallback className="text-xs">{ticket.assignedAgent.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{ticket.assignedAgent.name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tickets/${ticket.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  {canManageTickets && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllTicketsPage;