import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  description,
  icon: Icon,
  className,
  variant = 'default'
}) => {
  const getTrendIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10';
      case 'success':
        return 'border-success/20 bg-gradient-to-br from-success/5 to-success/10';
      case 'warning':
        return 'border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10';
      case 'info':
        return 'border-info/20 bg-gradient-to-br from-info/5 to-info/10';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg card-hover",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn(
            "h-5 w-5",
            variant === 'primary' && "text-primary",
            variant === 'success' && "text-success",
            variant === 'warning' && "text-warning",
            variant === 'info' && "text-info",
            variant === 'default' && "text-muted-foreground"
          )} />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {value}
          </div>
          
          {change && (
            <div className="flex items-center space-x-2">
              <Badge 
                variant={changeType === 'positive' ? 'default' : changeType === 'negative' ? 'destructive' : 'secondary'}
                className="flex items-center space-x-1 text-xs"
              >
                <TrendIcon className="h-3 w-3" />
                <span>{change}</span>
              </Badge>
              
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};