import { useState } from 'react';
import { Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StoredMnemonic } from '@/services/mnemonicService';

interface MnemonicDisplayProps {
  mnemonic: StoredMnemonic | null;
  isGenerating: boolean;
  onGenerate: () => void;
  compact?: boolean;
}

const techniqueColors: Record<string, string> = {
  SOUND: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  VISUAL: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  STORY: 'bg-green-500/10 text-green-600 border-green-500/20',
  BREAKDOWN: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  ASSOCIATION: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

export function MnemonicDisplay({ mnemonic, isGenerating, onGenerate, compact = false }: MnemonicDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isGenerating) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-muted-foreground',
        compact ? 'text-xs' : 'text-sm'
      )}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Generating mnemonic...</span>
      </div>
    );
  }

  if (!mnemonic) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onGenerate();
        }}
        className="text-muted-foreground hover:text-primary"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Generate Mnemonic
      </Button>
    );
  }

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors">
          <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-xs text-foreground/90',
              !isExpanded && 'line-clamp-1'
            )}>
              {mnemonic.mnemonic_text}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-yellow-500/20">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground">Memory Trick</h4>
            {mnemonic.technique && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full border',
                techniqueColors[mnemonic.technique] || 'bg-muted text-muted-foreground'
              )}>
                {mnemonic.technique}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {mnemonic.mnemonic_text}
          </p>
        </div>
      </div>
    </div>
  );
}
