import analyticsService from '@/services/api/analyticsService';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to fetch and process comprehensive analytics using Railway edge function
 */
export const useAnalyticsOverview = () => {
  const [data, setData] = useState({
    summary: {},
    charts: {},
    intelligence: {
      topPerformers: [],
      underperforming: [],
      aiInsights: []
    },
    onboarding: {
      tierDistribution: [],
      personaDistribution: [],
      funnel: []
    },
    plotTwists: {
      questEngagement: []
    },
    emotionalPulse: {
      triggers: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getOverview();
      
      // Ensure we have all expected structures even if backend is still being updated
      setData({
        ...response,
        summary: response.summary || {},
        charts: response.charts || {},
        intelligence: response.intelligence || { topPerformers: [], underperforming: [], aiInsights: [] },
        onboarding: response.onboarding || { tierDistribution: [], personaDistribution: [], funnel: [] },
        plotTwists: response.plotTwists || { questEngagement: [] },
        emotionalPulse: response.emotionalPulse || { triggers: [] }
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics overview:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAnalytics 
  };
};

export default useAnalyticsOverview;
export const useTemplateAnalytics = useAnalyticsOverview; // Legacy export for compatibility
