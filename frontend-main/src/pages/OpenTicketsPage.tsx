import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Clock, 
  AlertTriangle,
  Eye,
  MessageCircle,
  Send,
  User,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
// Mock open tickets data
const mockOpenTickets = [
  {
    id: 'TCK-001',
    subject: 'Unable to access email account',
    description: 'Cannot log into my corporate email account since yesterday. I have tried resetting the password multiple times but still cannot access it. This is affecting my work significantly.',
    priority: 'high',
    category: 'Email & Communication',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: { 
      name: 'John Doe', 
      email: 'john.doe@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      department: 'Marketing'
    },
    assignedAgent: { name: 'Sarah Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    comments: 5,
    upvotes: 3,
    lastActivity: '2024-01-15T15:30:00Z',
  },
  {
    id: 'TCK-005',
    subject: 'VPN connection issues',
    description: 'Unable to connect to company VPN from home. Getting timeout errors constantly.',
    priority: 'high',
    category: 'Network & Security',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    createdBy: { 
      name: 'Lisa Garcia', 
      email: 'lisa.garcia@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      department: 'Engineering'
    },
    assignedAgent: null,
    comments: 1,
    upvotes: 2,
    lastActivity: '2024-01-15T14:30:00Z',
  },
  {
    id: 'TCK-006',
    subject: 'Slow computer performance',
    description: 'My workstation has become extremely slow over the past week. Takes forever to open applications.',
    priority: 'medium',
    category: 'Hardware',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    createdBy: { 
      name: 'Robert Chen', 
      email: 'robert.chen@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
      department: 'Finance'
    },
    assignedAgent: { name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
    comments: 3,
    upvotes: 1,
    lastActivity: '2024-01-15T13:45:00Z',
  },
];

const OpenTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const canReply = user?.role === 'admin' || user?.role === 'agent';

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    
    // Handle reply logic here
    console.log(`Replying to ticket ${ticketId}: ${replyText}`);
    setReplyText('');
    setSelectedTicket(null);
  };

  const handleAssignToMe = (ticketId: string) => {
    // Handle assignment logic here
    console.log(`Assigning ticket ${ticketId} to ${user?.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Open Tickets</h1>
          <p className="text-muted-foreground mt-1">
            View and respond to active support requests
          </p>
        </div>
        <Badge className="bg-status-open text-white text-lg px-4 py-2">
          <Clock className="w-4 h-4 mr-2" />
          {mockOpenTickets.length} Open
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold text-orange-500">{mockOpenTickets.filter(t => !t.assignedAgent).length}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-priority-high">{mockOpenTickets.filter(t => t.priority === 'high').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-priority-high" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awaiting Response</p>
                <p className="text-2xl font-bold text-primary">{mockOpenTickets.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
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
                  placeholder="Search open tickets..."
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
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="my">My Tickets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastActivity">Last Activity</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="upvotes">Most Voted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {mockOpenTickets.map((ticket) => (
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
                      <Badge className={`text-xs bg-status-open text-white border-0`}>
                        <Clock className="w-3 h-3 mr-1" />
                        OPEN
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)} border-0`}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {ticket.category}
                      </Badge>
                      {!ticket.assignedAgent && (
                        <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                          UNASSIGNED
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground">
                      {ticket.subject}
                    </h3>

                    <p className="text-muted-foreground text-sm">
                      {ticket.description}
                    </p>

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
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Last activity {getTimeAgo(ticket.lastActivity)}</span>
                      </div>
                      {ticket.assignedAgent && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignedAgent.avatar} />
                            <AvatarFallback className="text-xs">{ticket.assignedAgent.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>Assigned to {ticket.assignedAgent.name}</span>
                        </div>
                      )}
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
                    
                    {canReply && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="premium" onClick={() => setSelectedTicket(ticket)}>
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Reply to Ticket {ticket.id}</DialogTitle>
                              <DialogDescription>
                                Respond to "{ticket.subject}" by {ticket.createdBy.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Original message:</p>
                                <p className="text-sm">{ticket.description}</p>
                              </div>
                              <Textarea
                                placeholder="Type your response here..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={6}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => handleReply(ticket.id)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Reply
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {!ticket.assignedAgent && (
                          <Button size="sm" variant="outline" onClick={() => handleAssignToMe(ticket.id)}>
                            <User className="w-4 h-4 mr-1" />
                            Assign to Me
                          </Button>
                        )}
                      </>
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

export default OpenTicketsPage;