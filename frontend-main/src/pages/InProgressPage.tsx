import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  AlertTriangle,
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  User,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
// Mock in-progress tickets data
const mockInProgressTickets = [
  {
    id: 'TCK-002',
    subject: 'Software installation request',
    description: 'Need to install Adobe Creative Suite on my workstation for design work...',
    priority: 'medium',
    category: 'Software & Applications',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T14:22:00Z',
    createdBy: { 
      name: 'Jane Smith', 
      email: 'jane.smith@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      department: 'Design'
    },
    assignedAgent: { 
      name: 'Mike Johnson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      email: 'mike.johnson@support.com'
    },
    comments: 8,
    upvotes: 2,
    progress: 75,
    estimatedCompletion: '2024-01-16T16:00:00Z',
    lastUpdate: 'Awaiting approval from IT security team for software license',
  },
  {
    id: 'TCK-007',
    subject: 'Database connection timeout issues',
    description: 'Users experiencing intermittent database connection timeouts during peak hours...',
    priority: 'high',
    category: 'Technical',
    createdAt: '2024-01-14T08:30:00Z',
    updatedAt: '2024-01-15T10:15:00Z',
    createdBy: { 
      name: 'David Wilson', 
      email: 'david.wilson@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      department: 'Engineering'
    },
    assignedAgent: { 
      name: 'Sarah Wilson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      email: 'sarah.wilson@support.com'
    },
    comments: 12,
    upvotes: 5,
    progress: 45,
    estimatedCompletion: '2024-01-17T12:00:00Z',
    lastUpdate: 'Database optimization in progress, monitoring performance metrics',
  },
  {
    id: 'TCK-008',
    subject: 'Printer driver installation',
    description: 'New department printer needs driver installation on all workstations...',
    priority: 'low',
    category: 'Hardware',
    createdAt: '2024-01-13T14:20:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    createdBy: { 
      name: 'Emily Davis', 
      email: 'emily.davis@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      department: 'HR'
    },
    assignedAgent: { 
      name: 'Tom Wilson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
      email: 'tom.wilson@support.com'
    },
    comments: 4,
    upvotes: 1,
    progress: 90,
    estimatedCompletion: '2024-01-15T17:00:00Z',
    lastUpdate: 'Driver installed on 18/20 workstations, finalizing remaining machines',
  },
];

const InProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

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

  const getTimeToCompletion = (dateString: string) => {
    const now = new Date();
    const completion = new Date(dateString);
    const diffInHours = Math.ceil((completion.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Overdue';
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    return `${Math.ceil(diffInHours / 24)}d remaining`;
  };

  const canUpdateStatus = user?.role === 'admin' || user?.role === 'agent';

  const handleStatusUpdate = (ticketId: string, newStatus: string) => {
    console.log(`Updating ticket ${ticketId} to status: ${newStatus}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">In Progress Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage tickets currently being worked on
          </p>
        </div>
        <Badge className="bg-status-in-progress text-white text-lg px-4 py-2">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {mockInProgressTickets.length} In Progress
        </Badge>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Near Completion</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockInProgressTickets.filter(t => t.progress >= 80).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-blue-500">
                  {mockInProgressTickets.filter(t => t.progress >= 50 && t.progress < 80).length}
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {mockInProgressTickets.filter(t => t.progress < 50).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(mockInProgressTickets.reduce((acc, t) => acc + t.progress, 0) / mockInProgressTickets.length)}%
                </p>
              </div>
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
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
                  placeholder="Search in-progress tickets..."
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
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="me">My Tickets</SelectItem>
                <SelectItem value="sarah">Sarah Wilson</SelectItem>
                <SelectItem value="mike">Mike Johnson</SelectItem>
                <SelectItem value="tom">Tom Wilson</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress %</SelectItem>
                <SelectItem value="completion">Est. Completion</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {mockInProgressTickets.map((ticket) => (
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
                      <Badge className="text-xs bg-status-in-progress text-white border-0">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        IN PROGRESS
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)} border-0`}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {ticket.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground">
                      {ticket.subject}
                    </h3>

                    <p className="text-muted-foreground text-sm">
                      {ticket.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">Progress: {ticket.progress}%</span>
                        <span className="text-muted-foreground">{getTimeToCompletion(ticket.estimatedCompletion)}</span>
                      </div>
                      <Progress value={ticket.progress} className="h-2" />
                    </div>

                    {/* Last Update */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-foreground mb-1">Latest Update:</p>
                      <p className="text-sm text-muted-foreground">{ticket.lastUpdate}</p>
                    </div>

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
                          <AvatarImage src={ticket.assignedAgent.avatar} />
                          <AvatarFallback className="text-xs">{ticket.assignedAgent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{ticket.assignedAgent.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Est. completion {formatDate(ticket.estimatedCompletion)}</span>
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
                    
                    {canUpdateStatus && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="premium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Ticket Status</DialogTitle>
                            <DialogDescription>
                              Change the status of ticket {ticket.id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="outline" 
                                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </Button>
                              <Button 
                                variant="outline" 
                                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                                onClick={() => handleStatusUpdate(ticket.id, 'open')}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Back to Open
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

export default InProgressPage;