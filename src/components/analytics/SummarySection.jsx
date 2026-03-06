import { StatsCard } from '@/components/dashboard/StatsCard';
import { Activity, Shield, Users, Zap } from 'lucide-react';

export const SummarySection = ({ summary }) => {
  // Safe fallbacks if summary object is null or missing fields
  const safeSummary = summary || {};

  const summaryStats = [
    {
      title: 'Total Users',
      value: safeSummary.totalUsers?.toLocaleString() || '0',
      change: 'Platform-wide',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Active Templates',
      value: safeSummary.activeTemplates?.toLocaleString() || '0',
      change: 'Currently live',
      changeType: 'neutral',
      icon: Activity,
    },
    {
      title: 'Total Templates',
      value: safeSummary.totalTemplates?.toLocaleString() || '0',
      change: 'Created & saved',
      changeType: 'neutral',
      icon: Shield,
    },
    {
      title: 'Total Generations',
      value: safeSummary.totalGenerations?.toLocaleString() || '0',
      change: 'All historical usage',
      changeType: 'positive',
      icon: Zap,
    },
  ];

  return (
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
  );
};
