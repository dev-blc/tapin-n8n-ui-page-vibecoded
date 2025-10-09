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
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const PlotTwists = () => {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('all');

  // Mock data for Plot Twist characters and their quests
  const characters = [
    {
      name: 'The Deserving One',
      icon: '👑',
      description: 'Focuses on self-worth and claiming what\'s theirs',
      color: 'bg-amber-100 text-amber-800'
    },
    {
      name: 'The Capable One',
      icon: '💪',
      description: 'Emphasizes self-belief and taking action despite doubt',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'The Magnetic One',
      icon: '✨',
      description: 'Centers on attracting desires by embodying true self',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'The Grounded One',
      icon: '🌱',
      description: 'Promotes presence, calm, and intentional being',
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'The Intuitive One',
      icon: '🔮',
      description: 'Centers on trusting inner guidance and gut feelings',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const plotTwistQuests = [
    {
      id: 'PT-001',
      character: 'The Deserving One',
      tier: 'User 2',
      day: 1,
      title: 'Notice when you automatically say "sorry" for taking up space',
      description: 'Today, catch yourself apologizing for existing. Every time you say "sorry" for something that doesn\'t need an apology, pause. This is your first step toward claiming your space.',
      pillar: 'Awareness',
      responseOptions: [
        { emoji: '😊', text: 'I caught myself multiple times and paused', level: 'High' },
        { emoji: '🤔', text: 'I noticed it happening a few times', level: 'Medium' },
        { emoji: '😅', text: 'I\'m still learning to catch it', level: 'Low' }
      ],
      usageCount: 234,
      completionRate: 89,
      lastModified: '2024-03-10',
      status: 'Active'
    },
    {
      id: 'PT-002',
      character: 'The Capable One',
      tier: 'User 1',
      day: 3,
      title: 'Take one action you\'ve been avoiding because it feels "too big"',
      description: 'Pick something you\'ve been putting off because it seems overwhelming. Break it into the smallest possible first step and do just that one thing.',
      pillar: 'Intention',
      responseOptions: [
        { emoji: '🎉', text: 'I did it and it felt amazing!', level: 'High' },
        { emoji: '👍', text: 'I took a small step forward', level: 'Medium' },
        { emoji: '🤯', text: 'I realized how much I\'ve been avoiding', level: 'Low' }
      ],
      usageCount: 187,
      completionRate: 76,
      lastModified: '2024-03-08',
      status: 'Active'
    },
    {
      id: 'PT-003',
      character: 'The Grounded One',
      tier: 'User 3',
      day: 5,
      title: 'Choose calm over chaos when everyone else is rushing',
      description: 'When you\'re surrounded by urgency and everyone is moving fast, intentionally slow down. Move at your own pace and notice how it affects your energy.',
      pillar: 'Nowness',
      responseOptions: [
        { emoji: '🧘', text: 'I stayed centered despite the chaos', level: 'High' },
        { emoji: '🌊', text: 'I found moments to slow down', level: 'Medium' },
        { emoji: '🌀', text: 'I got caught up but became aware of it', level: 'Low' }
      ],
      usageCount: 156,
      completionRate: 92,
      lastModified: '2024-03-12',
      status: 'Active'
    }
  ];

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

  const filteredQuests = selectedCharacter === 'all' 
    ? plotTwistQuests 
    : plotTwistQuests.filter(quest => quest.character === selectedCharacter);

  return (
    <Layout
      title="Plot Twist Content Management"
      subtitle="Manage daily challenges and character-based quest content"
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
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
                  />
                </div>
                
                <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Character" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Characters</SelectItem>
                    {characters.map((character) => (
                      <SelectItem key={character.name} value={character.name}>
                        {character.icon} {character.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="user1">User 1</SelectItem>
                    <SelectItem value="user2">User 2</SelectItem>
                    <SelectItem value="user3">User 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plot Twist Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Character & Day</TableHead>
                      <TableHead>Quest Title</TableHead>
                      <TableHead>Pillar</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuests.map((quest) => (
                      <TableRow key={quest.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{quest.character}</div>
                            <Badge variant="outline" className="text-xs">
                              Day {quest.day}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="font-medium text-sm truncate">{quest.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {quest.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPillarColor(quest.pillar)}>
                            {quest.pillar}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{quest.tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {quest.usageCount} completions
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{quest.completionRate}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(quest.status)}>
                            {quest.status}
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Quest
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
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
          </TabsContent>

          {/* Character Arcs */}
          <TabsContent value="characters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <Card key={character.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl">{character.icon}</span>
                      <span className="text-lg">{character.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {character.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">7-Day Arc Progress:</div>
                      <div className="grid grid-cols-7 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <div
                            key={day}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                              day <= 5 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View Arc
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  <Label htmlFor="character">Character</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map((character) => (
                        <SelectItem key={character.name} value={character.name}>
                          {character.icon} {character.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select>
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
                  <Label htmlFor="pillar">Aligned Pillar</Label>
                  <Select>
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
                <Label htmlFor="title">Quest Title</Label>
                <Input placeholder="Brief, actionable description of the daily challenge" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Quest Description</Label>
                <Textarea 
                  placeholder="Detailed explanation of the quest purpose and instructions"
                  rows={4}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Response Options (3 required)</Label>
                {[1, 2, 3].map((index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-xs">Emoji</Label>
                      <Input placeholder="😊" className="text-center" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Response Text</Label>
                      <Input placeholder="Response option text" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Engagement Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateModalOpen(false)}>
                  Create Quest
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
                  {selectedQuest.character} - Day {selectedQuest.day}
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
                        <span className="ml-2">{selectedQuest.character}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Day:</span>
                        <span className="ml-2">{selectedQuest.day} of 7</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Aligned Pillar:</span>
                        <Badge className={getPillarColor(selectedQuest.pillar)} variant="outline">
                          {selectedQuest.pillar}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Tier:</span>
                        <Badge variant="secondary">{selectedQuest.tier}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Total Completions:</span>
                        <span className="ml-2 font-semibold">{selectedQuest.usageCount}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Completion Rate:</span>
                        <span className="ml-2 font-semibold">{selectedQuest.completionRate}%</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Last Modified:</span>
                        <span className="ml-2">{selectedQuest.lastModified}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={getStatusColor(selectedQuest.status)}>
                          {selectedQuest.status}
                        </Badge>
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
                      <p className="text-sm">{selectedQuest.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Description:</h4>
                      <p className="text-sm text-muted-foreground">{selectedQuest.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Response Options:</h4>
                      <div className="space-y-2">
                        {selectedQuest.responseOptions.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                            <span className="text-xl">{option.emoji}</span>
                            <span className="flex-1 text-sm">{option.text}</span>
                            <Badge variant="outline" className="text-xs">
                              {option.level}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
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