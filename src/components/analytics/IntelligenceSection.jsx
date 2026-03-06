import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, Lightbulb, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const IntelligenceSection = ({ intelligence, charts }) => {
  const safeTop = Array.isArray(intelligence?.topPerformers) ? intelligence.topPerformers : [];
  const safeUnderperforming = Array.isArray(intelligence?.underperforming) ? intelligence.underperforming : [];
  const safeInsights = Array.isArray(intelligence?.aiInsights) ? intelligence.aiInsights : [];
  const safeEnergyDistribution = Array.isArray(charts?.energyDistribution) ? charts.energyDistribution : [];

  return (
    <>
      {/* Template Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Template Usage Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeTop} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={150}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="usage" radius={[0, 4, 4, 0]} barSize={24}>
                    {safeTop.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                {safeEnergyDistribution.slice(0, 4).map((e, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{e.type}</span>
                      <span className="text-muted-foreground">{e.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-primary' : i === 1 ? 'bg-indigo-400' : 'bg-slate-400'
                        }`}
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
              {safeInsights.map((insight, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">{insight}</p>
                </div>
              ))}
              <Button className="w-full mt-2 text-xs h-8" variant="primary" size="sm">
                Apply Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Intelligence Lists */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border-primary/10 shadow-sm mb-6">
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Content Performance
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">High and low performing generation templates</p>
              </div>
              <Badge variant="outline" className="bg-white/50">
                Live Analysis
              </Badge>
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
                  {safeTop.length > 0 ? (
                    safeTop.map((t, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{t.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-success h-full rounded-full" style={{ width: `${t.score || 100}%` }}></div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{t.usage} used</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          TOP {i + 1}
                        </Badge>
                      </div>
                    ))
                  ) : (
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
                  {safeUnderperforming.length > 0 ? (
                    safeUnderperforming.map((t, i) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">All templates performing within targets.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
