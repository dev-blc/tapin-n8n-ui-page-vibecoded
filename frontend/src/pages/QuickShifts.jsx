import React, { useState, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Search,
  Filter,
  Plus,
  Edit,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Copy,
  MoreHorizontal,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  useQuickShiftLoops,
  useQuickShiftReframes,
  useQuickShiftProtectors,
  useQuickShiftLoopMutation,
  useQuickShiftReframeMutation,
  useQuickShiftProtectorMutation,
} from '@/hooks/useQuickShifts';
import { FullPageLoader, TableSkeleton } from '@/components/loading/LoadingSpinner';

export const QuickShifts = () => {
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch data from API
  const filterParams = useMemo(() => {
    const params = {};
    if (selectedTier !== 'all') params.tier = selectedTier;
    return params;
  }, [selectedTier]);

  const { data: quickShiftLoopsData = [], loading: loopsLoading, error: loopsError, refetch: refetchLoops } = useQuickShiftLoops({
    params: filterParams,
    showErrorToast: false
  });
  const { data: reframesData = [], loading: reframesLoading, error: reframesError, refetch: refetchReframes } = useQuickShiftReframes({
    params: filterParams,
    showErrorToast: false
  });
  const { data: protectorsData = [], loading: protectorsLoading, error: protectorsError, refetch: refetchProtectors } = useQuickShiftProtectors({
    showErrorToast: false
  });

  const { createLoop, updateLoop, deleteLoop, loading: loopMutationLoading } = useQuickShiftLoopMutation({
    onSuccess: () => {
      refetchLoops();
    }
  });
  const { createReframe, updateReframe, deleteReframe, loading: reframeMutationLoading } = useQuickShiftReframeMutation({
    onSuccess: () => {
      refetchReframes();
    }
  });
  const { createProtector, updateProtector, deleteProtector, loading: protectorMutationLoading } = useQuickShiftProtectorMutation({
    onSuccess: () => {
      refetchProtectors();
    }
  });

  // Ensure arrays
  const quickShiftLoops = Array.isArray(quickShiftLoopsData) ? quickShiftLoopsData : [];
  const reframeLibrary = Array.isArray(reframesData) ? reframesData : [];
  const protectors = Array.isArray(protectorsData) ? protectorsData : [];

  // Form state for new loop
  const [loopForm, setLoopForm] = useState({
    category: '',
    tierAvailability: [],
    icon: '',
    description: ''
  });

  // Mock data for Quick Shift loops and variations (keeping for reference structure)
  const mockQuickShiftLoops = [
    {
      id: 'QS-001',
      category: 'Too Much on My Plate',
      icon: '🍽️',
      emotionCount: 6,
      protectorVariations: 4,
      reframeVariations: 8,
      usageCount: 245,
      lastModified: '2024-03-10',
      status: 'Active',
      tierAvailability: ['User 1', 'User 2', 'User 3'],
      emotions: [
        { emotion: 'Anxious', fearStatement: 'If I dont handle everything perfectly, it will all fall apart', tier: ['User 1', 'User 2'], usageCount: 89 },
        { emotion: 'Overwhelmed', fearStatement: 'There is too much and I cant keep up', tier: ['User 1', 'User 2', 'User 3'], usageCount: 156 },
        { emotion: 'Pressured', fearStatement: 'Everyone needs something from me right now', tier: ['User 2', 'User 3'], usageCount: 67 }
      ]
    },
    {
      id: 'QS-002',
      category: 'What Will They Think',
      icon: '🤔',
      emotionCount: 5,
      protectorVariations: 3,
      reframeVariations: 6,
      usageCount: 189,
      lastModified: '2024-03-08',
      status: 'Active',
      tierAvailability: ['User 1', 'User 2'],
      emotions: [
        { emotion: 'Worried', fearStatement: 'What if they judge me or think less of me', tier: ['User 1'], usageCount: 78 },
        { emotion: 'Self-conscious', fearStatement: 'I might be doing something wrong or embarrassing', tier: ['User 1', 'User 2'], usageCount: 111 }
      ]
    },
    {
      id: 'QS-003',
      category: 'Being Hard on Myself',
      icon: '😤',
      emotionCount: 7,
      protectorVariations: 5,
      reframeVariations: 10,
      usageCount: 334,
      lastModified: '2024-03-12',
      status: 'Active',
      tierAvailability: ['User 1', 'User 2', 'User 3'],
      emotions: [
        { emotion: 'Ashamed', fearStatement: 'I should have known better or done better', tier: ['User 2', 'User 3'], usageCount: 145 },
        { emotion: 'Guilty', fearStatement: 'I did something wrong and hurt someone', tier: ['User 1', 'User 2'], usageCount: 189 }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Locked': return 'warning';
      case 'Draft': return 'secondary';
      default: return 'outline';
    }
  };

  // Filter loops by search query
  const filteredLoops = useMemo(() => {
    let filtered = quickShiftLoops;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loop => 
        loop.category?.toLowerCase().includes(query) ||
        loop.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [quickShiftLoops, searchQuery]);

  // Handle create loop
  const handleCreateLoop = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (!loopForm.category?.trim()) {
        toast.error('Category is required');
        return;
      }

      const payload = {
        category: loopForm.category.trim(),
        tierAvailability: loopForm.tierAvailability,
        icon: loopForm.icon || '',
        description: loopForm.description || ''
      };

      await createLoop(payload, { showSuccessToast: true });
      
      setLoopForm({
        category: '',
        tierAvailability: [],
        icon: '',
        description: ''
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating loop:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete loop
  const handleDeleteLoop = async (loopId) => {
    if (window.confirm('Are you sure you want to delete this loop?')) {
      try {
        await deleteLoop(loopId, { showSuccessToast: true });
        if (selectedLoop?.id === loopId) {
          setSelectedLoop(null);
        }
      } catch (error) {
        console.error('Error deleting loop:', error);
      }
    }
  };

  // Handle delete reframe
  const handleDeleteReframe = async (reframeId) => {
    if (window.confirm('Are you sure you want to delete this reframe?')) {
      try {
        await deleteReframe(reframeId, { showSuccessToast: true });
      } catch (error) {
        console.error('Error deleting reframe:', error);
      }
    }
  };

  // Handle delete protector
  const handleDeleteProtector = async (protectorId) => {
    if (window.confirm('Are you sure you want to delete this protector?')) {
      try {
        await deleteProtector(protectorId, { showSuccessToast: true });
      } catch (error) {
        console.error('Error deleting protector:', error);
      }
    }
  };

  return (
    <Layout
      title="Quick Shift Content Management"
      subtitle="Manage emotional regulation content variations across user tiers"
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variation
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="loops" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="loops">Loop Categories</TabsTrigger>
            <TabsTrigger value="reframes">Reframe Library</TabsTrigger>
            <TabsTrigger value="protectors">Protectors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Loop Categories */}
          <TabsContent value="loops" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search loop categories..."
                    className="pl-10 w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tier Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="1">Tier 1</SelectItem>
                    <SelectItem value="1A">Tier 1A</SelectItem>
                    <SelectItem value="2">Tier 2</SelectItem>
                    <SelectItem value="2A">Tier 2A</SelectItem>
                    <SelectItem value="3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Shift Loop Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {loopsLoading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : loopsError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading loops: {loopsError}</p>
                    <Button onClick={refetchLoops} variant="outline" className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loop Category</TableHead>
                        <TableHead>Tier Availability</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoops.length > 0 ? filteredLoops.map((loop) => (
                        <TableRow key={loop.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {loop.icon && <span className="text-2xl">{loop.icon}</span>}
                              <div>
                                <div className="font-medium">{loop.category || 'Untitled'}</div>
                                {loop.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {loop.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {loop.tierAvailability && Array.isArray(loop.tierAvailability) && loop.tierAvailability.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {loop.tierAvailability.map((tier) => (
                                  <Badge key={tier} variant="secondary" className="text-xs">
                                    {tier}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No tiers</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(loop.status || 'Active')}>
                              {loop.status || 'Active'}
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
                                <DropdownMenuItem onClick={() => setSelectedLoop(loop)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLoop(loop.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? 'No loops found matching your search' : 'No loops found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reframe Library */}
          <TabsContent value="reframes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reframe Statement Library</CardTitle>
              </CardHeader>
              <CardContent>
                {reframesLoading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : reframesError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading reframes: {reframesError}</p>
                    <Button onClick={refetchReframes} variant="outline" className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Instead of...</TableHead>
                        <TableHead>Truth becomes...</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reframeLibrary.length > 0 ? reframeLibrary.map((reframe) => (
                        <TableRow key={reframe.id}>
                          <TableCell>
                            <Badge variant="outline">{reframe.category || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{reframe.insteadOf || 'N/A'}</p>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{reframe.truthBecomes || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            {reframe.tierAvailability && Array.isArray(reframe.tierAvailability) && reframe.tierAvailability.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {reframe.tierAvailability.map((tier) => (
                                  <Badge key={tier} variant="secondary" className="text-xs">
                                    {tier}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No tiers</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(reframe.status || 'Active')}>
                              {reframe.status || 'Active'}
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
                                <DropdownMenuItem
                                  onClick={() => handleDeleteReframe(reframe.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No reframes found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protectors */}
          <TabsContent value="protectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Protector Archetypes</CardTitle>
              </CardHeader>
              <CardContent>
                {protectorsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading protectors...</span>
                  </div>
                ) : protectorsError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading protectors: {protectorsError}</p>
                    <Button onClick={refetchProtectors} variant="outline" className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : protectors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No protectors found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {protectors.map((protector) => (
                      <Card key={protector.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{protector.name || 'Unnamed Protector'}</h3>
                            <Badge variant={getStatusColor(protector.status || 'Active')}>
                              {protector.status || 'Active'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {protector.description || 'No description'}
                          </p>
                          {protector.associatedLoops && Array.isArray(protector.associatedLoops) && protector.associatedLoops.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Associated Loops:</div>
                              <div className="flex flex-wrap gap-1">
                                {protector.associatedLoops.map((loop) => (
                                  <Badge key={loop} variant="outline" className="text-xs">
                                    {loop}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProtector(protector.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Quick Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,247</div>
                  <p className="text-sm text-muted-foreground">Completed this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">87%</div>
                  <p className="text-sm text-muted-foreground">Average by step</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Used Loop</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">Being Hard on Myself</div>
                  <p className="text-sm text-muted-foreground">334 uses this month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Loop Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Quick Shift Variation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Loop Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plate">Too Much on My Plate</SelectItem>
                      <SelectItem value="think">What Will They Think</SelectItem>
                      <SelectItem value="hard">Being Hard on Myself</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Tier Availability</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">User 1</SelectItem>
                      <SelectItem value="user2">User 2</SelectItem>
                      <SelectItem value="user3">User 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emotion">Emotion</Label>
                <Input placeholder="e.g., Anxious, Overwhelmed" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fear">Fear Statement</Label>
                <Textarea 
                  placeholder="e.g., If I don't handle everything perfectly, it will all fall apart"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reframe">Reframe Statement</Label>
                <Textarea 
                  placeholder="e.g., I can slow down and trust that what matters will get done"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateModalOpen(false)}>
                  Create Variation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loop Detail Modal */}
        {selectedLoop && (
          <Dialog open={!!selectedLoop} onOpenChange={() => setSelectedLoop(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedLoop.category} - Loop Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Loop Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Category:</span>
                        <span className="ml-2">{selectedLoop.category}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Tier Availability:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedLoop.tierAvailability.map((tier) => (
                            <Badge key={tier} variant="outline">
                              {tier}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Usage Count:</span>
                        <span className="ml-2 font-semibold">{selectedLoop.usageCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Variations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Emotions:</span>
                        <span className="ml-2">{selectedLoop.emotionCount}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Protectors:</span>
                        <span className="ml-2">{selectedLoop.protectorVariations}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Reframes:</span>
                        <span className="ml-2">{selectedLoop.reframeVariations}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Associated Emotions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Emotion</TableHead>
                          <TableHead>Fear Statement</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Usage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLoop.emotions.map((emotion, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{emotion.emotion}</TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm">{emotion.fearStatement}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {emotion.tier.map((tier) => (
                                  <Badge key={tier} variant="secondary" className="text-xs">
                                    {tier}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{emotion.usageCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};