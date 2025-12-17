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
  Shuffle,
  Search,
  Filter,
  Plus,
  Edit,
  Calendar,
  Users,
  BarChart3,
  Eye,
  Copy,
  MoreHorizontal,
  Star,
  Target,
  Trash2,
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
  usePlotTwistQuests,
  usePlotTwistCharacters,
  usePlotTwistResponseOptions,
  usePlotTwistQuestMutation,
} from '@/hooks/usePlotTwists';
import { FullPageLoader, TableSkeleton } from '@/components/loading/LoadingSpinner';

export const PlotTwists = () => {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    const params = {};
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
  }, [selectedCharacter, selectedTier, selectedDay, characterMap]);

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
      character: characterNameMap[quest.characterId] || quest.character || 'N/A',
      // Map dayNumber to day for display
      day: quest.dayNumber || quest.day,
      // Map isActive to status
      status: quest.isActive === false ? 'Inactive' : (quest.status || 'Active'),
      // Ensure responseOptions exists (may need to fetch separately or derive from options/responses)
      responseOptions: quest.responseOptions || quest.responses || []
    }));
  }, [plotTwistQuestsResponse, characterNameMap]);

  // Form state for new/edit quest
  const [questForm, setQuestForm] = useState({
    character: '',
    day: '',
    pillar: '',
    title: '',
    description: '',
    tier: '',
      responseOptions: [
      { emoji: '', text: '', level: 'High' },
      { emoji: '', text: '', level: 'Medium' },
      { emoji: '', text: '', level: 'Low' }
    ]
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
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'secondary';
      case 'Locked': return 'warning';
      default: return 'outline';
    }
  };

  const getPillarColor = (pillar) => {
    const pillarObj = alignedPillars.find(p => p.name === pillar);
    return pillarObj ? pillarObj.color : 'bg-gray-100 text-gray-800';
  };

  // Filter quests by search query
  const filteredQuests = useMemo(() => {
    let filtered = plotTwistQuests;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title?.toLowerCase().includes(query) ||
        quest.description?.toLowerCase().includes(query) ||
        quest.character?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [plotTwistQuests, searchQuery]);

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
      if (!questForm.character) {
        toast.error('Character is required');
        return;
      }
      if (!questForm.day) {
        toast.error('Day is required');
        return;
      }
      if (!questForm.pillar) {
        toast.error('Pillar is required');
        return;
      }
      if (!questForm.tier) {
        toast.error('Tier is required');
        return;
      }

      // Get character UUID from character name
      const characterId = characterMap[questForm.character];
      if (!characterId) {
        toast.error('Invalid character selected');
        return;
      }

      // Convert day to number
      const dayNumber = parseInt(questForm.day, 10);
      if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 7) {
        toast.error('Day must be a number between 1 and 7');
        return;
      }

      // Transform responseOptions to API format
      const responseOptionsArray = Array.isArray(questForm.responseOptions) ? questForm.responseOptions : [];
      const validResponseOptions = responseOptionsArray.filter(opt => opt && opt.emoji && opt.text);
      
      // Map responseOptions to responses array (PlotTwistResponseInput)
      // API requires responses to be an array (can be empty)
      const responses = validResponseOptions.map((opt, index) => ({
        tier: questForm.tier,
        characterId: characterId,
        engagementLevel: (opt.level || 'High').toLowerCase(), // Convert "High" to "high"
        responseEmoji: opt.emoji,
        responseText: opt.text,
        responseDescription: opt.text, // Use text as description if not provided
        displayOrder: index + 1
      }));

      // Create options array (PlotTwistOptionInput) - using response text as option text
      // API requires options to be an array (can be empty)
      const options = validResponseOptions.map((opt, index) => ({
        optionText: opt.text,
        displayOrder: index + 1,
        tier: questForm.tier,
        characterId: characterId,
        engagementLevel: (opt.level || 'High').toLowerCase()
      }));

      const payload = {
        characterId: characterId,
        tier: questForm.tier,
        title: questForm.title.trim(),
        description: questForm.description.trim(),
        dayNumber: dayNumber,
        options: options,
        responses: responses
      };

      await createQuest(payload, { showSuccessToast: true });
      
      // Reset form
      setQuestForm({
        character: '',
        day: '',
        pillar: '',
        title: '',
        description: '',
        tier: '',
        responseOptions: [
          { emoji: '', text: '', level: 'High' },
          { emoji: '', text: '', level: 'Medium' },
          { emoji: '', text: '', level: 'Low' }
        ]
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating quest:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete quest
  const handleDeleteQuest = async (questId) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      try {
        await deleteQuest(questId, { showSuccessToast: true });
        if (selectedQuest?.id === questId) {
          setSelectedQuest(null);
        }
      } catch (error) {
        console.error('Error deleting quest:', error);
      }
    }
  };

  // Handle edit quest
  const handleEditQuest = (quest) => {
    setSelectedQuest(quest);
    
    // Try to get character name from characterId, fallback to character name if available
    let characterValue = '';
    if (quest.characterId) {
      // Find character by ID
      const char = characters.find(c => c.id === quest.characterId);
      characterValue = char?.name || quest.characterId;
    } else if (quest.character) {
      characterValue = quest.character;
    }

    // Transform responses/options back to responseOptions format if available
    let responseOptions = [
      { emoji: '', text: '', level: 'High' },
      { emoji: '', text: '', level: 'Medium' },
      { emoji: '', text: '', level: 'Low' }
    ];
    
    // If quest has responses, use them
    if (quest.responses && Array.isArray(quest.responses) && quest.responses.length > 0) {
      responseOptions = quest.responses.map((resp, index) => ({
        emoji: resp.responseEmoji || '',
        text: resp.responseText || '',
        level: resp.engagementLevel ? resp.engagementLevel.charAt(0).toUpperCase() + resp.engagementLevel.slice(1) : 'High'
      }));
    } else if (quest.responseOptions && Array.isArray(quest.responseOptions)) {
      responseOptions = quest.responseOptions;
    }

    setQuestForm({
      character: characterValue,
      day: quest.dayNumber?.toString() || quest.day?.toString() || '',
      pillar: quest.pillar || '',
      title: quest.title || '',
      description: quest.description || '',
      tier: quest.tier || '',
      responseOptions: responseOptions
    });
    setIsEditModalOpen(true);
  };

  // Handle update quest
  const handleUpdateQuest = async () => {
    if (submitting || !selectedQuest) return;

    try {
      setSubmitting(true);

      // Get character UUID from character name
      const characterId = characterMap[questForm.character];
      if (!characterId) {
        toast.error('Invalid character selected');
        return;
      }

      // Convert day to number
      const dayNumber = parseInt(questForm.day, 10);
      if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 7) {
        toast.error('Day must be a number between 1 and 7');
        return;
      }

      // Transform responseOptions to API format
      const responseOptionsArray = Array.isArray(questForm.responseOptions) ? questForm.responseOptions : [];
      const validResponseOptions = responseOptionsArray.filter(opt => opt && opt.emoji && opt.text);
      
      // Map responseOptions to responses array (PlotTwistResponseInput)
      // API requires responses to be an array (can be empty)
      const responses = validResponseOptions.map((opt, index) => ({
        tier: questForm.tier,
        characterId: characterId,
        engagementLevel: (opt.level || 'High').toLowerCase(), // Convert "High" to "high"
        responseEmoji: opt.emoji,
        responseText: opt.text,
        responseDescription: opt.text, // Use text as description if not provided
        displayOrder: index + 1
      }));

      // Create options array (PlotTwistOptionInput) - using response text as option text
      // API requires options to be an array (can be empty)
      const options = validResponseOptions.map((opt, index) => ({
        optionText: opt.text,
        displayOrder: index + 1,
        tier: questForm.tier,
        characterId: characterId,
        engagementLevel: (opt.level || 'High').toLowerCase()
      }));

      const payload = {
        characterId: characterId,
        tier: questForm.tier,
        title: questForm.title.trim(),
        description: questForm.description.trim(),
        dayNumber: dayNumber,
        options: options,
        responses: responses
      };

      await updateQuest({ id: selectedQuest.id, data: payload }, { showSuccessToast: true });
      
      setIsEditModalOpen(false);
      setSelectedQuest(null);
      setQuestForm({
        character: '',
        day: '',
        pillar: '',
        title: '',
        description: '',
        tier: '',
        responseOptions: [
          { emoji: '', text: '', level: 'High' },
          { emoji: '', text: '', level: 'Medium' },
          { emoji: '', text: '', level: 'Low' }
        ]
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quests">Quest Management</TabsTrigger>
            <TabsTrigger value="characters">Character Arcs</TabsTrigger>
            <TabsTrigger value="responses">Response Library</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Quest Management */}
          <TabsContent value="quests" className="space-y-4">
            <div className="flex items-center justify-between">
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
              <CardHeader>
                <CardTitle>Plot Twist Quests</CardTitle>
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
                      <TableHead>Quest Title</TableHead>
                      <TableHead>Pillar</TableHead>
                      <TableHead>Tier</TableHead>
                        <TableHead>Response Options</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredQuests.length > 0 ? filteredQuests.map((quest) => (
                      <TableRow key={quest.id}>
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
                            <p className="text-xs text-muted-foreground truncate">
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
                            <div className="text-sm">
                              {quest.responseOptions?.length || 0} options
                          </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusColor(quest.status || 'Active')}>
                              {quest.status || 'Active'}
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
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="character">Character *</Label>
                  <Select
                    value={questForm.character}
                    onValueChange={(value) => setQuestForm({ ...questForm, character: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {charactersLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        characters.map((character) => (
                          <SelectItem key={character.id || character.name} value={character.name || character.id}>
                            {character.icon || '👤'} {character.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day">Day *</Label>
                  <Select
                    value={questForm.day}
                    onValueChange={(value) => setQuestForm({ ...questForm, day: value })}
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
                
                <div className="space-y-2">
                  <Label htmlFor="pillar">Aligned Pillar *</Label>
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
                <Label htmlFor="title">Quest Title *</Label>
                <Input
                  placeholder="Brief, actionable description of the daily challenge"
                  value={questForm.title}
                  onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Quest Description *</Label>
                <Textarea
                  placeholder="Detailed explanation of the quest purpose and instructions"
                  rows={4}
                  value={questForm.description}
                  onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Response Options (Optional)</Label>
                {questForm.responseOptions.map((option, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-xs">Emoji</Label>
                      <Input
                        placeholder="😊"
                        className="text-center"
                        value={option.emoji}
                        onChange={(e) => {
                          const updated = [...questForm.responseOptions];
                          updated[index] = { ...updated[index], emoji: e.target.value };
                          setQuestForm({ ...questForm, responseOptions: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Response Text</Label>
                      <Input
                        placeholder="Response option text"
                        value={option.text}
                        onChange={(e) => {
                          const updated = [...questForm.responseOptions];
                          updated[index] = { ...updated[index], text: e.target.value };
                          setQuestForm({ ...questForm, responseOptions: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Engagement Level</Label>
                      <Select
                        value={option.level}
                        onValueChange={(value) => {
                          const updated = [...questForm.responseOptions];
                          updated[index] = { ...updated[index], level: value };
                          setQuestForm({ ...questForm, responseOptions: updated });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  disabled={submitting || !questForm.title || !questForm.description || !questForm.character || !questForm.day || !questForm.pillar || !questForm.tier}
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
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="character">Character *</Label>
                  <Select
                    value={questForm.character}
                    onValueChange={(value) => setQuestForm({ ...questForm, character: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map((character) => (
                        <SelectItem key={character.id || character.name} value={character.name || character.id}>
                          {character.icon || '👤'} {character.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day">Day *</Label>
                  <Select
                    value={questForm.day}
                    onValueChange={(value) => setQuestForm({ ...questForm, day: value })}
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
                
                <div className="space-y-2">
                  <Label htmlFor="pillar">Aligned Pillar *</Label>
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
                <Label htmlFor="title">Quest Title *</Label>
                <Input
                  placeholder="Brief, actionable description of the daily challenge"
                  value={questForm.title}
                  onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Quest Description *</Label>
                <Textarea 
                  placeholder="Detailed explanation of the quest purpose and instructions"
                  rows={4}
                  value={questForm.description}
                  onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Response Options (Optional)</Label>
                {questForm.responseOptions.map((option, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-xs">Emoji</Label>
                      <Input
                        placeholder="😊"
                        className="text-center"
                        value={option.emoji || ''}
                        onChange={(e) => {
                          const updated = [...questForm.responseOptions];
                          updated[index] = { ...updated[index], emoji: e.target.value };
                          setQuestForm({ ...questForm, responseOptions: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Response Text</Label>
                      <Input
                        placeholder="Response option text"
                        value={option.text || ''}
                        onChange={(e) => {
                          const updated = [...questForm.responseOptions];
                          updated[index] = { ...updated[index], text: e.target.value };
                          setQuestForm({ ...questForm, responseOptions: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Engagement Level</Label>
                      <Select
                        value={option.level || 'High'}
                        onValueChange={(value) => {
                          const updated = [...questForm.responseOptions];
                          updated[index] = { ...updated[index], level: value };
                          setQuestForm({ ...questForm, responseOptions: updated });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  disabled={submitting || !questForm.title || !questForm.description || !questForm.character || !questForm.day || !questForm.pillar || !questForm.tier}
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
              
              <div className="space-y-6">
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
                        <Badge variant={getStatusColor(selectedQuest.status || 'Active')} className="ml-2">
                          {selectedQuest.status || 'Active'}
                        </Badge>
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
                    <div>
                      <h4 className="font-medium mb-2">Title:</h4>
                      <p className="text-sm">{selectedQuest.title || 'No title'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Description:</h4>
                      <p className="text-sm text-muted-foreground">{selectedQuest.description || 'No description'}</p>
                    </div>
                    
                    {selectedQuest.responseOptions && selectedQuest.responseOptions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Response Options:</h4>
                      <div className="space-y-2">
                        {selectedQuest.responseOptions.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                              {option.emoji && <span className="text-xl">{option.emoji}</span>}
                              <span className="flex-1 text-sm">{option.text || 'No text'}</span>
                              {option.level && (
                            <Badge variant="outline" className="text-xs">
                              {option.level}
                            </Badge>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
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