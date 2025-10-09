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
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const QuickShifts = () => {
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data for Quick Shift loops and variations
  const quickShiftLoops = [
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

  const reframeLibrary = [
    {
      id: 'RF-001',
      category: 'Too Much on My Plate',
      insteadOf: 'I have to handle everything perfectly or it will all fall apart',
      truthBecomes: 'I can slow down and trust that what matters will get done',
      tierAvailability: ['User 1', 'User 2'],
      usageCount: 156,
      tone: 'Gentle',
      status: 'Active'
    },
    {
      id: 'RF-002',
      category: 'What Will They Think',
      insteadOf: 'Everyone is watching and judging everything I do',
      truthBecomes: 'Most people are focused on their own lives, and I can be myself',
      tierAvailability: ['User 1'],
      usageCount: 89,
      tone: 'Reassuring',
      status: 'Active'
    }
  ];

  const protectors = [
    {
      id: 'PR-001',
      name: 'The Perfectionist',
      description: 'Tries to control outcomes by making everything flawless',
      associatedLoops: ['Too Much on My Plate', 'Being Hard on Myself'],
      usageCount: 234,
      status: 'Active'
    },
    {
      id: 'PR-002',
      name: 'The People Pleaser',
      description: 'Avoids conflict by making everyone else happy first',
      associatedLoops: ['What Will They Think', 'Being Hard on Myself'],
      usageCount: 189,
      status: 'Active'
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
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tier Level" />
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
                <CardTitle>Quick Shift Loop Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loop Category</TableHead>
                      <TableHead>Emotions</TableHead>
                      <TableHead>Variations</TableHead>
                      <TableHead>Usage (30 days)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quickShiftLoops.map((loop) => (
                      <TableRow key={loop.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{loop.icon}</span>
                            <div>
                              <div className="font-medium">{loop.category}</div>
                              <div className="text-sm text-muted-foreground">
                                {loop.tierAvailability.join(', ')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {loop.emotionCount} emotions
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {loop.protectorVariations} protectors
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {loop.reframeVariations} reframes
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{loop.usageCount}</div>
                          <div className="text-xs text-muted-foreground">
                            Updated {loop.lastModified}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(loop.status)}>
                            {loop.status}
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {loop.status === 'Active' ? (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Lock
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unlock
                                  </>
                                )}
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

          {/* Reframe Library */}
          <TabsContent value="reframes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reframe Statement Library</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Instead of...</TableHead>
                      <TableHead>Truth becomes...</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reframeLibrary.map((reframe) => (
                      <TableRow key={reframe.id}>
                        <TableCell>
                          <Badge variant="outline">{reframe.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate">{reframe.insteadOf}</p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate">{reframe.truthBecomes}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {reframe.tierAvailability.map((tier) => (
                              <Badge key={tier} variant="secondary" className="text-xs">
                                {tier}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{reframe.usageCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
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

          {/* Protectors */}
          <TabsContent value="protectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Protector Archetypes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {protectors.map((protector) => (
                    <Card key={protector.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{protector.name}</h3>
                          <Badge variant={getStatusColor(protector.status)}>
                            {protector.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {protector.description}
                        </p>
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
                        <div className="text-sm text-muted-foreground">
                          Usage: {protector.usageCount} times
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
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