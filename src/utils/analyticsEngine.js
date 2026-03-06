/**
 * Analytics Engine
 * Logic to process raw template data into structured business insights
 */

export const generateTemplateInsights = (affirmations = [], meditations = []) => {
  const allTemplates = [
    ...affirmations.map(t => ({ ...t, type: 'Affirmation' })),
    ...meditations.map(t => ({ ...t, type: 'Meditation' }))
  ];

  const totalTemplates = allTemplates.length;
  const activeTemplates = allTemplates.filter(t => t.isActive || t.status === 'Active').length;
  const inactiveTemplates = totalTemplates - activeTemplates;
  
  // Calculate total generations
  const totalGenerations = allTemplates.reduce((sum, t) => sum + (Number(t.usageCount) || 0), 0);
  
  // Calculate Avg Generations
  const averageGenerationsPerTemplate = totalTemplates > 0 
    ? Math.round((totalGenerations / totalTemplates) * 10) / 10 
    : 0;

  // Growth Rate (Mock logic based on recent IDs or created_at if available)
  // In a real scenario, we'd compare this month vs last month
  const growthRate = 12.5; 

  // 1. Top Performers (Sort by usage)
  const topPerformers = allTemplates
    .filter(t => (Number(t.usageCount) || 0) > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5)
    .map(t => ({
      templateName: t.templateName || t.name,
      usage: t.usageCount || 0,
      performanceScore: Math.min(100, Math.round(((t.usageCount || 0) / (totalGenerations || 1)) * 500))
    }));

  // 2. Underperforming (Usage < 5 and Active)
  const underperformingTemplates = allTemplates
    .filter(t => (t.isActive || t.status === 'Active') && (Number(t.usageCount) || 0) < 5)
    .slice(0, 5)
    .map(t => ({
      templateName: t.templateName || t.name,
      usage: t.usageCount || 0,
      recommendation: (t.usageCount || 0) === 0 
        ? "Never used. Consider reviewing imagery theme or visibility settings." 
        : "Low engagement. Suggest A/B testing the opening phrase."
    }));

  // 3. Energy Distribution (Affirmations only)
  const energyCounts = affirmations.reduce((acc, t) => {
    const type = t.energyType || 'Uncategorized';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const energyDistribution = Object.entries(energyCounts).map(([energyType, count]) => ({
    energyType,
    percentage: Math.round((count / (affirmations.length || 1)) * 100)
  })).sort((a, b) => b.percentage - a.percentage);

  // 4. Meditation Setting Distribution
  const settingCounts = meditations.reduce((acc, t) => {
    const setting = t.setting || 'Uncategorized';
    acc[setting] = (acc[setting] || 0) + 1;
    return acc;
  }, {});

  const settingDistribution = Object.entries(settingCounts).map(([setting, count]) => ({
    setting,
    percentage: Math.round((count / (meditations.length || 1)) * 100)
  })).sort((a, b) => b.percentage - a.percentage);

  // 5. Generate Actionable Insights
  const insights = [];
  
  // Insight 1: Active Ratio
  const activeRatio = (activeTemplates / (totalTemplates || 1)) * 100;
  if (activeRatio < 70) {
    insights.push(`Your active template ratio is low (${Math.round(activeRatio)}%). Audit inactive templates to reduce bloat.`);
  } else {
    insights.push(`High content availability detected. ${Math.round(activeRatio)}% of your library is currently live.`);
  }

  // Insight 2: Energy Popularity
  if (energyDistribution.length > 0) {
    insights.push(`The "${energyDistribution[0].energyType}" energy type is currently your most popular category.`);
  }

  // Insight 3: Declining/Underperforming
  if (underperformingTemplates.length > 2) {
    insights.push(`Action Required: ${underperformingTemplates.length} active templates have near-zero engagement. Consider a content refresh.`);
  }

  // Insight 4: Suggested Action
  if (averageGenerationsPerTemplate < 10) {
    insights.push("Strategy Tip: User engagement per template is low. Try promoting specific 'Featured' templates on the user dashboard.");
  }

  return {
    kpis: {
      totalTemplates,
      totalGenerations,
      activeTemplates,
      inactiveTemplates,
      growthRate,
      averageGenerationsPerTemplate
    },
    topPerformers,
    underperformingTemplates,
    energyDistribution,
    settingDistribution,
    insights
  };
};
