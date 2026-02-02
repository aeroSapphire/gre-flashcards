import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HardWordButtonProps {
  isHard: boolean;
  onToggle: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

export function HardWordButton({ isHard, onToggle, size = 'sm', className }: HardWordButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'transition-all duration-200',
            size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
            isHard
              ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-500/10'
              : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10',
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Flame
            className={cn(
              'transition-all duration-200',
              size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
              isHard && 'fill-orange-500'
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isHard ? 'Unmark as hard' : 'Mark as hard'}
      </TooltipContent>
    </Tooltip>
  );
}
