import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  Plus,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
// Mock data - replace with actual API calls
const mockStats = {
  total: 156,
  open: 23,
  inProgress: 8,
  resolved: 15,
  closed: 110,
  avgResolutionTime: 4.2,
  totalComments: 89,
};

const mockRecentTickets = [
  {
    id: 'TCK-001',
    subject: 'Unable to access email account',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: { name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' }
  },
  {
    id: 'TCK-002',
    subject: 'Software installation request',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-15T09:15:00Z',
    createdBy: { name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane' }
  },
  {
    id: 'TCK-003',
    subject: 'Printer not working',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-15T08:00:00Z',
    createdBy: { name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' }
  },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertTriangle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-status-open';
      case 'in-progress': return 'bg-status-in-progress';
      case 'resolved': return 'bg-status-resolved';
      case 'closed': return 'bg-status-closed';
      default: return 'bg-muted';
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your support tickets today.
          </p>
        </div>
        <Button asChild className="shadow-elegant">
          <Link to="/create-ticket">
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-status-open" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-open">{mockStats.open}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-in-progress">{mockStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="w-5 h-5 mr-2" />
              Recent Tickets
            </CardTitle>
            <CardDescription>
              Your latest support tickets and their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                  <div>
                    <p className="font-medium text-sm">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{ticket.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPriorityColor(ticket.priority)} text-white border-0`}
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/create-ticket">
                <Plus className="w-4 h-4 mr-2" />
                Create New Ticket
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/tickets">
                <Ticket className="w-4 h-4 mr-2" />
                View My Tickets
              </Link>
            </Button>
            {(user?.role === 'agent' || user?.role === 'admin') && (
              <>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/all-tickets">
                    <Users className="w-4 h-4 mr-2" />
                    Manage All Tickets
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/tickets/open">
                    <Clock className="w-4 h-4 mr-2" />
                    Open Tickets Queue
                  </Link>
                </Button>
              </>
            )}
            {user?.role === 'admin' && (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;