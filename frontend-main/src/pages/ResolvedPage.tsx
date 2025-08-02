import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  CheckCircle,
  Eye,
  RotateCcw,
  Calendar,
  User,
  Clock,
  Star,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
// Mock resolved tickets data
const mockResolvedTickets = [
  {
    id: 'TCK-003',
    subject: 'Printer not working in conference room',
    description: 'The main printer in conference room B is not responding to print commands...',
    priority: 'low',
    category: 'Hardware',
    createdAt: '2024-01-15T08:00:00Z',
    resolvedAt: '2024-01-15T16:45:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    createdBy: { 
      name: 'Mike Johnson', 
      email: 'mike.johnson@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      department: 'Operations'
    },
    resolvedBy: { 
      name: 'Sarah Wilson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      email: 'sarah.wilson@support.com'
    },
    resolution: 'Printer driver was corrupted. Reinstalled the latest driver and performed test prints. Issue resolved.',
    resolutionTime: 8.75, // hours
    comments: 3,
    upvotes: 1,
    rating: 5,
    feedback: 'Great service! Very quick resolution.',
  },
  {
    id: 'TCK-009',
    subject: 'Email signature not updating',
    description: 'Company email signature template changes are not reflecting in Outlook...',
    priority: 'medium',
    category: 'Email & Communication',
    createdAt: '2024-01-14T11:30:00Z',
    resolvedAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
    createdBy: { 
      name: 'Lisa Garcia', 
      email: 'lisa.garcia@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      department: 'Marketing'
    },
    resolvedBy: { 
      name: 'Tom Wilson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
      email: 'tom.wilson@support.com'
    },
    resolution: 'Outlook was caching the old signature. Cleared cache and forced a sync with Exchange server.',
    resolutionTime: 3.83, // hours
    comments: 5,
    upvotes: 2,
    rating: 4,
    feedback: 'Fixed quickly, thank you!',
  },
  {
    id: 'TCK-010',
    subject: 'Cannot access shared network drive',
    description: 'Getting access denied error when trying to connect to department shared folder...',
    priority: 'high',
    category: 'Network & Security',
    createdAt: '2024-01-13T09:15:00Z',
    resolvedAt: '2024-01-13T11:30:00Z',
    updatedAt: '2024-01-13T11:30:00Z',
    createdBy: { 
      name: 'Robert Chen', 
      email: 'robert.chen@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
      department: 'Finance'
    },
    resolvedBy: { 
      name: 'Sarah Wilson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      email: 'sarah.wilson@support.com'
    },
    resolution: 'User permissions were not properly configured after recent AD sync. Updated user group memberships.',
    resolutionTime: 2.25, // hours
    comments: 4,
    upvotes: 3,
    rating: 5,
    feedback: 'Excellent support, very professional.',
  },
];

const ResolvedPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('resolvedAt');
  const [reopenReason, setReopenReason] = useState('');

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

  const formatResolutionTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      return `${Math.round(hours / 24)}d`;
    }
  };

  const canReopenTickets = user?.role === 'admin' || user?.role === 'agent';

  const handleReopen = (ticketId: string) => {
    if (!reopenReason.trim()) return;
    
    console.log(`Reopening ticket ${ticketId}: ${reopenReason}`);
    setReopenReason('');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  const getAverageRating = () => {
    const totalRating = mockResolvedTickets.reduce((acc, ticket) => acc + ticket.rating, 0);
    return (totalRating / mockResolvedTickets.length).toFixed(1);
  };

  const getAverageResolutionTime = () => {
    const totalTime = mockResolvedTickets.reduce((acc, ticket) => acc + ticket.resolutionTime, 0);
    return formatResolutionTime(totalTime / mockResolvedTickets.length);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resolved Tickets</h1>
          <p className="text-muted-foreground mt-1">
            View completed tickets and their resolutions
          </p>
        </div>
        <Badge className="bg-status-resolved text-white text-lg px-4 py-2">
          <CheckCircle className="w-4 h-4 mr-2" />
          {mockResolvedTickets.length} Resolved
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resolved</p>
                <p className="text-2xl font-bold text-status-resolved">{mockResolvedTickets.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-resolved" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-yellow-500">{getAverageRating()}</p>
                  <div className="flex">
                    {renderStars(Math.round(parseFloat(getAverageRating())))}
                  </div>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-blue-500">{getAverageResolutionTime()}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockResolvedTickets.filter(t => {
                    const resolved = new Date(t.resolvedAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return resolved >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
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
                  placeholder="Search resolved tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
                <SelectItem value="network">Network & Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {mockResolvedTickets.map((ticket) => (
          <Card key={ticket.id} className="shadow-card border-0 hover:shadow-elegant transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {ticket.id}
                      </Badge>
                      <Badge className="text-xs bg-status-resolved text-white border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        RESOLVED
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)} border-0`}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {ticket.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {renderStars(ticket.rating)}
                        <span className="text-xs text-muted-foreground ml-1">({ticket.rating}/5)</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground">
                      {ticket.subject}
                    </h3>

                    <p className="text-muted-foreground text-sm">
                      {ticket.description}
                    </p>

                    {/* Resolution */}
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-300">Resolution</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">{ticket.resolution}</p>
                    </div>

                    {/* Feedback */}
                    {ticket.feedback && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800 dark:text-blue-300">Customer Feedback</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400">"{ticket.feedback}"</p>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ticket.createdBy.avatar} />
                          <AvatarFallback className="text-xs">{ticket.createdBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{ticket.createdBy.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">({ticket.createdBy.department})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={ticket.resolvedBy.avatar} />
                          <AvatarFallback className="text-xs">{ticket.resolvedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>Resolved by {ticket.resolvedBy.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Resolved {formatDate(ticket.resolvedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Resolution time: {formatResolutionTime(ticket.resolutionTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tickets/${ticket.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    {canReopenTickets && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reopen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reopen Ticket {ticket.id}</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for reopening this resolved ticket.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Reason for reopening..."
                              value={reopenReason}
                              onChange={(e) => setReopenReason(e.target.value)}
                              rows={4}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setReopenReason('')}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleReopen(ticket.id)}
                                disabled={!reopenReason.trim()}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reopen Ticket
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResolvedPage;