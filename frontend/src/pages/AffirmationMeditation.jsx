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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Copy,
  MoreHorizontal,
  Sparkles,
  Wind,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AffirmationMeditation = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('affirmations');

  // Mock data for affirmation templates
  const affirmationTemplates = [
    {
      id: 'AF-001',
      name: 'Empowering Strength Template',
      energyType: 'Empowering',
      imageryTheme: 'Inner Strength',
      openingPhrase: 'I am',
      sampleOutput: 'I am rooted in my inner strength, trusting my resilience to guide me through any challenge with grace and confidence.',
      usageCount: 156,
      status: 'Active',
      lastModified: '2024-03-10'
    },
    {
      id: 'AF-002',
      name: 'Calming Nature Template',
      energyType: 'Calming',
      imageryTheme: 'Nature',
      openingPhrase: 'I embrace',
      sampleOutput: 'I embrace the peaceful flow of nature within me, allowing calm to wash over me like gentle waves on a quiet shore.',
      usageCount: 234,
      status: 'Active',
      lastModified: '2024-03-08'
    },
    {
      id: 'AF-003',
      name: 'Grounding Light Template',
      energyType: 'Grounding',
      imageryTheme: 'Light',
      openingPhrase: 'I choose',
      sampleOutput: 'I choose to stay grounded in my truth, letting my inner light illuminate the path forward with clarity and purpose.',
      usageCount: 189,
      status: 'Active',
      lastModified: '2024-03-12'
    }
  ];

  // Mock data for meditation templates
  const meditationTemplates = [
    {
      id: 'MD-001',
      name: 'Calm Forest Meditation',
      feeling: 'Calm',
      setting: 'Forest Clearing',
      elements: ['Breathing', 'Visualization'],
      duration: '5 minutes',
      sampleScript: 'Let this be a moment where you find yourself in a serene forest clearing...',
      usageCount: 98,
      status: 'Active',
      lastModified: '2024-03-09'
    },
    {
      id: 'MD-002',
      name: 'Grounding Beach Meditation',
      feeling: 'Grounded',
      setting: 'Beach Shore',
      elements: ['Body Scan', 'Presence'],
      duration: '4 minutes',
      sampleScript: 'Notice how the gentle rhythm of the waves mirrors your breath...',
      usageCount: 145,
      status: 'Active',
      lastModified: '2024-03-11'
    },
    {
      id: 'MD-003',
      name: 'Energizing Mountain Meditation',
      feeling: 'Energized',
      setting: 'Mountain Top',
      elements: ['Affirmation', 'Visualization'],
      duration: '3 minutes',
      sampleScript: 'Feel the expansive energy of the mountain peak filling your entire being...',
      usageCount: 78,
      status: 'Draft',
      lastModified: '2024-03-06'
    }
  ];

  const energyTypes = [
    { name: 'Empowering', description: 'builds inner strength and confidence', color: 'bg-red-100 text-red-800' },
    { name: 'Calming', description: 'soothes anxiety and creates peace', color: 'bg-blue-100 text-blue-800' },
    { name: 'Grounding', description: 'connects to stability and presence', color: 'bg-green-100 text-green-800' },
    { name: 'Uplifting', description: 'elevates mood and spirit', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Healing', description: 'nurtures recovery and wellness', color: 'bg-purple-100 text-purple-800' }
  ];

  const imageryThemes = [
    'Inner Strength', 'Nature', 'Light', 'Water', 'Growth'
  ];

  const meditationSettings = [
    'Forest Clearing', 'Beach Shore', 'Mountain Top', 'Flowing River', 'Garden Sanctuary'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'secondary';
      case 'Review': return 'warning';
      default: return 'outline';
    }
  };

  const getEnergyColor = (energyType) => {
    const energy = energyTypes.find(e => e.name === energyType);
    return energy ? energy.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout
      title="Affirmation & Meditation Templates"
      subtitle="Manage AI generation templates for personalized tools"
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
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
            Add Template
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="affirmations">Affirmation Templates</TabsTrigger>
            <TabsTrigger value="meditations">Meditation Templates</TabsTrigger>
            <TabsTrigger value="analytics">Generation Analytics</TabsTrigger>
          </TabsList>

          {/* Affirmation Templates */}
          <TabsContent value="affirmations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search affirmation templates..."
                    className="pl-10 w-80"
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Energy Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {energyTypes.map((energy) => (
                      <SelectItem key={energy.name} value={energy.name.toLowerCase()}>
                        {energy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Affirmation Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Energy & Imagery</TableHead>
                      <TableHead>Opening Phrase</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affirmationTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {template.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getEnergyColor(template.energyType)}>
                              {template.energyType}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {template.imageryTheme}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            "{template.openingPhrase}"
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{template.usageCount}</div>
                            <div className="text-muted-foreground">generations</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(template.status)}>
                            {template.status}
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
                              <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Template
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

          {/* Meditation Templates */}
          <TabsContent value="meditations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search meditation templates..."
                    className="pl-10 w-80"
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Setting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Settings</SelectItem>
                    {meditationSettings.map((setting) => (
                      <SelectItem key={setting} value={setting.toLowerCase().replace(' ', '-')}>
                        {setting}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wind className="h-5 w-5" />
                  <span>Meditation Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Feeling & Setting</TableHead>
                      <TableHead>Elements</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meditationTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {template.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary">
                              {template.feeling}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {template.setting}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.elements.map((element) => (
                              <Badge key={element} variant="outline" className="text-xs">
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {template.duration}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{template.usageCount}</div>
                            <div className="text-muted-foreground">generations</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(template.status)}>
                            {template.status}
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
                              <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Template
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

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Generations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2,847</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">94%</div>
                  <p className="text-sm text-muted-foreground">Quality threshold met</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Popular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">Calming Nature</div>
                  <p className="text-sm text-muted-foreground">Affirmation template</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {energyTypes.map((energy) => (
                      <div key={energy.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={energy.color}>
                            {energy.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {energy.description}
                          </span>
                        </div>
                        <span className="font-medium">
                          {Math.floor(Math.random() * 30) + 10}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generation Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Length Guidelines Met</span>
                        <span>96%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div className="bg-success h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Tone Consistency</span>
                        <span>91%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>User Satisfaction</span>
                        <span>88%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Template Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Create New {activeTab === 'affirmations' ? 'Affirmation' : 'Meditation'} Template
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input placeholder="e.g., Empowering Strength Template" />
                </div>
                
                {activeTab === 'affirmations' ? (
                  <div className="space-y-2">
                    <Label htmlFor="energy">Energy Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {energyTypes.map((energy) => (
                          <SelectItem key={energy.name} value={energy.name.toLowerCase()}>
                            {energy.name} - {energy.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="feeling">Feeling to Cultivate</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feeling" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="grounded">Grounded</SelectItem>
                        <SelectItem value="energized">Energized</SelectItem>
                        <SelectItem value="peaceful">Peaceful</SelectItem>
                        <SelectItem value="focused">Focused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {activeTab === 'affirmations' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imagery">Imagery Theme</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select imagery" />
                        </SelectTrigger>
                        <SelectContent>
                          {imageryThemes.map((theme) => (
                            <SelectItem key={theme} value={theme.toLowerCase().replace(' ', '-')}>
                              {theme}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="opening">Opening Phrase</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select opening" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="i-am">I am</SelectItem>
                          <SelectItem value="i-embrace">I embrace</SelectItem>
                          <SelectItem value="i-trust">I trust</SelectItem>
                          <SelectItem value="i-choose">I choose</SelectItem>
                          <SelectItem value="i-create">I create</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="structure">Template Structure</Label>
                    <Textarea 
                      placeholder="Define the affirmation structure with variables and guidelines..."
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="setting">Meditation Setting</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select setting" />
                        </SelectTrigger>
                        <SelectContent>
                          {meditationSettings.map((setting) => (
                            <SelectItem key={setting} value={setting.toLowerCase().replace(' ', '-')}>
                              {setting}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Target Duration</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 minutes</SelectItem>
                          <SelectItem value="4">4 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="script">Script Template</Label>
                    <Textarea 
                      placeholder="Define the meditation script structure with pacing and variables..."
                      rows={6}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="sample">Sample Output</Label>
                <Textarea 
                  placeholder="Provide an example of what this template would generate..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateModalOpen(false)}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedTemplate.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Template Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Type:</span>
                        <span className="ml-2">{selectedTemplate.energyType || selectedTemplate.feeling}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Theme/Setting:</span>
                        <span className="ml-2">{selectedTemplate.imageryTheme || selectedTemplate.setting}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Usage:</span>
                        <span className="ml-2 font-semibold">{selectedTemplate.usageCount} generations</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sample Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm italic">{selectedTemplate.sampleOutput || selectedTemplate.sampleScript}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};