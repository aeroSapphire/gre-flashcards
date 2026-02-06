import { motion } from 'framer-motion';
import { Achievement } from '@/utils/achievements';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function AchievementBadge({
  achievement,
  unlocked = true,
  progress,
  size = 'md',
  showName = false,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn('flex flex-col items-center gap-1', !unlocked && 'opacity-50')}
        >
          <div
            className={cn(
              'rounded-full flex items-center justify-center relative',
              sizeClasses[size],
              unlocked
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25'
                : 'bg-muted border-2 border-dashed border-muted-foreground/30'
            )}
          >
            <span className={cn(unlocked ? '' : 'grayscale opacity-50')}>
              {achievement.icon}
            </span>
            {!unlocked && progress !== undefined && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/30"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${progress} 100`}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          {showName && (
            <span
              className={cn(
                'text-xs font-medium text-center max-w-[80px] truncate',
                unlocked ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {achievement.name}
            </span>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          {!unlocked && progress !== undefined && (
            <p className="text-xs text-primary mt-1">{Math.round(progress)}% complete</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface AchievementListProps {
  achievements: Achievement[];
  unlockedIds: Set<string>;
  progressMap?: Map<string, number>;
}

export function AchievementList({ achievements, unlockedIds, progressMap }: AchievementListProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlocked={unlockedIds.has(achievement.id)}
          progress={progressMap?.get(achievement.id)}
          showName
        />
      ))}
    </div>
  );
}
