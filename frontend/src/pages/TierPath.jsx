/**
 * Tier Path Page
 * Displays awareness tiers and tone adaptation logic
 */

import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTiers } from '@/hooks/useTiers';
import { ChevronLeft, Info, Layers, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TierPath = () => {
  const navigate = useNavigate();
  const { data: tiersData, loading, error } = useTiers();

  // Handle empty or invalid data
  const tiers = Array.isArray(tiersData) ? tiersData : (tiersData?.data || []);

  const getTierAccentColor = (tierUser) => {
    switch (tierUser?.toString()) {
      case '1': return 'border-l-blue-500 bg-blue-50/30';
      case '2': return 'border-l-purple-500 bg-purple-50/30';
      case '3': return 'border-l-pink-500 bg-pink-50/30';
      default: return 'border-l-primary bg-primary/5';
    }
  };

  const getTierBadgeColor = (tierUser) => {
      switch (tierUser?.toString()) {
      case '1': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '2': return 'bg-purple-100 text-purple-700 border-purple-200';
      case '3': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Layout
      title="Tier Path & Awareness Levels"
      subtitle="Understand how content tone adapts across the 6 awareness tiers"
      headerActions={
        <Button variant="outline" size="sm" onClick={() => navigate('/plot-twists')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Quests
        </Button>
      }
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Intro Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">The Growth Journey</h2>
                <p className="text-muted-foreground max-w-3xl">
                  TAP IN uses a dynamic scoring system to guide users through 6 awareness tiers. 
                  As a user's score increases, the tone of Plot Twists and Quick Shifts evolves 
                  from gentle guidance to expanded empowerment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : error ? (
           <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block mb-4">
               {error}
            </div>
            <p className="text-muted-foreground">Unable to load tier data. Please try again later.</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
             <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-lg font-medium">No Tier Data Found</h3>
             <p className="text-muted-foreground">The tier configuration could not be retrieved from the server.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.code || tier.id} 
                className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 ${getTierAccentColor(tier.tierUser)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                         <span className="text-2xl font-bold text-foreground">{tier.code || 'N/A'}</span>
                         <Badge variant="outline" className={getTierBadgeColor(tier.tierUser)}>
                           User {tier.tierUser || '?'}
                         </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {tier.name || 'Unnamed Tier'}
                      </CardTitle>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-border/40">
                    <div className="flex items-center text-sm font-medium">
                      <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                      Score Range
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {tier.scoreRange || `${tier.minScore}-${tier.maxScore}`}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Tone Tag</div>
                      <Badge variant="secondary" className="font-medium">
                        {tier.toneTag || 'Empowerment'}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Tone Essence</div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {tier.toneEssence || 'No essence description available.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                       <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 flex items-center">
                         <TrendingUp className="h-3 w-3 mr-1" />
                         Initial Cycle
                       </div>
                       <p className="text-sm italic text-muted-foreground">
                         {tier.initialCycle || 'Default mapping'}
                       </p>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30 mt-4">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Voice Anchor</div>
                      <p className="text-sm italic text-muted-foreground/90 font-serif">
                        "{tier.voiceAnchor || 'The voice of growth and clarity.'}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TierPath;
