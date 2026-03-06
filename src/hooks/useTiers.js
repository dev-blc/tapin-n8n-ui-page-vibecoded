// /**
//  * Tier Hooks
//  * React hooks for tier-related API operations
//  */

// import plotTwistService from '@/services/api/plotTwistService';
// import { useApi } from './useApi';

// /**
//  * Hook to fetch all awareness tiers
//  * @param {Object} options - Hook options
//  * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
//  */
// export const useTiers = (options = {}) => {
//   return useApi(
//     () => plotTwistService.getTiers(),
//     [],
//     options
//   );
// };

// export default { useTiers };


import supabase from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export const useTiers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data: tierRows, error: supabaseError } = await supabase
          .from('tiers')
          .select('*')
          .order('score_min', { ascending: true });

        if (supabaseError) throw new Error(supabaseError.message);

        setData((tierRows || []).map(row => ({
          ...row,
          code:         row.tier,
          name:         row.tire_name,
          tierUser:     row.tier_user,
          toneTag:      row.tone?.tag || row.tone,
          toneEssence:  row.tone?.essence || row.context,
          voiceAnchor:  row.voice,
          initialCycle: row.intial_cycle,
          minScore:     row.score_min,
          maxScore:     row.score_max,
          scoreRange:   `${row.score_min} - ${row.score_max}`,
        })));
      } catch (err) {
        setError(err.message || 'Failed to load tiers');
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, []);

  return { data, loading, error };
};

export default { useTiers };