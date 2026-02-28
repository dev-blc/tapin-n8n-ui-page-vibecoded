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
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { useAutoOpenModal } from '@/hooks/useAutoOpenModal';
import {
  useQuickShiftLoopMutation,
  useQuickShiftLoops,
  useQuickShiftProtectorMutation,
  useQuickShiftProtectors,
  useQuickShiftReframeMutation,
  useQuickShiftReframes,
} from '@/hooks/useQuickShifts';
import {
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const QuickShifts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTier]);

  // Use custom hook to handle auto-opening modal
  useAutoOpenModal(setIsCreateModalOpen);

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

  // Transform API data to match UI expectations
  const transformLoopData = (loop) => {
    if (!loop) return null;
    
    const transformed = {
      id: loop.id || loop._id || '',
      category: loop.category || loop.name || loop.title || 'Untitled',
      icon: loop.icon || loop.emoji || '',
      description: loop.description || '',
      status: loop.status || (loop.isActive !== false ? 'Active' : 'Inactive'),
      tierAvailability: Array.isArray(loop.tierAvailability) 
        ? loop.tierAvailability 
        : Array.isArray(loop.tiers) 
          ? loop.tiers 
          : loop.tier 
            ? [loop.tier] 
            : [],
      // Preserve all other fields for potential use
      ...loop
    };
    
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development' && !loop.category && !loop.name && !loop.title) {
      console.log('[QuickShifts] Transformed loop data:', transformed);
    }
    
    return transformed;
  };

  // Ensure arrays and transform data
  const quickShiftLoops = useMemo(() => {
    if (!Array.isArray(quickShiftLoopsData)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[QuickShifts] Received non-array data:', quickShiftLoopsData);
      }
      return [];
    }
    
    const transformed = quickShiftLoopsData.map(transformLoopData).filter(Boolean);
    
    if (process.env.NODE_ENV === 'development' && transformed.length > 0) {
      console.log(`[QuickShifts] Loaded ${transformed.length} loop(s) from API`);
    }
    
    return transformed;
  }, [quickShiftLoopsData]);
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
    // ... data omitted for space ...
  ];

  // Filter and sort loops
  const filteredLoops = useMemo(() => {
    let filtered = [...quickShiftLoops];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loop => 
        loop.category?.toLowerCase().includes(query) ||
        loop.description?.toLowerCase().includes(query) ||
        loop.name?.toLowerCase().includes(query) ||
        loop.title?.toLowerCase().includes(query)
      );
    }
    
    // Apply tier filter if selected
    if (selectedTier !== 'all') {
      filtered = filtered.filter(loop => {
        if (!loop.tierAvailability || loop.tierAvailability.length === 0) {
          return false;
        }
        return loop.tierAvailability.includes(selectedTier) || 
               loop.tierAvailability.some(tier => tier.toString().includes(selectedTier));
      });
    }
    
    // Sort by category name (alphabetically), with "Untitled" at the end
    filtered.sort((a, b) => {
      const aCategory = a.category || 'Untitled';
      const bCategory = b.category || 'Untitled';
      
      if (aCategory === 'Untitled' && bCategory !== 'Untitled') return 1;
      if (bCategory === 'Untitled' && aCategory !== 'Untitled') return -1;
      
      return aCategory.localeCompare(bCategory);
    });
    
    return filtered;
  }, [quickShiftLoops, searchQuery, selectedTier]);

  // Paginate filtered loops
  const paginatedLoops = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLoops.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLoops, currentPage, itemsPerPage]);

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
    // Reframe deletion is not available - endpoint not in OpenAPI spec
    toast.error('Reframe deletion is not available in the current API specification');
  };

  // Handle delete protector
  const handleDeleteProtector = async (protectorId) => {
    // Protector deletion is not available - endpoint not in OpenAPI spec
    toast.error('Protector deletion is not available in the current API specification');
  };

  return (
    <Layout
      title="Quick Shift Content Management"
      subtitle="Manage emotional regulation content variations across user tiers"
      headerActions={
        <div className="flex space-x-2">
          {/* Header Analytics and Filters hidden for Quick Shifts */}
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
          <TabsContent value="loops" className="space-y-6">
            <div className="flex items-center space-x-4 mb-2">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Quick Shift Loop Categories</CardTitle>
                <div className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-300 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  {searchQuery || selectedTier !== 'all' 
                    ? `Showing ${filteredLoops.length} results` 
                    : `${filteredLoops.length} Variations`
                  }
                </div>
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
                    <TableBody key={currentPage} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {paginatedLoops.length > 0 ? paginatedLoops.map((loop) => (
                        <TableRow 
                          key={loop.id} 
                          className="cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:translate-x-1 border-l-2 border-l-transparent hover:border-l-primary"
                        >
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
                                {loop.tierAvailability.map((tier, idx) => (
                                  <Badge 
                                    key={tier || idx} 
                                    variant="secondary" 
                                    className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20 shadow-[0_0_8px_rgba(var(--primary),0.1)] px-2"
                                  >
                                    {tier || 'N/A'}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No tiers</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={loop.status || 'Active'} 
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

                {filteredLoops.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredLoops.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reframe Library */}
          <TabsContent value="reframes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reframe Statement Library</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Note: Reframe endpoints are not available in the current API specification.
                </p>
              </CardHeader>
              <CardContent>
                {reframesLoading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : reframesError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Reframes feature is not available</p>
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
                            <StatusBadge status={reframe.status || 'Active'} />
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
                <p className="text-sm text-muted-foreground mt-2">
                  Note: Protector endpoints are not available in the current API specification.
                </p>
              </CardHeader>
              <CardContent>
                {protectorsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading protectors...</span>
                  </div>
                ) : protectorsError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Protectors feature is not available</p>
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
                                                        <StatusBadge status={protector.status || 'Active'} />
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
                        {Array.isArray(selectedLoop.emotions) && selectedLoop.emotions.length > 0 ? (
                          selectedLoop.emotions.map((emotion, index) => {
                            const tiers = Array.isArray(emotion.tier) ? emotion.tier : [];
                            return (
                              <TableRow key={emotion.id || index}>
                                <TableCell className="font-medium">{emotion.emotion || 'N/A'}</TableCell>
                                <TableCell className="max-w-md">
                                  <p className="text-sm">{emotion.fearStatement || 'N/A'}</p>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {tiers.length > 0 ? (
                                      tiers.map((tier) => (
                                        <Badge key={tier} variant="secondary" className="text-xs">
                                          {tier}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No tiers</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{emotion.usageCount ?? '—'}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              No associated emotions available
                            </TableCell>
                          </TableRow>
                        )}
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