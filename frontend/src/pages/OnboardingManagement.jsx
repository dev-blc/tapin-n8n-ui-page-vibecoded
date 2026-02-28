import { Layout } from '@/components/layout/Layout';
import { TableSkeleton } from '@/components/loading/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useCharacterMapping, useOnboardingQuestions, useOptionMutation, useQuestionMutation } from '@/hooks/useOnboarding';
import {
  Edit,
  Eye,
  Heart,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Target,
  Trash2,
  Users
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

export const OnboardingManagement = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSendAffirmationOpen, setIsSendAffirmationOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Track created items for cleanup on cancel
  const [createdQuestionId, setCreatedQuestionId] = useState(null);
  const [createdOptionIds, setCreatedOptionIds] = useState([]);

  // Fetch data using hooks
  const { data: onboardingQuestionsData, loading, error, refetch } = useOnboardingQuestions({ showErrorToast: false });
  const { data: characterMappings = [], loading: characterMappingLoading } = useCharacterMapping({ showErrorToast: false });
  const { 
    createQuestion: createQuestionMutation, 
    updateQuestion: updateQuestionMutation,
    deleteQuestion: deleteQuestionMutation 
  } = useQuestionMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { 
    createOption: createOptionMutation, 
    updateOption: updateOptionMutation,
    deleteOption: deleteOptionMutation 
  } = useOptionMutation();

  // Ensure onboardingQuestions is always an array
  const onboardingQuestions = Array.isArray(onboardingQuestionsData) ? onboardingQuestionsData : [];

  // Build character map from API data - handle null/undefined safely
  const characterMap = React.useMemo(() => {
    if (!characterMappings || !Array.isArray(characterMappings)) {
      return {};
    }
    return characterMappings.reduce((acc, char) => {
      if (char && char.name && char.id) {
        acc[char.name] = char.id;
      }
      return acc;
    }, {});
  }, [characterMappings]);

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

  // Form state for editing question
  const [editQuestion, setEditQuestion] = useState({
    text: '',
    displayOrder: 1,
    isActive: true,
    options: []
  });

  // Create new onboarding question - Using service layer
  const createQuestion = async () => {
    // Prevent multiple submissions
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      // Reset tracking state
      setCreatedQuestionId(null);
      setCreatedOptionIds([]);

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

      // STEP 1: Create the question
      const questionPayload = {
        text: newQuestion.text.trim(),
        displayOrder: Math.max(...onboardingQuestions.map(q => q.displayOrder || 0), 0) + 1,
        isActive: newQuestion.isActive
      };

      const questionResponse = await createQuestionMutation(questionPayload, { showSuccessToast: false });
      // Extract question ID from response (handle both transformed and raw responses)
      const questionId = questionResponse?.id || questionResponse?.data?.id || questionResponse?.data?.data?.id;

      if (!questionId) {
        throw new Error('Question created but no ID returned');
      }

      // Track created question ID
      setCreatedQuestionId(questionId);

      // STEP 2: Create options
      const optionPromises = validOptions.map(async (option, index) => {
        // Use assignsCharacterId directly from state, or fallback to characterMap lookup
        let characterId = option.assignsCharacterId || '';
        
        // Fallback: if assignsCharacterId is not set but characterName is, look it up
        if (!characterId && option.characterName && option.characterName !== "none" && characterMap[option.characterName]) {
          characterId = characterMap[option.characterName];
          console.log('Fallback lookup - Character name:', option.characterName, 'Found UUID:', characterId);
        }

        const payload = {
          questionId: questionId,
          optionText: option.optionText.trim(),
          assignsTier: option.assignsTier,
          displayOrder: index + 1
        };

        // Only include assignsCharacterId if we have a valid UUID
        if (characterId && characterId.trim() !== '') {
          payload.assignsCharacterId = characterId;
          console.log('Including characterId in payload:', characterId);
        } else {
          console.log('No characterId to include for option:', option.optionText);
        }

        const optionResponse = await createOptionMutation(payload, { showSuccessToast: false });
        // Extract option ID from response (handle both transformed and raw responses)
        const optionId = optionResponse?.id || optionResponse?.data?.id || optionResponse?.data?.data?.id;

        // Track created option ID for cleanup
        if (optionId) {
          setCreatedOptionIds(prev => [...prev, optionId]);
        } else {
          console.warn('Option created but no ID returned:', optionResponse);
        }

        return optionResponse;
      });

      await Promise.all(optionPromises);

      // STEP 3: Success - Reset form and close modal
      resetForm();
      setIsCreateModalOpen(false);
      setCreatedQuestionId(null);
      setCreatedOptionIds([]);

      toast.success('Question and options created successfully');

    } catch (error) {
      console.error('Error in createQuestion:', error);

      // Cleanup: Delete created question and options on error
      await cleanupCreatedItems();

      toast.error(error.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup function to delete created items
  const cleanupCreatedItems = async () => {
    try {
      // Delete all created options first (in reverse order to handle dependencies)
      if (createdOptionIds.length > 0) {
        const deleteOptionPromises = createdOptionIds.map(optionId =>
          deleteOptionMutation(optionId).catch(err => {
            console.error(`Failed to delete option ${optionId}:`, err);
            // Don't throw - continue with other deletions
            return null;
          })
        );
        await Promise.all(deleteOptionPromises);
      }

      // Delete the created question
      if (createdQuestionId) {
        await deleteQuestionMutation(createdQuestionId).catch(err => {
          console.error(`Failed to delete question ${createdQuestionId}:`, err);
          // Don't throw - log error but continue
        });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Don't throw - cleanup errors shouldn't break the UI
    }
  };

  // Reset form to initial state
  const resetForm = () => {
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
  };

  // Handle modal close/cancel
  const handleModalClose = async (open) => {
    if (!open && (createdQuestionId || createdOptionIds.length > 0)) {
      // User is closing/canceling - cleanup created items
      await cleanupCreatedItems();
      setCreatedQuestionId(null);
      setCreatedOptionIds([]);
    }
    setIsCreateModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Delete question - Using service layer
  const deleteQuestion = async (questionId) => {
    try {
      await deleteQuestionMutation(questionId);
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Open edit modal with question data
  const openEditModal = (question) => {
    // Find character name for each option
    const optionsWithCharacterNames = (question.options || []).map(option => {
      let characterName = '';
      if (option.assignsCharacterId) {
        // Find character name from characterMappings
        const character = characterMappings.find(
          char => char && char.id === option.assignsCharacterId
        );
        characterName = character?.name || '';
      }
      
      return {
        id: option.id,
        optionText: option.optionText || option.text || '',
        displayOrder: option.displayOrder || 1,
        assignsTier: option.assignsTier || '',
        characterName: characterName,
        assignsCharacterId: option.assignsCharacterId || ''
      };
    });

    setEditQuestion({
      id: question.id,
      text: question.text || '',
      displayOrder: question.displayOrder || 1,
      isActive: question.isActive !== undefined ? question.isActive : true,
      options: optionsWithCharacterNames.length > 0 
        ? optionsWithCharacterNames 
        : [
            { optionText: '', displayOrder: 1, assignsTier: '', characterName: '', assignsCharacterId: '' },
            { optionText: '', displayOrder: 2, assignsTier: '', characterName: '', assignsCharacterId: '' }
          ]
    });
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  // Update question and options
  const updateQuestion = async () => {
    if (updating) {
      return;
    }

    try {
      setUpdating(true);

      // Validation
      if (!editQuestion.text.trim()) {
        toast.error('Question text is required');
        return;
      }

      const validOptions = editQuestion.options.filter(opt => opt.optionText.trim());
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

      // STEP 1: Update the question
      const questionPayload = {
        text: editQuestion.text.trim(),
        displayOrder: editQuestion.displayOrder,
        isActive: editQuestion.isActive
      };

      await updateQuestionMutation(
        { id: editQuestion.id, data: questionPayload },
        { showSuccessToast: false }
      );

      // STEP 2: Handle options - update existing, create new, delete removed
      const existingOptionIds = new Set(
        (editingQuestion?.options || [])
          .map(opt => opt.id)
          .filter(Boolean)
      );

      const currentOptionIds = new Set(
        validOptions
          .map(opt => opt.id)
          .filter(Boolean)
      );

      // Delete options that were removed
      const optionsToDelete = Array.from(existingOptionIds).filter(
        id => !currentOptionIds.has(id)
      );
      for (const optionId of optionsToDelete) {
        await deleteOptionMutation(optionId, { showSuccessToast: false });
      }

      // Update or create options
      const optionPromises = validOptions.map(async (option, index) => {
        let characterId = option.assignsCharacterId || '';
        
        // Fallback: if assignsCharacterId is not set but characterName is, look it up
        if (!characterId && option.characterName && option.characterName !== "none") {
          characterId = characterMap[option.characterName] || '';
          if (!characterId && characterMappings && characterMappings.length > 0) {
            const foundChar = characterMappings.find(
              char => char && char.name && char.name === option.characterName
            );
            if (foundChar && foundChar.id) {
              characterId = foundChar.id;
            }
          }
        }

        const payload = {
          optionText: option.optionText.trim(),
          assignsTier: option.assignsTier,
          displayOrder: index + 1
        };

        // Only include assignsCharacterId if we have a valid UUID
        if (characterId && characterId.trim() !== '') {
          payload.assignsCharacterId = characterId;
        }

        if (option.id) {
          // Update existing option
          await updateOptionMutation(
            { id: option.id, data: payload },
            { showSuccessToast: false }
          );
        } else {
          // Create new option
          await createOptionMutation(
            {
              questionId: editQuestion.id,
              ...payload
            },
            { showSuccessToast: false }
          );
        }
      });

      await Promise.all(optionPromises);

      // Success
      setIsEditModalOpen(false);
      setEditingQuestion(null);
      toast.success('Question and options updated successfully');

    } catch (error) {
      console.error('Error in updateQuestion:', error);
      toast.error(error.message || 'Failed to update question');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle question active status (pause/resume)
  const toggleQuestionStatus = async (question) => {
    try {
      const newStatus = !question.isActive;
      await updateQuestionMutation(
        { 
          id: question.id, 
          data: { 
            text: question.text,
            displayOrder: question.displayOrder,
            isActive: newStatus 
          } 
        },
        { showSuccessToast: false }
      );
      toast.success(`Question ${newStatus ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error toggling question status:', error);
      toast.error('Failed to update question status');
    }
  };

  // Handle option text change - Updated for new schema
  const updateOptionText = (optionIndex, field, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Handle edit option text change
  const updateEditOptionText = (optionIndex, field, value) => {
    const updatedOptions = [...editQuestion.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    setEditQuestion({ ...editQuestion, options: updatedOptions });
  };

  // Add new option to edit form
  const addEditOption = () => {
    const newOptions = [...editQuestion.options, {
      optionText: '',
      displayOrder: editQuestion.options.length + 1,
      assignsTier: '',
      characterName: '',
      assignsCharacterId: ''
    }];
    setEditQuestion({ ...editQuestion, options: newOptions });
  };

  // Remove option from edit form
  const removeEditOption = (optionIndex) => {
    if (editQuestion.options.length > 2) {
      const updatedOptions = editQuestion.options.filter((_, index) => index !== optionIndex);
      setEditQuestion({ ...editQuestion, options: updatedOptions });
    }
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

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return onboardingQuestions.filter((question) => {
      // 🔎 SEARCH FILTER
      const matchesSearch =
        !query ||
        (question.text || '').toLowerCase().includes(query) ||
        question.options?.some(option =>
          (option.optionText || option.text || '')
            .toLowerCase()
            .includes(query)
        );

      // 📌 STATUS FILTER
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && question.isActive) ||
        (statusFilter === 'paused' && !question.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [onboardingQuestions, searchQuery, statusFilter]);

  // Paginated questions for current page
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage, itemsPerPage]);

  // Reset to first page when filtering
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);
  

  return (
    <Layout
      title="Onboarding Question Management"
      subtitle="Manage assessment questions to assign user tiers and character personas"
      headerActions={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="pl-10 w-80"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                   <SelectItem value="paused">Paused</SelectItem>

                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Onboarding Assessment Questions</CardTitle>
                <div className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-300 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  {searchQuery || statusFilter !== 'all'
                    ? `Showing ${filteredQuestions.length} results` 
                    : `${filteredQuestions.length} Questions`
                  }
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading questions: {error}</p>
                    <Button onClick={refetch} variant="outline" className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
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
                        {paginatedQuestions && paginatedQuestions.length > 0 ? (
                          paginatedQuestions.map((question) => (
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
                                <Badge variant={question.isActive ? "success" : "secondary"}>
                                  {question.isActive ? 'Active' : 'Paused'}
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
                                    <DropdownMenuItem onClick={() => openEditModal(question)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Question
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => toggleQuestionStatus(question)}
                                    >
                                      {question.isActive ? (
                                        <>
                                          <Pause className="h-4 w-4 mr-2" />
                                          Pause Question
                                        </>
                                      ) : (
                                        <>
                                          <Play className="h-4 w-4 mr-2" />
                                          Resume Question
                                        </>
                                      )}
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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              {loading ? 'Loading questions...' : 'No questions found'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {filteredQuestions.length > itemsPerPage && (
                      <Pagination
                        currentPage={currentPage}
                        totalItems={filteredQuestions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        className="mt-4"
                      />
                    )}
                  </>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Question Overview</CardTitle>
                <div className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-300 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  {onboardingQuestions.length} Questions
                </div>
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
                      {onboardingQuestions && onboardingQuestions.length > 0 ? onboardingQuestions.map((question) => (
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
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {loading ? 'Loading questions...' : 'No questions found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Question Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={handleModalClose}>
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
                        value={option.characterName ? option.characterName : "none"}
                        onValueChange={(value) => {
                          const characterName = value === "none" ? "" : value;
                          
                          // Get the UUID from characterMap or characterMappings
                          let characterUUID = '';
                          if (characterName) {
                            // First try direct lookup in characterMap
                            characterUUID = characterMap[characterName] || '';
                            
                            // If not found in characterMap, search characterMappings directly
                            if (!characterUUID && characterMappings && characterMappings.length > 0) {
                              const foundChar = characterMappings.find(
                                char => char && char.name && char.name === characterName
                              );
                              if (foundChar && foundChar.id) {
                                characterUUID = foundChar.id;
                              }
                            }
                          }
                          
                          console.log('Character selection:', {
                            selectedValue: value,
                            characterName,
                            characterUUID,
                            characterMapKeys: Object.keys(characterMap || {}),
                            characterMappingsCount: characterMappings?.length || 0,
                            characterMapHasKey: characterName ? characterName in (characterMap || {}) : false
                          });
                          
                          // Update both characterName and assignsCharacterId in a single state update
                          const updatedOptions = [...newQuestion.options];
                          updatedOptions[index] = { 
                            ...updatedOptions[index], 
                            characterName: characterName,
                            assignsCharacterId: characterUUID
                          };
                          setNewQuestion({ ...newQuestion, options: updatedOptions });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select character" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {characterMappingLoading ? (
                            <SelectItem value="loading" disabled>Loading characters...</SelectItem>
                          ) : characterMappings && characterMappings.length > 0 ? (
                            characterMappings
                              .filter(char => char && char.name && char.id)
                              .map((character) => (
                                <SelectItem key={character.id} value={character.name}>
                                  {character.name}
                                  {character.emoji ? ` ${character.emoji}` : ''}
                            </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="no-characters" disabled>No characters available</SelectItem>
                          )}
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
                  onClick={async () => {
                    if (createdQuestionId || createdOptionIds.length > 0) {
                      await cleanupCreatedItems();
                      setCreatedQuestionId(null);
                      setCreatedOptionIds([]);
                    }
                    resetForm();
                    setIsCreateModalOpen(false);
                  }}
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

        {/* Edit Question Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setEditingQuestion(null);
            setEditQuestion({
              text: '',
              displayOrder: 1,
              isActive: true,
              options: []
            });
          }
        }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Onboarding Question</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-question">Question Text *</Label>
                <Textarea
                  value={editQuestion.text}
                  onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
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
                    onClick={addEditOption}
                    disabled={editQuestion.options.length >= 8}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                {editQuestion.options.map((option, index) => (
                  <div key={option.id || index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Option {index + 1} *</Label>
                      <Input
                        value={option.optionText}
                        onChange={(e) => updateEditOptionText(index, 'optionText', e.target.value)}
                        placeholder="Enter answer option"
                        className={!option.optionText.trim() && editQuestion.options.filter(opt => opt.optionText.trim()).length < 2 ? 'border-destructive' : ''}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assigns Tier *</Label>
                      <Select 
                        value={option.assignsTier} 
                        onValueChange={(value) => updateEditOptionText(index, 'assignsTier', value)}
                      >
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
                        value={option.characterName ? option.characterName : "none"}
                        onValueChange={(value) => {
                          const characterName = value === "none" ? "" : value;
                          
                          // Get the UUID from characterMap or characterMappings
                          let characterUUID = '';
                          if (characterName) {
                            characterUUID = characterMap[characterName] || '';
                            
                            if (!characterUUID && characterMappings && characterMappings.length > 0) {
                              const foundChar = characterMappings.find(
                                char => char && char.name && char.name === characterName
                              );
                              if (foundChar && foundChar.id) {
                                characterUUID = foundChar.id;
                              }
                            }
                          }
                          
                          const updatedOptions = [...editQuestion.options];
                          updatedOptions[index] = { 
                            ...updatedOptions[index], 
                            characterName: characterName,
                            assignsCharacterId: characterUUID
                          };
                          setEditQuestion({ ...editQuestion, options: updatedOptions });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select character" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {characterMappingLoading ? (
                            <SelectItem value="loading" disabled>Loading characters...</SelectItem>
                          ) : characterMappings && characterMappings.length > 0 ? (
                            characterMappings
                              .filter(char => char && char.name && char.id)
                              .map((character) => (
                                <SelectItem key={character.id} value={character.name}>
                                  {character.name}
                                  {character.emoji ? ` ${character.emoji}` : ''}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="no-characters" disabled>No characters available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      {editQuestion.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditOption(index)}
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
                  <strong>Note:</strong> This will update the question and its options.
                  Existing options will be updated, new options will be created, and removed options will be deleted.
                  Each option <strong>must</strong> have a tier assignment. Character assignment is optional.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingQuestion(null);
                    setEditQuestion({
                      text: '',
                      displayOrder: 1,
                      isActive: true,
                      options: []
                    });
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateQuestion}
                  disabled={
                    updating ||
                    !editQuestion.text.trim() ||
                    editQuestion.options.filter(opt => opt.optionText.trim()).length < 2 ||
                    editQuestion.options.filter(opt => opt.optionText.trim() && !opt.assignsTier).length > 0
                  }
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Question'
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