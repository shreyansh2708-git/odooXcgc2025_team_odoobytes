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
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
// Mock ticket data
const mockTickets = [
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
    downvotes: 0,
    userVote: 'up' as const,
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
    downvotes: 0,
    userVote: null,
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
    downvotes: 0,
    userVote: null,
  },
];

const TicketsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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

  const handleVote = (ticketId: string, voteType: 'up' | 'down') => {
    // Handle voting logic here
    console.log(`Voting ${voteType} on ticket ${ticketId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your support requests
          </p>
        </div>
        <Button asChild className="shadow-elegant">
          <Link to="/create-ticket">
            Create Ticket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets by subject, description, or ID..."
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="upvotes">Most Voted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {mockTickets.map((ticket) => (
          <Card key={ticket.id} className="shadow-card border-0 hover:shadow-elegant transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
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

                  {/* Subject */}
                  <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                    <Link to={`/tickets/${ticket.id}`}>
                      {ticket.subject}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {ticket.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.createdBy.avatar} />
                        <AvatarFallback className="text-xs">{ticket.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{ticket.createdBy.name}</span>
                    </div>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                    {ticket.assignedAgent && (
                      <div className="flex items-center space-x-2">
                        <span>Assigned to</span>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ticket.assignedAgent.avatar} />
                          <AvatarFallback className="text-xs">{ticket.assignedAgent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{ticket.assignedAgent.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* Voting */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(ticket.id, 'up')}
                      className={`h-8 w-8 p-0 ${ticket.userVote === 'up' ? 'text-green-600' : ''}`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      {ticket.upvotes}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(ticket.id, 'down')}
                      className={`h-8 w-8 p-0 ${ticket.userVote === 'down' ? 'text-red-600' : ''}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{ticket.comments}</span>
                  </div>

                  {/* View Button */}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tickets/${ticket.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  );
};

export default TicketsPage;