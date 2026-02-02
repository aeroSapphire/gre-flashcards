import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfusionCluster } from '@/data/confusionClusters';

interface ConfusionClusterCardProps {
  cluster: ConfusionCluster;
  currentWord: string;
  compact?: boolean;
  onClick?: () => void;
}

export function ConfusionClusterCard({ cluster, currentWord, compact = false, onClick }: ConfusionClusterCardProps) {
  const otherWords = cluster.words.filter(w => w.toLowerCase() !== currentWord.toLowerCase());

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              Often confused with:{' '}
              <span className="text-foreground font-medium">
                {otherWords.join(', ')}
              </span>
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">
            {cluster.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {cluster.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {cluster.words.map(word => (
              <span
                key={word}
                className={cn(
                  'text-sm px-3 py-1 rounded-full border',
                  word.toLowerCase() === currentWord.toLowerCase()
                    ? 'bg-primary/20 text-primary border-primary/30 font-medium'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                )}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
