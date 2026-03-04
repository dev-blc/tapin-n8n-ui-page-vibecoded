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
  usePlotTwistCharacters,
  usePlotTwistQuestMutation,
  usePlotTwistQuests,
  usePlotTwistResponseOptions,
} from '@/hooks/usePlotTwists';
import { useTiers } from '@/hooks/useTiers';
import {
  Edit,
  Eye,
  Info,
  Layers,
  Loader2,
  MoreHorizontal,
  Plus, Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const PlotTwists = () => {
  const navigate = useNavigate();
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCharacter, selectedTier, selectedDay]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Use custom hook to handle auto-opening modal
  useAutoOpenModal(setIsCreateModalOpen);


  // Fetch characters first to build character map for filtering
  const { data: charactersData = [], loading: charactersLoading } = usePlotTwistCharacters({ showErrorToast: false });
  const characters = useMemo(
    () => (Array.isArray(charactersData) ? charactersData : []),
    [charactersData]
  );

  // Build character map from API data - handle null/undefined safely
  const characterMap = useMemo(() => {
    if (!characters || !Array.isArray(characters)) {
      return {};
    }
    return characters.reduce((acc, char) => {
      if (char && char.name && char.id) {
        acc[char.name] = char.id;
        // Also map by id for reverse lookup
        acc[char.id] = char.id;
      }
      return acc;
    }, {});
  }, [characters]);

  // Build reverse map (id to name) for display
  const characterNameMap = useMemo(() => {
    if (!characters || !Array.isArray(characters)) {
      return {};
    }
    return characters.reduce((acc, char) => {
      if (char && char.name && char.id) {
        acc[char.id] = char.name;
      }
      return acc;
    }, {});
  }, [characters]);

  // Fetch data from API
  const filterParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined
    };
    // Convert character name to UUID if not 'all'
    if (selectedCharacter !== 'all' && characterMap[selectedCharacter]) {
      params.characterId = characterMap[selectedCharacter];
    }
    if (selectedTier !== 'all') {
      params.tier = selectedTier;
    }
    // Add dayNumber filter if not 'all'
    if (selectedDay !== 'all') {
      const dayNumber = parseInt(selectedDay, 10);
      if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 7) {
        params.dayNumber = dayNumber;
      }
    }
    return params;
  }, [selectedCharacter, selectedTier, selectedDay, characterMap, currentPage, itemsPerPage, searchQuery]);

  const { data: plotTwistQuestsResponse, loading: questsLoading, error: questsError, refetch: refetchQuests } = usePlotTwistQuests({
    params: filterParams,
    showErrorToast: false
  });
  const { data: responseOptionsData = [] } = usePlotTwistResponseOptions({ showErrorToast: false });
  const { createQuest, updateQuest, deleteQuest, loading: mutationLoading } = usePlotTwistQuestMutation({
    onSuccess: () => {
      refetchQuests();
    }
  });

  // Fetch Tiers data for the new tab
  const { data: tiersData, loading: tiersLoading, error: tiersError } = useTiers();
  const tiers = useMemo(() => Array.isArray(tiersData) ? tiersData : (tiersData?.data || []), [tiersData]);

  const getTierAccentColor = (tierUser) => {
    switch (tierUser?.toString()) {
      case '1': return 'border-l-blue-500 bg-blue-50/30';
      case '2': return 'border-l-purple-500 bg-purple-50/30';
      case '3': return 'border-l-pink-500 bg-pink-50/30';
      default: return 'border-l-primary bg-primary/5';
    }
  };

  const getTierBadgeColor = (tierUser) => {
    switch (tierUser?.toString()) {
      case '1': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '2': return 'bg-purple-100 text-purple-700 border-purple-200';
      case '3': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  // Extract plotTwists from paginated response and transform for UI
  const plotTwistQuests = useMemo(() => {
    // Handle paginated response structure
    let questsArray = [];
    if (plotTwistQuestsResponse) {
      if (plotTwistQuestsResponse.plotTwists && Array.isArray(plotTwistQuestsResponse.plotTwists)) {
        questsArray = plotTwistQuestsResponse.plotTwists;
      } else if (Array.isArray(plotTwistQuestsResponse)) {
        questsArray = plotTwistQuestsResponse;
      } else if (plotTwistQuestsResponse.data && Array.isArray(plotTwistQuestsResponse.data)) {
        questsArray = plotTwistQuestsResponse.data;
      }
    }

    // Transform API data to UI format
    return questsArray.map(quest => ({
      ...quest,
      // Map characterId to character name for display
      character: characterNameMap[quest.characterId] || (typeof quest.character === 'object' ? quest.character?.name : quest.character) || 'N/A',
      // Map dayNumber to day for display
      day: quest.dayNumber || quest.day,
      // Map isActive to status
      status: quest.isActive === false ? 'Inactive' : (quest.status || 'Active'),
      // Prefer responses for display
      responseOptions: quest.responses || quest.options || []
    }));
  }, [plotTwistQuestsResponse, characterNameMap]);

  // Form state for new/edit quest
  const [questForm, setQuestForm] = useState({
    characterId: '',
    dayNumber: '',
    pillar: '',
    title: '',
    alternateTitle: '',
    description: '',
    contentImage: '',
    tier: '',
    tagIds: [],
    options: [
      { optionText: '', engagementLevel: 'high' }
    ],
    responses: [
      { responseEmoji: '', responseText: '', responseDescription: '', engagementLevel: 'high' }
    ],
    isActive: true
  });

  const alignedPillars = [
    { name: 'Awareness', color: 'bg-red-100 text-red-800', description: 'Building conscious recognition' },
    { name: 'Light (Clarity)', color: 'bg-yellow-100 text-yellow-800', description: 'Gaining clear understanding' },
    { name: 'Intention', color: 'bg-blue-100 text-blue-800', description: 'Setting purposeful direction' },
    { name: 'Gratitude', color: 'bg-pink-100 text-pink-800', description: 'Appreciating what is' },
    { name: 'Nowness', color: 'bg-green-100 text-green-800', description: 'Embracing present moment' },
    { name: 'Expansion', color: 'bg-purple-100 text-purple-800', description: 'Growing beyond limits' },
    { name: 'Dedication', color: 'bg-orange-100 text-orange-800', description: 'Committing to growth' }
  ];

  const getStatusColor = (status) => {
    // This is now handled by StatusBadge component
    return status;
  };

  const getPillarColor = (pillar) => {
    const pillarObj = alignedPillars.find(p => p.name === pillar);
    return pillarObj ? pillarObj.color : 'bg-gray-100 text-gray-800';
  };

  // Since we're using server-side filtering, filteredQuests is mostly just plotTwistQuests
  const filteredQuests = useMemo(() => {
    return plotTwistQuests;
  }, [plotTwistQuests]);

  const totalQuestsCount = useMemo(() => {
    if (plotTwistQuestsResponse?.pagination?.total !== undefined) {
      return plotTwistQuestsResponse.pagination.total;
    }
    return plotTwistQuests.length;
  }, [plotTwistQuestsResponse, plotTwistQuests]);

  const paginatedQuests = useMemo(() => {
    // With server-side pagination, we don't slice locally
    return plotTwistQuests;
  }, [plotTwistQuests]);

  // Handle create quest
  const handleCreateQuest = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Validation
      if (!questForm.title?.trim()) {
        toast.error('Quest title is required');
        return;
      }
      if (!questForm.description?.trim()) {
        toast.error('Quest description is required');
        return;
      }
      if (!questForm.characterId) {
        toast.error('Character is required');
        return;
      }
      if (!questForm.dayNumber) {
        toast.error('Day Number is required');
        return;
      }
      if (!questForm.tier) {
        toast.error('Tier is required');
        return;
      }

      // Convert day to number
      const dayNumberValue = parseInt(questForm.dayNumber, 10);
      if (isNaN(dayNumberValue) || dayNumberValue < 1 || dayNumberValue > 7) {
        toast.error('Day Number must be between 1 and 7');
        return;
      }

      // Map options and responses to correct format
      const finalOptions = questForm.options
        .filter(opt => opt.optionText.trim())
        .map((opt, index) => ({
          ...opt,
          displayOrder: index + 1,
          tier: questForm.tier,
          characterId: questForm.characterId
        }));

      const finalResponses = questForm.responses
        .filter(resp => resp.responseText.trim())
        .map((resp, index) => ({
          ...resp,
          displayOrder: index + 1,
          tier: questForm.tier,
          characterId: questForm.characterId
        }));

      const payload = {
        characterId: questForm.characterId,
        tier: questForm.tier,
        dayNumber: dayNumberValue,
        title: questForm.title.trim(),
        alternateTitle: questForm.alternateTitle.trim() || "",
        description: questForm.description.trim(),
        tagIds: questForm.tagIds || [],
        contentImage: questForm.contentImage.trim() || "",
        isActive: questForm.isActive,
        options: finalOptions,
        responses: finalResponses
      };

      await createQuest(payload, { 
        showSuccessToast: true,
        onSuccess: () => {
          refetchQuests();
          setIsCreateModalOpen(false);
          setQuestForm({
            characterId: '',
            dayNumber: '',
            pillar: '',
            title: '',
            alternateTitle: '',
            description: '',
            contentImage: '',
            tier: '',
            tagIds: [],
            options: [{ optionText: '', engagementLevel: 'high' }],
            responses: [{ responseEmoji: '', responseText: '', responseDescription: '', engagementLevel: 'high' }],
            isActive: true
          });
        }
      });
    } catch (error) {
      console.error('Error creating quest:', error);
      toast.error(error.message || 'Failed to create quest.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete quest
  const handleDeleteQuest = async (questId) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      try {
        await deleteQuest(questId, { 
          showSuccessToast: true,
          onSuccess: () => {
            refetchQuests();
            if (selectedQuest?.id === questId) {
              setSelectedQuest(null);
            }
          }
        });
      } catch (error) {
        console.error('Error deleting quest:', error);
      }
    }
  };

  // Handle edit quest
  const handleEditQuest = (quest) => {
    setSelectedQuest(quest);
    
    setQuestForm({
      characterId: quest.characterId || '',
      dayNumber: (quest.dayNumber || quest.day)?.toString() || '',
      pillar: quest.pillar || '',
      title: quest.title || '',
      alternateTitle: quest.alternateTitle || '',
      description: quest.description || '',
      contentImage: quest.contentImage || '',
      tier: quest.tier || '',
      tagIds: quest.tagIds || [],
      isActive: quest.isActive !== undefined ? quest.isActive : true,
      options: quest.options && quest.options.length > 0 
        ? quest.options 
        : [{ optionText: '', engagementLevel: 'high' }],
      responses: quest.responses && quest.responses.length > 0
        ? quest.responses
        : [{ responseEmoji: '', responseText: '', responseDescription: '', engagementLevel: 'high' }]
    });
    setIsEditModalOpen(true);
  };

  // Handle update quest
  const handleUpdateQuest = async () => {
    if (submitting || !selectedQuest) return;

    try {
      setSubmitting(true);

      if (!questForm.characterId) {
        toast.error('Character is required');
        return;
      }

      // Convert day to number
      const dayNumberValue = parseInt(questForm.dayNumber, 10);
      if (isNaN(dayNumberValue) || dayNumberValue < 1 || dayNumberValue > 7) {
        toast.error('Day must be a number between 1 and 7');
        return;
      }

      // Map options and responses to correct format, stripping IDs to ensure clean replacement 
      // some backends for nested collections prefer this on PUT unless they are fine-grained
      const finalOptions = questForm.options
        .filter(opt => opt.optionText.trim())
        .map((opt, index) => ({
          optionText: opt.optionText,
          displayOrder: index + 1,
          tier: questForm.tier,
          characterId: questForm.characterId,
          engagementLevel: opt.engagementLevel || 'high'
        }));

      const finalResponses = questForm.responses
        .filter(resp => resp.responseText.trim())
        .map((resp, index) => ({
          responseEmoji: resp.responseEmoji,
          responseText: resp.responseText,
          responseDescription: resp.responseDescription,
          displayOrder: index + 1,
          tier: questForm.tier,
          characterId: questForm.characterId,
          engagementLevel: resp.engagementLevel || 'high'
        }));

      const payload = {
        characterId: questForm.characterId,
        tier: questForm.tier,
        dayNumber: dayNumberValue,
        title: questForm.title.trim(),
        alternateTitle: questForm.alternateTitle.trim() || "",
        description: questForm.description.trim(),
        tagIds: questForm.tagIds || [],
        contentImage: questForm.contentImage.trim() || "",
        isActive: questForm.isActive,
        options: finalOptions,
        responses: finalResponses
      };

      await updateQuest({ id: selectedQuest.id, data: payload }, { 
        showSuccessToast: true,
        onSuccess: () => {
          refetchQuests();
          setIsEditModalOpen(false);
          setSelectedQuest(null);
          setQuestForm({
            characterId: '',
            dayNumber: '',
            pillar: '',
            title: '',
            alternateTitle: '',
            description: '',
            contentImage: '',
            tier: '',
            tagIds: [],
            options: [{ optionText: '', engagementLevel: 'high' }],
            responses: [{ responseEmoji: '', responseText: '', responseDescription: '', engagementLevel: 'high' }],
            isActive: true
          });
        }
      });
    } catch (error) {
      console.error('Error updating quest:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Plot Twist Content Management"
      subtitle="Manage daily challenges and character-based quest content"
      headerActions={
        <div className="flex space-x-2">
          {/* Header Analytics and Calendar View hidden for Plot Twists */}
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plot Twist
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="quests" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quests">Quest Management</TabsTrigger>
            <TabsTrigger value="characters">Character Arcs</TabsTrigger>
            <TabsTrigger value="tiers">Tier Path</TabsTrigger>
            <TabsTrigger value="responses">Response Library</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Quest Management */}
          <TabsContent value="quests" className="space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search quests..."
                    className="pl-10 w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Character" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Characters</SelectItem>
                    {charactersLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      characters.map((character) => (
                        <SelectItem key={character.id || character.name} value={character.name || character.id || ''}>
                          {character.icon || character.emoji || '👤'} {character.name}
                      </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tier" />
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
                
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Day {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Plot Twist Quests</CardTitle>
                <div className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-300 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  {searchQuery || selectedCharacter !== 'all' || selectedTier !== 'all' || selectedDay !== 'all'
                    ? `Showing ${filteredQuests.length} of ${totalQuestsCount} results` 
                    : `${totalQuestsCount} Quests`
                  }
                </div>
              </CardHeader>
              <CardContent>
                {questsLoading ? (
                  <TableSkeleton rows={5} columns={7} />
                ) : questsError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading quests: {questsError}</p>
                    <Button onClick={refetchQuests} variant="outline" className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Character & Day</TableHead>
                      <TableHead>Titles</TableHead>
                      <TableHead>Pillar</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody key={currentPage} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {paginatedQuests.length > 0 ? paginatedQuests.map((quest) => (
                        <TableRow 
                          key={quest.id} 
                          className="transition-all duration-200 hover:bg-muted/50 hover:translate-x-1 border-l-2 border-l-transparent hover:border-l-primary"
                        >
                        <TableCell>
                          <div className="space-y-1">
                              <div className="font-medium">{quest.character || 'N/A'}</div>
                            <Badge variant="outline" className="text-xs">
                                Day {quest.day || 'N/A'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                              <p className="font-medium text-sm truncate">{quest.title || 'Untitled'}</p>
                              {quest.alternateTitle && (
                                <p className="text-xs text-muted-foreground italic truncate">
                                  Alt: {quest.alternateTitle}
                                </p>
                              )}
                            <p className="text-xs text-muted-foreground truncate line-clamp-1">
                                {quest.description || 'No description'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPillarColor(quest.pillar)}>
                              {quest.pillar || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{quest.tier || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium">Opt:</span>
                                <span>{quest.options?.length || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium">Resp:</span>
                                <span>{quest.responses?.length || 0}</span>
                              </div>
                          </div>
                        </TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={quest.status || 'Active'} 
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
                              <DropdownMenuItem onClick={() => setSelectedQuest(quest)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditQuest(quest)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Quest
                              </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteQuest(quest.id)}
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
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? 'No quests found matching your search' : 'No quests found'}
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                  </Table>
                )}

                {filteredQuests.length > 0 && !questsLoading && (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalQuestsCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    className="mt-4"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Character Arcs */}
          <TabsContent value="characters" className="space-y-4">
            {charactersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading characters...</span>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No characters found
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character) => {
                  // Count quests for this character by day
                  const characterQuests = plotTwistQuests.filter(q => q.character === (character.name || character.id));
                  const questDays = new Set(characterQuests.map(q => q.day));
                  
                  return (
                    <Card key={character.id || character.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                          <span className="text-2xl">{character.icon || '👤'}</span>
                      <span className="text-lg">{character.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                          {character.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">7-Day Arc Progress:</div>
                      <div className="grid grid-cols-7 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <div
                            key={day}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                                  questDays.has(day) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                                title={questDays.has(day) ? `Day ${day} quest exists` : `Day ${day} quest missing`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                          <div className="text-xs text-muted-foreground">
                            {characterQuests.length} quest{characterQuests.length !== 1 ? 's' : ''} created
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedCharacter(character.name || character.id);
                              // Switch to quests tab
                              document.querySelector('[value="quests"]')?.click();
                            }}
                          >
                        <Eye className="h-4 w-4 mr-1" />
                            View Quests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                  );
                })}
            </div>
            )}
          </TabsContent>

          {/* Tier Path */}
          <TabsContent value="tiers" className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">The Growth Journey</h2>
                    <p className="text-muted-foreground max-w-3xl text-sm">
                      TAP IN uses a dynamic scoring system to guide users through 6 awareness tiers. 
                      As a user's score increases, the tone of Plot Twists and Quick Shifts evolves 
                      from gentle guidance to expanded empowerment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {tiersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-48 animate-pulse bg-muted/20" />
                ))}
              </div>
            ) : tiersError ? (
              <div className="text-center py-12">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block mb-4">
                  {tiersError}
                </div>
                <p className="text-muted-foreground">Unable to load tier data. Please try again later.</p>
              </div>
            ) : tiers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Tier Data Found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <Card 
                    key={tier.code || tier.id} 
                    className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 ${getTierAccentColor(tier.tierUser)}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                             <span className="text-2xl font-bold text-foreground">{tier.code || 'N/A'}</span>
                             <Badge variant="outline" className={getTierBadgeColor(tier.tierUser)}>
                               User {tier.tierUser || '?'}
                             </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {tier.tier_name || 'Unnamed Tier'}
                          </CardTitle>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Sparkles className="h-5 w-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-border/40">
                        <div className="flex items-center text-sm font-medium">
                          <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                          Score Range
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {tier.scoreRange || `${tier.minScore}-${tier.maxScore}`}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Tone Tag</div>
                          <Badge variant="secondary" className="font-medium text-[10px]">
                            {tier.tone?.tag || 'Empowerment'}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Tone Essence</div>
                          <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                            {tier.tone?.essence|| 'No essence description available.'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                           <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 flex items-center">
                             <TrendingUp className="h-3 w-3 mr-1" />
                             Initial Cycle
                           </div>
                           <p className="text-xs italic text-muted-foreground">
                             {tier.initial_cycle || 'Default mapping'}
                           </p>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg border border-border/30 mt-4">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Voice Anchor</div>
                          <p className="text-xs italic text-muted-foreground/90 font-serif">
                            "{tier.anchors?.voice_anchors || 'The voice of growth and clarity.'}"
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Response Library */}
          <TabsContent value="responses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Option Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl">😊</div>
                        <div className="font-medium">High Engagement</div>
                        <p className="text-sm text-muted-foreground">
                          Responses indicating full completion or strong resonance
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Used in 45% of responses
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl">🤔</div>
                        <div className="font-medium">Medium Engagement</div>
                        <p className="text-sm text-muted-foreground">
                          Responses showing partial engagement or awareness
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Used in 38% of responses
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl">😅</div>
                        <div className="font-medium">Learning Mode</div>
                        <p className="text-sm text-muted-foreground">
                          Responses indicating beginning awareness or struggle
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Used in 17% of responses
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Quests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">347</div>
                  <p className="text-sm text-muted-foreground">Across all characters</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">84%</div>
                  <p className="text-sm text-muted-foreground">Daily quest completion</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Popular Character</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">The Deserving One</div>
                  <p className="text-sm text-muted-foreground">234 completions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Pillar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">Awareness</div>
                  <p className="text-sm text-muted-foreground">Most engaged pillar</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Quest Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Plot Twist Quest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="character">Character *</Label>
                  <Select
                    value={questForm.characterId}
                    onValueChange={(value) => setQuestForm({ ...questForm, characterId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {charactersLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        characters.map((character) => (
                          <SelectItem key={character.id} value={character.id}>
                            {character.icon || '👤'} {character.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day">Day Number (1-7) *</Label>
                  <Select
                    value={questForm.dayNumber}
                    onValueChange={(value) => setQuestForm({ ...questForm, dayNumber: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Day {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tier">Tier *</Label>
                  <Select
                    value={questForm.tier}
                    onValueChange={(value) => setQuestForm({ ...questForm, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1</SelectItem>
                      <SelectItem value="1A">Tier 1A</SelectItem>
                      <SelectItem value="2">Tier 2</SelectItem>
                      <SelectItem value="2A">Tier 2A</SelectItem>
                      <SelectItem value="3">Tier 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pillar">Aligned Pillar (Optional)</Label>
                  <Select
                    value={questForm.pillar}
                    onValueChange={(value) => setQuestForm({ ...questForm, pillar: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      {alignedPillars.map((pillar) => (
                        <SelectItem key={pillar.name} value={pillar.name}>
                          {pillar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Main Title *</Label>
                  <Input
                    placeholder="e.g., Set a low-stakes goal..."
                    value={questForm.title}
                    onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt-title">Alternate Title</Label>
                  <Input
                    placeholder="e.g., Catch the urge to overgive..."
                    value={questForm.alternateTitle}
                    onChange={(e) => setQuestForm({ ...questForm, alternateTitle: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  placeholder="Detailed explanation of the quest..."
                  rows={3}
                  value={questForm.description}
                  onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-image">Content Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={questForm.contentImage}
                    onChange={(e) => setQuestForm({ ...questForm, contentImage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-ids">Tag IDs (Comma separated)</Label>
                  <Input
                    placeholder="uuid-tag-1, uuid-tag-2"
                    value={questForm.tagIds.join(', ')}
                    onChange={(e) => setQuestForm({ ...questForm, tagIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive-create">Active Status</Label>
                  <Select
                    value={questForm.isActive ? "true" : "false"}
                    onValueChange={(val) => setQuestForm({ ...questForm, isActive: val === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">User Content Options</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuestForm({
                      ...questForm,
                      options: [...questForm.options, { optionText: '', engagementLevel: 'high' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
                {questForm.options.map((option, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg relative group">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Option Text</Label>
                      <Input
                        placeholder="Option text..."
                        value={option.optionText}
                        onChange={(e) => {
                          const updated = [...questForm.options];
                          updated[index] = { ...updated[index], optionText: e.target.value };
                          setQuestForm({ ...questForm, options: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Level</Label>
                      <Select
                        value={option.engagementLevel}
                        onValueChange={(value) => {
                          const updated = [...questForm.options];
                          updated[index] = { ...updated[index], engagementLevel: value };
                          setQuestForm({ ...questForm, options: updated });
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {questForm.options.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updated = [...questForm.options];
                          updated.splice(index, 1);
                          setQuestForm({ ...questForm, options: updated });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Character Responses</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuestForm({
                      ...questForm,
                      responses: [...questForm.responses, { responseEmoji: '', responseText: '', responseDescription: '', engagementLevel: 'high' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Response
                  </Button>
                </div>
                {questForm.responses.map((resp, index) => (
                  <div key={index} className="space-y-3 p-3 bg-accent/10 rounded-lg relative group border border-accent/20">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Emoji</Label>
                        <Input
                          placeholder="🔥"
                          className="text-center"
                          value={resp.responseEmoji}
                          onChange={(e) => {
                            const updated = [...questForm.responses];
                            updated[index] = { ...updated[index], responseEmoji: e.target.value };
                            setQuestForm({ ...questForm, responses: updated });
                          }}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Response Text</Label>
                        <Input
                          placeholder="Mastery is choosing..."
                          value={resp.responseText}
                          onChange={(e) => {
                            const updated = [...questForm.responses];
                            updated[index] = { ...updated[index], responseText: e.target.value };
                            setQuestForm({ ...questForm, responses: updated });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Level</Label>
                        <Select
                          value={resp.engagementLevel}
                          onValueChange={(value) => {
                            const updated = [...questForm.responses];
                            updated[index] = { ...updated[index], engagementLevel: value };
                            setQuestForm({ ...questForm, responses: updated });
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Detailed Description</Label>
                      <Textarea
                        placeholder="Explain the meaning behind the response..."
                        rows={2}
                        className="text-xs"
                        value={resp.responseDescription}
                        onChange={(e) => {
                          const updated = [...questForm.responses];
                          updated[index] = { ...updated[index], responseDescription: e.target.value };
                          setQuestForm({ ...questForm, responses: updated });
                        }}
                      />
                    </div>
                    {questForm.responses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updated = [...questForm.responses];
                          updated.splice(index, 1);
                          setQuestForm({ ...questForm, responses: updated });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateQuest}
                  disabled={submitting || !questForm.title || !questForm.description || !questForm.characterId || !questForm.dayNumber || !questForm.tier}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Quest'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quest Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Plot Twist Quest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="character-edit">Character *</Label>
                  <Select
                    value={questForm.characterId}
                    onValueChange={(value) => setQuestForm({ ...questForm, characterId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map((character) => (
                        <SelectItem key={character.id} value={character.id}>
                          {character.icon || '👤'} {character.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day-edit">Day Number (1-7) *</Label>
                  <Select
                    value={questForm.dayNumber}
                    onValueChange={(value) => setQuestForm({ ...questForm, dayNumber: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Day {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tier-edit">Tier *</Label>
                  <Select
                    value={questForm.tier}
                    onValueChange={(value) => setQuestForm({ ...questForm, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1</SelectItem>
                      <SelectItem value="1A">Tier 1A</SelectItem>
                      <SelectItem value="2">Tier 2</SelectItem>
                      <SelectItem value="2A">Tier 2A</SelectItem>
                      <SelectItem value="3">Tier 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pillar-edit">Aligned Pillar (Optional)</Label>
                  <Select
                    value={questForm.pillar}
                    onValueChange={(value) => setQuestForm({ ...questForm, pillar: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      {alignedPillars.map((pillar) => (
                        <SelectItem key={pillar.name} value={pillar.name}>
                          {pillar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              

              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title-edit">Main Title *</Label>
                  <Input
                    placeholder="e.g., Set a low-stakes goal..."
                    value={questForm.title}
                    onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt-title-edit">Alternate Title</Label>
                  <Input
                    placeholder="e.g., Catch the urge to overgive..."
                    value={questForm.alternateTitle}
                    onChange={(e) => setQuestForm({ ...questForm, alternateTitle: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description-edit">Description *</Label>
                <Textarea 
                  placeholder="Detailed explanation..."
                  rows={3}
                  value={questForm.description}
                  onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-image-edit">Content Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={questForm.contentImage}
                    onChange={(e) => setQuestForm({ ...questForm, contentImage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-ids-edit">Tag IDs (Comma separated)</Label>
                  <Input
                    placeholder="uuid-tag-1, uuid-tag-2"
                    value={questForm.tagIds.join(', ')}
                    onChange={(e) => setQuestForm({ ...questForm, tagIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive-edit">Active Status</Label>
                  <Select
                    value={questForm.isActive ? "true" : "false"}
                    onValueChange={(val) => setQuestForm({ ...questForm, isActive: val === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">User Content Options</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuestForm({
                      ...questForm,
                      options: [...questForm.options, { optionText: '', engagementLevel: 'high' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
                {questForm.options.map((option, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg relative group">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Option Text</Label>
                      <Input
                        placeholder="Option text..."
                        value={option.optionText}
                        onChange={(e) => {
                          const updated = [...questForm.options];
                          updated[index] = { ...updated[index], optionText: e.target.value };
                          setQuestForm({ ...questForm, options: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Level</Label>
                      <Select
                        value={option.engagementLevel}
                        onValueChange={(value) => {
                          const updated = [...questForm.options];
                          updated[index] = { ...updated[index], engagementLevel: value };
                          setQuestForm({ ...questForm, options: updated });
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {questForm.options.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updated = [...questForm.options];
                          updated.splice(index, 1);
                          setQuestForm({ ...questForm, options: updated });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Character Responses</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuestForm({
                      ...questForm,
                      responses: [...questForm.responses, { responseEmoji: '', responseText: '', responseDescription: '', engagementLevel: 'high' }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Response
                  </Button>
                </div>
                {questForm.responses.map((resp, index) => (
                  <div key={index} className="space-y-3 p-3 bg-accent/10 rounded-lg relative group border border-accent/20">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Emoji</Label>
                        <Input
                          placeholder="🔥"
                          className="text-center"
                          value={resp.responseEmoji || ''}
                          onChange={(e) => {
                            const updated = [...questForm.responses];
                            updated[index] = { ...updated[index], responseEmoji: e.target.value };
                            setQuestForm({ ...questForm, responses: updated });
                          }}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Response Text</Label>
                        <Input
                          placeholder="Mastery is choosing..."
                          value={resp.responseText || ''}
                          onChange={(e) => {
                            const updated = [...questForm.responses];
                            updated[index] = { ...updated[index], responseText: e.target.value };
                            setQuestForm({ ...questForm, responses: updated });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Level</Label>
                        <Select
                          value={resp.engagementLevel || 'high'}
                          onValueChange={(value) => {
                            const updated = [...questForm.responses];
                            updated[index] = { ...updated[index], engagementLevel: value };
                            setQuestForm({ ...questForm, responses: updated });
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Detailed Description</Label>
                      <Textarea
                        placeholder="Explain the meaning behind the response..."
                        rows={2}
                        className="text-xs"
                        value={resp.responseDescription || ''}
                        onChange={(e) => {
                          const updated = [...questForm.responses];
                          updated[index] = { ...updated[index], responseDescription: e.target.value };
                          setQuestForm({ ...questForm, responses: updated });
                        }}
                      />
                    </div>
                    {questForm.responses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updated = [...questForm.responses];
                          updated.splice(index, 1);
                          setQuestForm({ ...questForm, responses: updated });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedQuest(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateQuest}
                  disabled={submitting || !questForm.title || !questForm.description || !questForm.characterId || !questForm.dayNumber || !questForm.tier}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Quest'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quest Detail Modal */}
        {selectedQuest && (
          <Dialog open={!!selectedQuest} onOpenChange={() => setSelectedQuest(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedQuest.character || 'Unknown Character'} - Day {selectedQuest.day || 'N/A'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Character:</span>
                        <span className="ml-2">{selectedQuest.character || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Day:</span>
                        <span className="ml-2">{selectedQuest.day || 'N/A'} of 7</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Aligned Pillar:</span>
                        <Badge className={getPillarColor(selectedQuest.pillar)} variant="outline">
                          {selectedQuest.pillar || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Tier:</span>
                        <Badge variant="secondary">{selectedQuest.tier || 'N/A'}</Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Quest ID:</span>
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {selectedQuest.id?.substring(0, 8)}...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <StatusBadge status={selectedQuest.status || 'Active'} className="ml-2" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Response Options:</span>
                        <span className="ml-2 font-semibold">{selectedQuest.responseOptions?.length || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quest Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Title:</h4>
                        <p className="text-sm">{selectedQuest.title || 'No title'}</p>
                      </div>
                      {selectedQuest.alternateTitle && (
                        <div>
                          <h4 className="font-medium mb-1">Alternate Title:</h4>
                          <p className="text-sm italic">{selectedQuest.alternateTitle}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedQuest.contentImage && (
                      <div>
                        <h4 className="font-medium mb-2">Content Image:</h4>
                        <div className="rounded-lg overflow-hidden border max-w-sm">
                          <img src={selectedQuest.contentImage} alt="Quest content" className="w-full h-auto object-cover" />
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Description:</h4>
                      <p className="text-sm text-muted-foreground">{selectedQuest.description || 'No description'}</p>
                    </div>

                    {selectedQuest.tagIds && selectedQuest.tagIds.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Tag IDs:</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedQuest.tagIds.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] font-mono">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                       {selectedQuest.options && selectedQuest.options.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">User Options:</h4>
                          {selectedQuest.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-muted/30 rounded border text-xs">
                              <Badge variant="secondary" className="scale-75 origin-left">
                                {option.engagementLevel}
                              </Badge>
                              <span>{option.optionText}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedQuest.responses && selectedQuest.responses.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Character Responses:</h4>
                          {selectedQuest.responses.map((resp, index) => (
                            <div key={index} className="space-y-1 p-2 bg-accent/5 rounded border border-accent/10 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-base">{resp.responseEmoji}</span>
                                <Badge variant="outline" className="scale-75 origin-left text-[8px]">
                                  {resp.engagementLevel}
                                </Badge>
                                <span className="font-medium">{resp.responseText}</span>
                              </div>
                              {resp.responseDescription && (
                                <p className="text-[10px] text-muted-foreground italic pl-6">
                                  {resp.responseDescription}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedQuest(null)}>
                    Close
                  </Button>
                  <Button onClick={() => handleEditQuest(selectedQuest)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Quest
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};