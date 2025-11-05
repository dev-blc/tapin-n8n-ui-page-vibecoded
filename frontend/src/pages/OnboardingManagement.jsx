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
  const [onboardingQuestions, setOnboardingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Character mapping - name to ID
  const characterMap = {
    'The Deserving One': '1',
    'The Capable One': '2', 
    'The Magnetic One': '3',
    'The Grounded One': '4',
    'The Expressed One': '5',
    'The Soft One': '6',
    'The Intuitive One': '7',
    'The Liberated One': '8',
    'The Powerful One': '9',
    'The Surrendered One': '10'
  };

  // Form state for new question - Updated to match new API schema
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    displayOrder: 1,
    isActive: true,
    options: [
      { optionText: '', displayOrder: 1, assignsTier: '', characterName: '', assignsCharacterId: '' },
      { optionText: '', displayOrder: 2, assignsTier: '', characterName: '', assignsCharacterId: '' },
      { optionText: '', displayOrder: 3, assignsTier: '', characterName: '', assignsCharacterId: '' },
      { optionText: '', displayOrder: 4, assignsTier: '', characterName: '', assignsCharacterId: '' }
    ]
  });

  // API configuration - Updated to new admin service
  const API_BASE_URL = 'https://admin-service-production-9d00.up.railway.app';
  
  // Fetch onboarding questions from API
  useEffect(() => {
    fetchOnboardingQuestions();
  }, []);

  const fetchOnboardingQuestions = async () => {
    try {
      setLoading(true);
      // Use the correct API endpoint from the new admin service
      const response = await axios.get(`${API_BASE_URL}/admin/onboarding/questions`);
      setOnboardingQuestions(response.data || []);
      toast.success('Questions loaded successfully');
    } catch (error) {
      console.error('Error fetching onboarding questions:', error);
      console.error('Response:', error.response?.data);
      toast.error(`Failed to load onboarding questions: ${error.response?.status || error.message}`);
      
      // For demo purposes, show some example data if API fails
      if (error.response?.status === 404) {
        toast.info('Using demo data - API endpoint may need configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new onboarding question - Fixed with proper error handling
  const createQuestion = async () => {
    // Prevent multiple submissions
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      
      // VALIDATION PHASE - Check all requirements before making ANY API calls
      if (!newQuestion.text.trim()) {
        toast.error('Question text is required');
        return;
      }
      
      const validOptions = newQuestion.options.filter(opt => opt.optionText.trim());
      if (validOptions.length < 2) {
        toast.error('At least 2 options are required');
        return;
      }

      // Validate tier assignments
      const invalidTiers = validOptions.filter(opt => !opt.assignsTier);
      if (invalidTiers.length > 0) {
        toast.error('All options must have a tier assignment');
        return;
      }

      // STEP 1: Create the question (with rollback capability)
      const questionPayload = {
        text: newQuestion.text.trim(),
        displayOrder: Math.max(...onboardingQuestions.map(q => q.displayOrder), 0) + 1,
        isActive: newQuestion.isActive
      };

      let createdQuestionId = null;
      
      try {
        const questionResponse = await axios.post(`${API_BASE_URL}/admin/onboarding/questions`, questionPayload);
        createdQuestionId = questionResponse.data.id;
        
        if (!createdQuestionId) {
          throw new Error('Question created but no ID returned');
        }
      } catch (questionError) {
        console.error('Failed to create question:', questionError);
        throw new Error('Failed to create question: ' + (questionError.response?.data?.message || questionError.message));
      }
      
      // STEP 2: Create options (with rollback if any fail)
      try {
        const optionPromises = validOptions.map((option, index) => {
          const characterId = option.characterName ? characterMap[option.characterName] : '';
          
          return axios.post(`${API_BASE_URL}/admin/onboarding/options`, {
            questionId: createdQuestionId,
            optionText: option.optionText.trim(),
            assignsTier: option.assignsTier,
            assignsCharacterId: characterId,
            displayOrder: index + 1
          });
        });

        await Promise.all(optionPromises);
      } catch (optionError) {
        console.error('Failed to create options, attempting to rollback question:', optionError);
        
        // Try to rollback the created question
        try {
          await axios.delete(`${API_BASE_URL}/admin/onboarding/questions/${createdQuestionId}`);
          console.log('Successfully rolled back question');
        } catch (rollbackError) {
          console.error('Failed to rollback question:', rollbackError);
        }
        
        throw new Error('Failed to create options: ' + (optionError.response?.data?.message || optionError.message));
      }
      
      // STEP 3: Success - Update UI
      try {
        await fetchOnboardingQuestions();
        
        // Reset form and close modal
        setNewQuestion({
          text: '',
          displayOrder: 1,
          isActive: true,
          options: [
            { optionText: '', displayOrder: 1, assignsTier: '', characterName: '', assignsCharacterId: '' },
            { optionText: '', displayOrder: 2, assignsTier: '', characterName: '', assignsCharacterId: '' },
            { optionText: '', displayOrder: 3, assignsTier: '', characterName: '', assignsCharacterId: '' },
            { optionText: '', displayOrder: 4, assignsTier: '', characterName: '', assignsCharacterId: '' }
          ]
        });
        setIsCreateModalOpen(false);
        
        toast.success('Question and options created successfully');
      } catch (refreshError) {
        console.error('Failed to refresh questions:', refreshError);
        toast.warning('Question created but failed to refresh list. Please refresh manually.');
      }
      
    } catch (error) {
      console.error('Error in createQuestion:', error);
      toast.error(error.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete question - Updated for new API
  const deleteQuestion = async (questionId) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/onboarding/questions/${questionId}`);
      await fetchOnboardingQuestions();
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  // Handle option text change - Updated for new schema
  const updateOptionText = (optionIndex, field, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Add new option
  const addOption = () => {
    const newOptions = [...newQuestion.options, { 
      optionText: '', 
      displayOrder: newQuestion.options.length + 1,
      assignsTier: '',
      characterName: '',
      assignsCharacterId: ''
    }];
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  // Remove option
  const removeOption = (optionIndex) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = newQuestion.options.filter((_, index) => index !== optionIndex);
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    }
  };

  // Mock data for other sections (keeping existing mock data for other features)
  const mockOnboardingQuestions = [
    {
      id: 'OB-001',
      text: 'When you feel overwhelmed, what do you typically do first?',
      type: 'Multiple Choice',
      options: [
        { text: 'Take deep breaths and try to calm down', displayOrder: 1 },
        { text: 'Make a list to organize my thoughts', displayOrder: 2 }, 
        { text: 'Talk to someone I trust', displayOrder: 3 },
        { text: 'Take a break or step away from the situation', displayOrder: 4 }
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
            onClick={fetchOnboardingQuestions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading questions...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Display Order</TableHead>
                        <TableHead>Response Options</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {onboardingQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="font-medium text-sm">{question.text}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {question.id?.substring(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">#{question.displayOrder}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {question.options?.length || 0} options
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              From API
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">Active</Badge>
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
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this question?')) {
                                      deleteQuestion(question.id);
                                    }
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Question
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                  <CardTitle className="text-lg">Total Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{onboardingQuestions.length}</div>
                  <p className="text-sm text-muted-foreground">Active questions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {onboardingQuestions.reduce((total, q) => total + (q.options?.length || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Answer choices</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg Options per Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {onboardingQuestions.length > 0 
                      ? (onboardingQuestions.reduce((total, q) => total + (q.options?.length || 0), 0) / onboardingQuestions.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Options per question</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">Live Data</div>
                  <p className="text-sm text-muted-foreground">From API source</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Question Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading analytics...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Display Order</TableHead>
                        <TableHead>Options Count</TableHead>
                        <TableHead>Question ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {onboardingQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="max-w-md">
                            <p className="text-sm truncate">{question.text}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">#{question.displayOrder}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {question.options?.length || 0} options
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">
                              {question.id?.substring(0, 8)}...
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                <Label htmlFor="question">Question Text *</Label>
                <Textarea 
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="What question will help determine the user's tier and character?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Answer Options * (minimum 2 required)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={newQuestion.options.length >= 8}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Option {index + 1} *</Label>
                      <Input 
                        value={option.optionText}
                        onChange={(e) => updateOptionText(index, 'optionText', e.target.value)}
                        placeholder="Enter answer option"
                        className={!option.optionText.trim() && newQuestion.options.filter(opt => opt.optionText.trim()).length < 2 ? 'border-destructive' : ''}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assigns Tier *</Label>
                      <Select value={option.assignsTier} onValueChange={(value) => updateOptionText(index, 'assignsTier', value)}>
                        <SelectTrigger className={!option.assignsTier ? 'border-destructive' : ''}>
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
                    <div className="space-y-1">
                      <Label className="text-xs">Character (Optional)</Label>
                      <Select 
                        value={option.characterName || "none"} 
                        onValueChange={(value) => {
                          const characterName = value === "none" ? "" : value;
                          updateOptionText(index, 'characterName', characterName);
                          updateOptionText(index, 'assignsCharacterId', characterName ? characterMap[characterName] : '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select character" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {Object.keys(characterMap).map((characterName) => (
                            <SelectItem key={characterName} value={characterName}>
                              {characterName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      {newQuestion.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This will create a new question with associated options. 
                  The display order will be automatically set to appear after existing questions.
                  Each option <strong>must</strong> have a tier assignment. Character assignment is optional.
                  If creation fails, any partial changes will be automatically rolled back.
                </p>
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
                  onClick={createQuestion}
                  disabled={
                    submitting || 
                    !newQuestion.text.trim() || 
                    newQuestion.options.filter(opt => opt.optionText.trim()).length < 2 ||
                    newQuestion.options.filter(opt => opt.optionText.trim() && !opt.assignsTier).length > 0
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Question'
                  )}
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
                    <CardTitle className="text-lg">Question Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Question Text:</Label>
                      <p className="text-lg mt-1">{selectedQuestion.text}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Question ID:</Label>
                        <p className="text-muted-foreground font-mono">{selectedQuestion.id}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Display Order:</Label>
                        <p className="text-muted-foreground">#{selectedQuestion.displayOrder}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Answer Options ({selectedQuestion.options?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedQuestion.options?.map((option, index) => (
                        <div key={option.id || index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                #{option.displayOrder}
                              </Badge>
                              <p className="text-sm font-medium">{option.optionText || option.text}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Tier:</Label>
                            <p className="text-sm">{option.assignsTier || 'Not assigned'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Character:</Label>
                            <p className="text-sm">
                              {option.assignsCharacterId ? 
                                (Object.keys(characterMap).find(name => characterMap[name] === option.assignsCharacterId) || `ID: ${option.assignsCharacterId}`) : 
                                'Not assigned'
                              }
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {option.id?.substring(0, 8)}...
                          </div>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-sm">No options available</p>
                      )}
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