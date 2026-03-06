import { Layout } from '@/components/layout/Layout';
import { TableSkeleton } from '@/components/loading/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/useUsers';
import {
  Eye,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [characterFilter, setCharacterFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, tierFilter, characterFilter]);

  // Fetch users from API
  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }), [searchQuery, statusFilter]);

  const { data: usersResponse, loading, error, refetch } = useUsers(filters);
  const users = useMemo(
    () => usersResponse?.data || [],
    [usersResponse]
  );

  // Build option lists for filters from current data
  const availableTiers = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.tier) set.add(u.tier);
    });
    return Array.from(set).sort();
  }, [users]);

  const availableCharacters = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.character) set.add(u.character);
    });
    return Array.from(set).sort();
  }, [users]);

  // Client-side filtering for search, tier, and character
  const filteredUsers = useMemo(() => {
    let result = users;

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((u) => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const id = (u.id || '').toLowerCase();
        const character = (u.character || '').toLowerCase();
        return (
          name.includes(query) ||
          email.includes(query) ||
          id.includes(query) ||
          character.includes(query)
        );
      });
    }

    if (tierFilter !== 'all') {
      result = result.filter((u) => (u.tier || '') === tierFilter);
    }

    if (characterFilter !== 'all') {
      result = result.filter((u) => (u.character || '') === characterFilter);
    }

    return result;
  }, [users, searchQuery, tierFilter, characterFilter]);

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

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
      hideHeaderQuickActions
    >
      <div className="space-y-6">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or user ID..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {availableTiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={characterFilter} onValueChange={setCharacterFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Character" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Characters</SelectItem>
                {availableCharacters.map((character) => (
                  <SelectItem key={character} value={character}>
                    {character}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle>All Users</CardTitle>
            <div className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-300 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              {searchQuery || tierFilter !== 'all' || characterFilter !== 'all'
                ? `Showing ${filteredUsers.length} results` 
                : `${filteredUsers.length} Users`
              }
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading users: {error}</p>
                <Button onClick={refetch} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier & Character</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody key={currentPage} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow 
                        key={user.id} 
                        className="transition-all duration-200 hover:bg-muted/50 hover:translate-x-1 border-l-2 border-l-transparent hover:border-l-primary"
                      >
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.id || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={getTierColor(user.tier)}
                            className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20 shadow-[0_0_8px_rgba(var(--primary),0.1)] px-2"
                          >
                            {user.tier || 'N/A'}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {user.character || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Day {user.currentDay || 0}/7
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.quickShifts || 0} Quick Shifts
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {user.overallScore != null ? user.overallScore.toFixed(2) : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Theme score
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={user.status || 'Active'} 
                          className="shadow-sm border-opacity-50"
                        />
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
            
            {filteredUsers.length > 0 && !loading && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                className="mt-4"
              />
            )}
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
                  <TabsTrigger value="scoring">Scoring</TabsTrigger>
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

                <TabsContent value="scoring" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme Scoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedUser.themeScores && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Awareness</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.awareness ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Light</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.light ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Intention</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.intention ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Nowness</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.nowness ?? 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Gratitude</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.gratitude ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Expansion</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.expansion ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Devotion</span>
                              <span className="font-medium">
                                {selectedUser.themeScores.devotion ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Overall Score</span>
                              <span className="font-medium">
                                {selectedUser.overallScore != null
                                  ? selectedUser.overallScore.toFixed(2)
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2 text-xs text-muted-foreground mt-2">
                            Last theme activity:{' '}
                            {selectedUser.themeScores.lastActivityAt || 'Unknown'}
                          </div>
                        </div>
                      )}
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