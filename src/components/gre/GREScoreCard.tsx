import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GREScoreResult, getScoreBandColor } from '@/utils/greScoring';
import { Trophy, TrendingUp, Award } from 'lucide-react';

interface GREScoreCardProps {
  score: GREScoreResult;
  rawScore: number;
  totalQuestions: number;
  showDetails?: boolean;
  compact?: boolean;
}

export function GREScoreCard({
  score,
  rawScore,
  totalQuestions,
  showDetails = true,
  compact = false,
}: GREScoreCardProps) {
  const colors = getScoreBandColor(score.band);

  // Calculate progress percentage for the circular gauge (130-170 range)
  const progressPercent = ((score.scaled - 130) / 40) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} text-white font-bold text-lg`}>
          {score.scaled}
        </div>
        <div>
          <div className="text-sm font-medium">{score.bandLabel}</div>
          <div className="text-xs text-muted-foreground">{score.percentile}th percentile</div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${colors.border} overflow-hidden`}>
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Trophy className={`h-5 w-5 ${colors.text}`} />
          GRE Verbal Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Circular progress background */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 3.52} 352`}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={colors.text.replace('text-', 'stop-')} stopColor="currentColor" />
                  <stop offset="100%" className={colors.text.replace('text-', 'stop-')} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            {/* Score number in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${colors.text}`}>{score.scaled}</span>
              <span className="text-xs text-muted-foreground">out of 170</span>
            </div>
          </div>
        </div>

        {/* Band Label */}
        <div className="text-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} text-white`}>
            <Award className="h-4 w-4" />
            {score.bandLabel}
          </span>
        </div>

        {showDetails && (
          <>
            {/* Percentile Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Percentile Rank</span>
                <span className="font-semibold">{score.percentile}th</span>
              </div>
              <div className="relative">
                <Progress value={score.percentile} className="h-2" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-primary shadow-sm"
                  style={{ left: `calc(${score.percentile}% - 6px)` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                You scored higher than {score.percentile}% of test takers
              </p>
            </div>

            {/* Raw Score */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Raw Score</span>
              </div>
              <span className="font-semibold">
                {rawScore} / {totalQuestions}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
