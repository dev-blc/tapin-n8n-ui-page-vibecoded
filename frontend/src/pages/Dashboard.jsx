import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Layout } from '@/components/layout/Layout';
import { FullPageLoader } from '@/components/loading/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useContentHealth, useDashboardStats, useRecentActivity } from '@/hooks/useDashboard';
import { useUsers } from '@/hooks/useUsers';
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle,
  FileText,
  Heart,
  Shuffle,
  Users,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  // Fetch data from API
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats({ showErrorToast: false });
  const { data: activityData, loading: activityLoading, error: activityError } = useRecentActivity({ limit: 10 }, { showErrorToast: false });
  const { data: healthData, loading: healthLoading, error: healthError } = useContentHealth({ showErrorToast: false });

 // Get users data
  const { data: usersResponse } = useUsers({});

  // Get total users
  const totalUsers = usersResponse?.total || usersResponse?.data?.length || 0;
  
  // Transform stats data
  const stats = statsData ? {
    activeUsers: { 
      value: statsData.activeUsers?.toLocaleString() || '0', 
      change: statsData.activeUsersChange || '+0%', 
      changeType: statsData.activeUsersChange?.includes('+') ? 'positive' : 'neutral' 
    },
    contentVariations: { 
      value: statsData.contentVariations?.toLocaleString() || '0', 
      change: statsData.contentVariationsChange || '+0%', 
      changeType: statsData.contentVariationsChange?.includes('+') ? 'positive' : 'neutral' 
    },
    dailyEngagement: { 
      value: statsData.dailyEngagement?.toString() || '0', 
      change: statsData.dailyEngagementChange || 'Steady', 
      changeType: 'neutral' 
    },
    contentHealth: { 
      value: `${statsData.contentHealth || 0}%`, 
      change: statsData.contentHealthChange || '', 
      changeType: (statsData.contentHealth || 0) >= 90 ? 'positive' : (statsData.contentHealth || 0) >= 70 ? 'neutral' : 'warning' 
    }
  } : {
    activeUsers: { value: '0', change: '+0%', changeType: 'neutral' },
    contentVariations: { value: '0', change: '+0%', changeType: 'neutral' },
    dailyEngagement: { value: '0', change: 'Steady', changeType: 'neutral' },
    contentHealth: { value: '0%', change: '', changeType: 'neutral' }
  };



  // Use activity data from API or empty array
  const recentActivity = activityData || [];

  // Use health data from API or default
  const contentHealth = healthData || [
    { name: 'Quick Shift Pool Health', value: 0, color: 'muted' },
    { name: 'Plot Twist Pool Health', value: 0, color: 'muted' },
    { name: 'Teaching Moments', value: 0, color: 'muted' },
    { name: 'Templates (Affirmations/Meditations)', value: 0, color: 'muted' }
  ];

  // Show loading state
  if (statsLoading || activityLoading || healthLoading) {
    return (
      <Layout
        title="Dashboard Overview"
        subtitle="Track engagement, content health, and user activity across TAP IN"
        hideHeaderQuickActions
      >
        <FullPageLoader message="Loading dashboard data..." />
      </Layout>
    );
  }

  // Show error state if all requests failed
  const hasErrors = statsError || activityError || healthError;
  if (hasErrors && !statsData && !activityData && !healthData) {
    return (
      <Layout
        title="Dashboard Overview"
        subtitle="Track engagement, content health, and user activity across TAP IN"
        hideHeaderQuickActions
      >
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Unable to Load Dashboard Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              There was an error connecting to the API server. Please check:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>The API server is running and accessible</li>
              <li>Your network connection is working</li>
              <li>CORS is properly configured on the API server</li>
            </ul>
            {(statsError || activityError || healthError) && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Error Details:</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {statsError || activityError || healthError}
                </p>
              </div>
            )}
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const quickActions = [
    { 
      title: 'Add Quick Shift Variation',
      icon: Zap,
      color: 'bg-primary',
      href: '/quick-shifts?add=true'
    },
    { 
      title: 'Add Plot Twist Quest',
      icon: Shuffle,
      color: 'bg-accent',
      href: '/plot-twists?add=true'
    },
    { 
      title: 'Add Teaching Moment',
      icon: BookOpen,
      color: 'bg-secondary',
      href: '/teaching-moments?add=true'
    },
    { 
      title: 'Add Affirmation Template',
      icon: Heart,
      color: 'bg-success',
      href: '/affirmations?add=true'
    },


   { 
      title: 'Add Meditation Template',
      icon: Heart,
      color: 'bg-info',
      href: '/meditations?add=true'
    }
  ];

  return (
    <Layout
      title="Dashboard Overview"
      subtitle="Track engagement, content health, and user activity across TAP IN"
      hideHeaderQuickActions
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Users"
            // value={stats.activeUsers.value}

            value={(usersResponse?.total || usersResponse?.data?.length || 0).toLocaleString()}
            change={stats.activeUsers.change}
            changeType={stats.activeUsers.changeType}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Content Variations Available"
            value={stats.contentVariations.value}
            change={stats.contentVariations.change}
            changeType={stats.contentVariations.changeType}
            icon={FileText}
            variant="success"
          />
          <StatsCard
            title="Avg Daily Engagement"
            value={stats.dailyEngagement.value + ' user'}
            change={stats.dailyEngagement.change}
            changeType={stats.dailyEngagement.changeType}
            icon={Activity}
            variant="info"
          />
          <StatsCard
            title="Content Rotation Health"
            value={stats.contentHealth.value}
            change={stats.contentHealth.change}
            changeType={stats.contentHealth.changeType}
            icon={CheckCircle}
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id || index}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              activity.type === 'create' ? 'bg-success' :
                              activity.type === 'update' ? 'bg-warning' :
                              'bg-info'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground">
                                {activity.action}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {activity.category}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-muted-foreground">
                                {activity.actor}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        </div>
                        {index < recentActivity.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Health Status */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Content Health Status</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monitor variation freshness and rotation balance.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contentHealth.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <Progress
                        value={item.value}
                        className={`h-2 ${
                          item.color === 'success' ? 'bg-success/20' :
                          item.color === 'warning' ? 'bg-warning/20' :
                          item.color === 'primary' ? 'bg-primary/20' :
                          'bg-muted'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create new content variations and templates
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  icon={action.icon}
                  color={action.color}
                  onClick={() => navigate(action.href)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};