import templateService from '@/services/api/templateService';
import { generateTemplateInsights } from '@/utils/analyticsEngine';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to fetch and process template-centric analytics
 */
export const useTemplateAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both types of templates
      const [affirmationsResult, meditationsResult] = await Promise.all([
        templateService.getAffirmationTemplates({ limit: 1000 }),
        templateService.getMeditationTemplates({ limit: 1000 })
      ]);

      const affirmations = affirmationsResult.data || affirmationsResult || [];
      const meditations = meditationsResult.data || meditationsResult || [];

      // Process through engine
      const insights = generateTemplateInsights(affirmations, meditations);
      
      setData(insights);
      setError(null);
    } catch (err) {
      console.error('Error fetching template analytics:', err);
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

export default useTemplateAnalytics;
