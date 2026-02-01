import { CheckCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  id: string;
  title: string;
  tier: 1 | 2 | 3;
  isCompleted: boolean;
  score?: number;
  totalQuestions: number;
  onClick: () => void;
}

const tierColors = {
  1: {
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    card: 'hover:border-blue-500/50',
    check: 'text-blue-500'
  },
  2: {
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    card: 'hover:border-purple-500/50',
    check: 'text-purple-500'
  },
  3: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    card: 'hover:border-amber-500/50',
    check: 'text-amber-500'
  }
};

export function ModuleCard({
  id,
  title,
  tier,
  isCompleted,
  score,
  totalQuestions,
  onClick
}: ModuleCardProps) {
  const colors = tierColors[tier];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        colors.card,
        isCompleted && 'bg-muted/30'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn('text-xs', colors.badge)}>
                Tier {tier}
              </Badge>
              {isCompleted && (
                <CheckCircle className={cn('h-4 w-4', colors.check)} />
              )}
            </div>
            <CardTitle className="text-sm font-medium leading-tight">
              {title}
            </CardTitle>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isCompleted && score !== undefined ? (
          <p className="text-xs text-muted-foreground">
            Best score: {score}/{totalQuestions}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {totalQuestions} practice questions
          </p>
        )}
      </CardContent>
    </Card>
  );
}
