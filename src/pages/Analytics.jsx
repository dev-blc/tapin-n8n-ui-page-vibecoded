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
import { useTemplateAnalytics } from '@/hooks/useTemplateAnalytics';
import {
    ArrowUpRight,
    Calendar,
    Check,
    Download,
    HeartPulse,
    Info,
    Layers,
    Lightbulb,
    Loader2,
    TrendingDown,
    TrendingUp,
    Zap
} from 'lucide-react';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


import { ChartsSection } from '@/components/analytics/ChartsSection';
import { OnboardingSection } from '@/components/analytics/OnboardingSection';
import { SummarySection } from '@/components/analytics/SummarySection';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const recentReports = [
  { id: 'REP-001', name: 'Monthly User Engagement', date: '2024-03-01', type: 'PDF', status: 'Completed', size: '2.4 MB' },
  { id: 'REP-002', name: 'Content Health Audit', date: '2024-03-05', type: 'CSV', status: 'Completed', size: '1.1 MB' },
  { id: 'REP-003', name: 'A/B Test Results - Onboarding', date: '2024-03-10', type: 'XLSX', status: 'Processing', size: '0.5 MB' },
  { id: 'REP-004', name: 'Character Popularity Index', date: '2024-03-12', type: 'PDF', status: 'Completed', size: '4.2 MB' },
  { id: 'REP-005', name: 'Retention Cohort Analysis', date: '2024-03-15', type: 'PDF', status: 'Failed', size: '0 MB' },
];

export const Analytics = () => {
    // Fetch dynamic data from the Railway edge function
    const { data: templateInsights, loading: templateLoading, error } = useTemplateAnalytics();

    const getStatusBadge = (status) => {
      switch (status) {
        case 'Completed': return <Badge variant="success">Completed</Badge>;
        case 'Processing': return <Badge variant="warning">Processing</Badge>;
        case 'Failed': return <Badge variant="destructive">Failed</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
      }
    };

    if (templateLoading) {
        return (
            <Layout title="Analytics & Reports" subtitle="Loading analytics data...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Analytics & Reports" subtitle="Failed to load data">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-destructive font-medium">{error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
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
          <SummarySection summary={templateInsights?.summary} />
          
          <OnboardingSection onboarding={templateInsights?.onboarding} />

          <ChartsSection charts={templateInsights?.charts} />
        
        {/* Emotional Pulse */}
        <div className="grid grid-cols-1 space-y-6">
          <Card className="hover:shadow-md transition-shadow border-primary/10">
            <CardHeader className="bg-primary/5 pb-4">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-primary" />
                    Emotional Pulse
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Real-time Quick Shift triggers and emotional states of your users.</p>
               </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                 {(templateInsights?.emotionalPulse?.triggers || []).map((pulse, i) => (
                    <Badge 
                      key={i} 
                      variant={pulse.variant || 'secondary'} 
                      className={`px-3 py-1.5 text-sm ${pulse.count > 100 ? 'scale-110 shadow-sm mx-1' : ''}`}
                      style={{ opacity: pulse.count > 100 ? 1 : 0.8 }}
                    >
                      {pulse.text} <span className="ml-2 font-mono text-xs opacity-75">{pulse.count}</span>
                    </Badge>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Performance & Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Template Usage Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={templateInsights?.intelligence?.topPerformers || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                      width={120}
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="usage" radius={[0, 4, 4, 0]} barSize={24}>
                      {(templateInsights?.intelligence?.topPerformers || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    {templateInsights?.intelligence?.topPerformers?.length > 0 ? templateInsights.intelligence.topPerformers.map((t, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{t.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-success h-full rounded-full" style={{ width: `${t.score}%` }}></div>
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
                    {templateInsights?.intelligence?.underperforming?.length > 0 ? templateInsights.intelligence.underperforming.map((t, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t.name}</p>
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
                  {(templateInsights?.charts?.energyDistribution || []).slice(0, 4).map((e, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{e.type}</span>
                        <span className="text-muted-foreground">{e.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-full rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-indigo-400' : 'bg-slate-400'}`} 
                          style={{ width: `${e.percent}%` }}
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
                {(templateInsights?.intelligence?.aiInsights || []).map((insight, i) => (
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
