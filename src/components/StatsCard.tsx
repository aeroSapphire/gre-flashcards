import { motion } from 'framer-motion';
import { BookOpen, Brain, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  stats: {
    total: number;
    new: number;
    learning: number;
    learned: number;
  };
}

export function StatsCard({ stats }: StatsCardProps) {
  const percentage = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Your Progress</h3>
        <span className="text-2xl font-display font-bold text-primary">{percentage}%</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.new}</p>
          <p className="text-xs text-muted-foreground">New</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
            <Brain className="h-5 w-5 text-accent" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.learning}</p>
          <p className="text-xs text-muted-foreground">Learning</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
            <Trophy className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.learned}</p>
          <p className="text-xs text-muted-foreground">Mastered</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.learned / Math.max(stats.total, 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.learning / Math.max(stats.total, 1)) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
