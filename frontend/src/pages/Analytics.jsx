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
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    Calendar,
    Download,
    FileText,
    Layers,
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
  const summaryStats = [
    {
      title: 'Total Users',
      value: '12,847',
      change: '+14% from last month',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Active Sessions',
      value: '2,420',
      change: '+8% since yesterday',
      changeType: 'positive',
      icon: Activity,
    },
    {
      title: 'Quick Shifts Completed',
      value: '84,192',
      change: '+22% from last month',
      changeType: 'positive',
      icon: Zap,
    },
    {
      title: 'Reports Generated',
      value: '1,048',
      change: '-2% from last month',
      changeType: 'negative',
      icon: FileText,
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

  return (
    <Layout
      title="Analytics & Reports"
      subtitle="Comprehensive platform analytics, user insights, and content performance metrics"
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="primary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
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
