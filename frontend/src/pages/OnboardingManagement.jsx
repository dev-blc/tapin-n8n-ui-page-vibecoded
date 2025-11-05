import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  MessageSquare,
  Search,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Users,
  Target,
  Heart,
  Send,
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
import axios from 'axios';

export const OnboardingManagement = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSendAffirmationOpen, setIsSendAffirmationOpen] = useState(false);

  // Mock onboarding questions data
  const onboardingQuestions = [
    {
      id: 'OB-001',
      question: 'When you feel overwhelmed, what do you typically do first?',
      type: 'Multiple Choice',
      options: [
        'Take deep breaths and try to calm down',
        'Make a list to organize my thoughts', 
        'Talk to someone I trust',
        'Take a break or step away from the situation'
      ],
      tierAssignments: {
        'Take deep breaths and try to calm down': 'User 1',
        'Make a list to organize my thoughts': 'User 2',
        'Talk to someone I trust': 'User 1',
        'Take a break or step away from the situation': 'User 3'
      },
      characterAssignments: {
        'Take deep breaths and try to calm down': 'The Grounded One',
        'Make a list to organize my thoughts': 'The Capable One',
        'Talk to someone I trust': 'The Deserving One',
        'Take a break or step away from the situation': 'The Intuitive One'
      },
      usageCount: 1247,
      status: 'Active',
      lastModified: '2024-03-10'
    },
    {
      id: 'OB-002',
      question: 'How do you prefer to receive support when going through challenges?',
      type: 'Multiple Choice',
      options: [
        'Gentle encouragement and validation',
        'Practical advice and action steps',
        'Space to figure it out on my own',
        'Reminders of my strengths and capabilities'
      ],
      tierAssignments: {
        'Gentle encouragement and validation': 'User 1',
        'Practical advice and action steps': 'User 2',
        'Space to figure it out on my own': 'User 3',
        'Reminders of my strengths and capabilities': 'User 2'
      },
      characterAssignments: {
        'Gentle encouragement and validation': 'The Deserving One',
        'Practical advice and action steps': 'The Capable One',
        'Space to figure it out on my own': 'The Intuitive One',
        'Reminders of my strengths and capabilities': 'The Magnetic One'
      },
      usageCount: 1156,
      status: 'Active',
      lastModified: '2024-03-08'
    },
    {
      id: 'OB-003',
      question: 'What time of day do you feel most like yourself?',
      type: 'Multiple Choice',
      options: [
        'Early morning when everything is quiet',
        'Afternoon when I have momentum',
        'Evening when I can wind down',
        'Late night when I can reflect'
      ],
      tierAssignments: {
        'Early morning when everything is quiet': 'User 1',
        'Afternoon when I have momentum': 'User 2',
        'Evening when I can wind down': 'User 1',
        'Late night when I can reflect': 'User 3'
      },
      characterAssignments: {
        'Early morning when everything is quiet': 'The Grounded One',
        'Afternoon when I have momentum': 'The Capable One',
        'Evening when I can wind down': 'The Deserving One',
        'Late night when I can reflect': 'The Intuitive One'
      },
      usageCount: 987,
      status: 'Active',
      lastModified: '2024-03-12'
    },
    {
      id: 'OB-004',
      question: 'When setting goals, what motivates you most?',
      type: 'Multiple Choice',
      options: [
        'The feeling of accomplishment',
        'Making a positive impact on others',
        'Personal growth and learning',
        'Creating something meaningful'
      ],
      tierAssignments: {
        'The feeling of accomplishment': 'User 2',
        'Making a positive impact on others': 'User 1',
        'Personal growth and learning': 'User 3',
        'Creating something meaningful': 'User 2'
      },
      characterAssignments: {
        'The feeling of accomplishment': 'The Capable One',
        'Making a positive impact on others': 'The Deserving One',
        'Personal growth and learning': 'The Intuitive One',
        'Creating something meaningful': 'The Magnetic One'
      },
      usageCount: 856,
      status: 'Draft',
      lastModified: '2024-03-05'
    }
  ];

  // Mock user segments for affirmation sending
  const userSegments = [
    { name: 'New Users (Last 7 days)', count: 45, description: 'Recently joined users' },
    { name: 'Tier 1 Users', count: 234, description: 'Beginning their journey' },
    { name: 'Inactive Users (30+ days)', count: 67, description: 'Haven\'t engaged recently' },
    { name: 'High Engagement Users', count: 156, description: 'Very active users' }
  ];

  const characterTypes = [
    'The Deserving One', 'The Capable One', 'The Magnetic One', 'The Grounded One',
    'The Expressed One', 'The Soft One', 'The Intuitive One', 'The Liberated One',
    'The Powerful One', 'The Surrendered One'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'secondary';
      case 'Review': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <Layout
      title="Onboarding Question Management"
      subtitle="Manage assessment questions to assign user tiers and character personas"
      headerActions={
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSendAffirmationOpen(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Affirmation
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">Assessment Questions</TabsTrigger>
            <TabsTrigger value="assignments">Tier & Character Logic</TabsTrigger>
            <TabsTrigger value="affirmations">Positive Affirmations</TabsTrigger>
            <TabsTrigger value="analytics">Onboarding Analytics</TabsTrigger>
          </TabsList>

          {/* Assessment Questions */}
          <TabsContent value="questions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-10 w-80"
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Onboarding Assessment Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Response Options</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardingQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="font-medium text-sm">{question.question}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {question.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {question.options.length} options
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{question.usageCount}</div>
                            <div className="text-muted-foreground">responses</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(question.status)}>
                            {question.status}
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
                              <DropdownMenuItem onClick={() => setSelectedQuestion(question)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Question
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

          {/* Tier & Character Logic */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Tier Assignment Rules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold text-sm">User 1 (Beginner)</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        New to emotional awareness, needs gentle guidance and validation
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">67% of new users</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold text-sm">User 2 (Developing)</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Some self-awareness, ready for structured approaches and tools
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">25% of new users</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold text-sm">User 3 (Advanced)</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        High self-awareness, can handle complex concepts and independence
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">8% of new users</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Character Archetypes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {characterTypes.map((character) => (
                      <div key={character} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{character}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(Math.random() * 15) + 5}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Positive Affirmations */}
          <TabsContent value="affirmations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userSegments.map((segment) => (
                <Card key={segment.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">{segment.count}</div>
                    <p className="text-sm text-muted-foreground">{segment.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Send Affirmation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Affirmation Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Weekly Encouragement</div>
                      <div className="text-sm text-muted-foreground">
                        Sent to Tier 1 users • 234 recipients
                      </div>
                    </div>
                    <Badge variant="success">Delivered</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Re-engagement Message</div>
                      <div className="text-sm text-muted-foreground">
                        Sent to inactive users • 67 recipients
                      </div>
                    </div>
                    <Badge variant="success">Delivered</Badge>
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
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">87%</div>
                  <p className="text-sm text-muted-foreground">Finish onboarding</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4.2m</div>
                  <p className="text-sm text-muted-foreground">To complete</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Common Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">User 1</div>
                  <p className="text-sm text-muted-foreground">67% assignment rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Character</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">The Deserving One</div>
                  <p className="text-sm text-muted-foreground">18% assignment rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Question Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Skip Rate</TableHead>
                      <TableHead>Avg Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardingQuestions.slice(0, 3).map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-md">
                          <p className="text-sm truncate">{question.question}</p>
                        </TableCell>
                        <TableCell>{question.usageCount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {Math.floor(Math.random() * 10) + 2}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(Math.random() * 2 + 1).toFixed(1)}m
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Question Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Onboarding Question</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question Text</Label>
                <Textarea 
                  placeholder="What question will help determine the user's tier and character?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Answer Options & Assignments</Label>
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Option {index}</Label>
                      <Input placeholder="Answer option text" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assigns Tier</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user1">User 1</SelectItem>
                          <SelectItem value="user2">User 2</SelectItem>
                          <SelectItem value="user3">User 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assigns Character</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select character" />
                        </SelectTrigger>
                        <SelectContent>
                          {characterTypes.slice(0, 4).map((character) => (
                            <SelectItem key={character} value={character.toLowerCase().replace(/\s+/g, '-')}>
                              {character}
                            </SelectItem>
                          ))}
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
                  Create Question
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Affirmation Modal */}
        <Dialog open={isSendAffirmationOpen} onOpenChange={setIsSendAffirmationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Positive Affirmation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="segment">Target Segment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {userSegments.map((segment) => (
                        <SelectItem key={segment.name} value={segment.name.toLowerCase().replace(/\s+/g, '-')}>
                          {segment.name} ({segment.count} users)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="character">Character Filter (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All characters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Characters</SelectItem>
                      {characterTypes.slice(0, 4).map((character) => (
                        <SelectItem key={character} value={character.toLowerCase().replace(/\s+/g, '-')}>
                          {character}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Affirmation Message</Label>
                <Textarea 
                  placeholder="Write your positive affirmation message..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="schedule" />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsSendAffirmationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsSendAffirmationOpen(false)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Affirmation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Detail Modal */}
        {selectedQuestion && (
          <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Question Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{selectedQuestion.question}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Answer Options & Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Option</TableHead>
                          <TableHead>Assigned Tier</TableHead>
                          <TableHead>Assigned Character</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuestion.options.map((option, index) => (
                          <TableRow key={index}>
                            <TableCell className="max-w-xs">
                              <p className="text-sm">{option}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {selectedQuestion.tierAssignments[option]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {selectedQuestion.characterAssignments[option]}
                              </Badge>
                            </TableCell>
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