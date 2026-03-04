import { StatsCard } from '@/components/dashboard/StatsCard';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useTemplateAnalytics } from '@/hooks/useTemplateAnalytics';
import { useUsers } from '@/hooks/useUsers';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  Download,
  Info,
  Layers,
  Lightbulb,
  Loader2,
  TrendingDown,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Dummy data for charts
const userGrowthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 600 },
  { name: 'Mar', users: 800 },
  { name: 'Apr', users: 1200 },
  { name: 'May', users: 1500 },
  { name: 'Jun', users: 2100 },
  { name: 'Jul', users: 2800 },
];

const engagementData = [
  { name: 'Mon', active: 120, shifts: 450 },
  { name: 'Tue', active: 150, shifts: 520 },
  { name: 'Wed', active: 200, shifts: 610 },
  { name: 'Thu', active: 180, shifts: 590 },
  { name: 'Fri', active: 250, shifts: 720 },
  { name: 'Sat', active: 300, shifts: 850 },
  { name: 'Sun', active: 280, shifts: 800 },
];

const contentPerformance = [
  { name: 'Affirmations', completions: 4500, color: '#3b82f6' },
  { name: 'Quick Shifts', completions: 7200, color: '#f59e0b' },
  { name: 'Plot Twists', completions: 3100, color: '#10b981' },
  { name: 'Meditations', completions: 2800, color: '#ef4444' },
];

const recentReports = [
  { id: 'REP-001', name: 'Monthly User Engagement', date: '2024-03-01', type: 'PDF', status: 'Completed', size: '2.4 MB' },
  { id: 'REP-002', name: 'Content Health Audit', date: '2024-03-05', type: 'CSV', status: 'Completed', size: '1.1 MB' },
  { id: 'REP-003', name: 'A/B Test Results - Onboarding', date: '2024-03-10', type: 'XLSX', status: 'Processing', size: '0.5 MB' },
  { id: 'REP-004', name: 'Character Popularity Index', date: '2024-03-12', type: 'PDF', status: 'Completed', size: '4.2 MB' },
  { id: 'REP-005', name: 'Retention Cohort Analysis', date: '2024-03-15', type: 'PDF', status: 'Failed', size: '0 MB' },
];

export const Analytics = () => {
    // Fetch dynamic data
    const { data: dashboardData, loading: dashboardLoading } = useDashboardStats();
    const { data: usersResponse, loading: usersLoading } = useUsers({ limit: 1 });
    const { data: templateInsights, loading: templateLoading } = useTemplateAnalytics();

    const summaryStats = [
      {
        title: 'Total Users',
        value: usersResponse?.total?.toLocaleString() || '0',
        change: dashboardData?.activeUsersChange || '+0%',
        changeType: 'positive',
        icon: Users,
      },
      {
        title: 'Active Content',
        value: templateInsights?.kpis?.activeTemplates?.toLocaleString() || '0',
        change: `${templateInsights?.kpis?.totalTemplates || 0} Total`,
        changeType: 'neutral',
        icon: Activity,
      },
      {
        title: 'Total Generations',
        value: templateInsights?.kpis?.totalGenerations?.toLocaleString() || '0',
        change: `Avg: ${templateInsights?.kpis?.averageGenerationsPerTemplate || 0}/tmp`,
        changeType: 'positive',
        icon: Zap,
      },
      {
        title: 'Active Ratio',
        value: `${Math.round((templateInsights?.kpis?.activeTemplates / templateInsights?.kpis?.totalTemplates) * 100 || 0)}%`,
        change: `${templateInsights?.kpis?.inactiveTemplates || 0} Inactive`,
        changeType: 'neutral',
        icon: BarChart3,
      },
    ];

    const getStatusBadge = (status) => {
      switch (status) {
        case 'Completed': return <Badge variant="success">Completed</Badge>;
        case 'Processing': return <Badge variant="warning">Processing</Badge>;
        case 'Failed': return <Badge variant="destructive">Failed</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
      }
    };

    if (dashboardLoading || usersLoading || templateLoading) {
        return (
            <Layout title="Analytics & Reports" subtitle="Loading analytics data...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
      <Layout
        title="Analytics & Reports"
        subtitle="Comprehensive platform analytics, user insights, and content performance metrics"
        headerActions={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <Calendar className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="primary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Insights
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={stat.icon}
              />
            ))}
          </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">User Growth</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly total registered users</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Chart */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Activity Engagement</CardTitle>
                <p className="text-sm text-muted-foreground">Weekly active users vs shifts completed</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-full">
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Users" />
                    <Bar dataKey="shifts" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Quick Shifts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row: Content Performance & Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Content Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="completions" radius={[0, 4, 4, 0]} barSize={32}>
                      {contentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">API Availability</span>
                  <span className="font-medium text-success">99.9%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-success h-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Latency</span>
                  <span className="font-medium">124ms</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Database Usage</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg text-blue-700">
                  <Layers className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-semibold">Infrastructure Update</div>
                    <div className="text-xs">Scheduled for Sunday, 02:00 AM</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Intelligence Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Performance Lists */}
          <Card className="xl:col-span-2 overflow-hidden border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Content Performance
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">High and low performing generation templates</p>
                </div>
                <Badge variant="outline" className="bg-white/50">Live Analysis</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t">
                {/* Top Performers */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold mb-4 flex items-center text-success">
                    <Check className="h-4 w-4 mr-2" /> Top Performing Templates
                  </h4>
                  <div className="space-y-4">
                    {templateInsights?.topPerformers?.length > 0 ? templateInsights.topPerformers.map((t, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{t.templateName}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-success h-full rounded-full" style={{ width: `${t.performanceScore}%` }}></div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{t.usage} used</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold">TOP {i+1}</Badge>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic">No high-performing data yet.</p>
                    )}
                  </div>
                </div>

                {/* Underperforming */}
                <div className="p-6 bg-slate-50/30">
                  <h4 className="text-sm font-semibold mb-4 flex items-center text-amber-600">
                    <TrendingDown className="h-4 w-4 mr-2" /> Underperforming (Needs Review)
                  </h4>
                  <div className="space-y-4">
                    {templateInsights?.underperformingTemplates?.length > 0 ? templateInsights.underperformingTemplates.map((t, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t.templateName}</p>
                          <span className="text-[10px] font-bold text-amber-600">{t.usage} uses</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed bg-amber-50/50 p-2 rounded border border-amber-100/50">
                          <Info className="h-3 w-3 inline mr-1 -mt-0.5" />
                          {t.recommendation}
                        </p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic">All templates performing within targets.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights & Actions */}
          <div className="space-y-6">
             {/* Energy Distribution */}
             <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Energy Type Popularity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templateInsights?.energyDistribution?.slice(0, 4).map((e, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{e.energyType}</span>
                        <span className="text-muted-foreground">{e.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-full rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-indigo-400' : 'bg-slate-400'}`} 
                          style={{ width: `${e.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actionable Insights Card */}
            <Card className="border-primary/20 bg-primary/5 h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Actionable Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templateInsights?.insights?.map((insight, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                    <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                      {insight}
                    </p>
                  </div>
                ))}
                <Button className="w-full mt-2 text-xs h-8" variant="primary" size="sm">
                  Apply Recommendations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Reports Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Reports</CardTitle>
            <Button variant="ghost" size="sm">View All Reports</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[300px]">Report Name</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-slate-50/30">
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">{report.type}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{report.size}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
