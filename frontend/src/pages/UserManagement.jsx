import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  Activity,
  Star,
  Clock,
  Heart,
  Zap
} from 'lucide-react';

export const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Mock user data
  const users = [
    {
      id: 'USR-001',
      name: 'Sarah Johnson',
      email: 's.johnson@email.com',
      phone: '+1 (555) 0123',
      tier: 'User 2',
      character: 'The Deserving One',
      currentDay: 5,
      quickShifts: 23,
      plotTwists: 12,
      toolsCreated: 8,
      lastActive: '2 hours ago',
      status: 'Active',
      joinDate: '2024-01-15',
      engagementScore: 85
    },
    {
      id: 'USR-002',
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      phone: '+1 (555) 0124',
      tier: 'User 3',
      character: 'The Grounded One',
      currentDay: 2,
      quickShifts: 45,
      plotTwists: 28,
      toolsCreated: 15,
      lastActive: '1 day ago',
      status: 'Active',
      joinDate: '2024-02-03',
      engagementScore: 92
    },
    {
      id: 'USR-003',
      name: 'Emily Rodriguez',
      email: 'e.rodriguez@email.com',
      phone: '+1 (555) 0125',
      tier: 'User 1',
      character: 'The Intuitive One',
      currentDay: 7,
      quickShifts: 12,
      plotTwists: 7,
      toolsCreated: 4,
      lastActive: '3 days ago',
      status: 'Inactive',
      joinDate: '2024-02-20',
      engagementScore: 67
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'User 1': return 'secondary';
      case 'User 2': return 'default';
      case 'User 3': return 'success';
      default: return 'outline';
    }
  };

  return (
    <Layout
      title="User Management"
      subtitle="View and manage user accounts, progress, and engagement data"
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or user ID..."
                className="pl-10 w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{users.length}</span> total users
            </div>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier & Character</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getTierColor(user.tier)}>
                          {user.tier}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {user.character}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Day {user.currentDay}/7
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.quickShifts} Quick Shifts
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Zap className="h-3 w-3" />
                          <span>{user.quickShifts}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Heart className="h-3 w-3" />
                          <span>{user.toolsCreated}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium">
                          {user.engagementScore}%
                        </div>
                        <Star className={`h-4 w-4 ${
                          user.engagementScore > 80 ? 'text-yellow-500' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.lastActive}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>User Details - {selectedUser.name}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="journey">Journey</TabsTrigger>
                  <TabsTrigger value="library">Library</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Email:</span>
                          <span className="ml-2 text-sm">{selectedUser.email}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Phone:</span>
                          <span className="ml-2 text-sm">{selectedUser.phone}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Join Date:</span>
                          <span className="ml-2 text-sm">{selectedUser.joinDate}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Current Tier:</span>
                          <Badge variant={getTierColor(selectedUser.tier)} className="ml-2">
                            {selectedUser.tier}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Engagement Score:</span>
                          <span className="ml-2 text-lg font-bold">{selectedUser.engagementScore}%</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Quick Shifts:</span>
                          <span className="ml-2 text-sm">{selectedUser.quickShifts} completed</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Tools Created:</span>
                          <span className="ml-2 text-sm">{selectedUser.toolsCreated} items</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Last Active:</span>
                          <span className="ml-2 text-sm">{selectedUser.lastActive}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="journey" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Journey Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium">Current Character:</span>
                          <span className="ml-2">{selectedUser.character}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Current Day:</span>
                          <span className="ml-2">Day {selectedUser.currentDay} of 7</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Plot Twists Completed:</span>
                          <span className="ml-2">{selectedUser.plotTwists}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="library" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Created Tools & Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        User has created {selectedUser.toolsCreated} personalized tools
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Recent activity and engagement history
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};