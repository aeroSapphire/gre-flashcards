import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, CheckCircle2, PlayCircle, RotateCcw } from 'lucide-react';
import { formatTime } from '@/utils/greScoring';

export interface SectionAttempt {
  id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
}

interface GRESectionCardProps {
  sectionNumber: 2 | 3;
  title: string;
  questionCount: number;
  timeLimitMinutes: number;
  testId: string;
  attempt?: SectionAttempt | null;
  onStart: () => void;
  onReview?: () => void;
  disabled?: boolean;
}

export function GRESectionCard({
  sectionNumber,
  title,
  questionCount,
  timeLimitMinutes,
  attempt,
  onStart,
  onReview,
  disabled = false,
}: GRESectionCardProps) {
  const isCompleted = !!attempt;
  const percentage = isCompleted
    ? Math.round((attempt.score / attempt.total_questions) * 100)
    : 0;

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not Started
      </Badge>
    );
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${
      isCompleted
        ? 'border-green-500/30 bg-green-500/5'
        : 'border-border hover:border-primary/50'
    }`}>
      {/* Section number indicator */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className={`absolute transform rotate-45 ${
          isCompleted ? 'bg-green-500' : 'bg-primary'
        } text-white text-xs font-bold py-1 right-[-35px] top-[16px] w-[100px] text-center`}>
          {sectionNumber}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">
              Section {sectionNumber} of GRE Verbal
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Section Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{questionCount} questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{timeLimitMinutes} minutes</span>
          </div>
        </div>

        {/* Score display if completed */}
        {isCompleted && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Your Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {attempt.score}/{attempt.total_questions}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className="text-2xl font-bold">{percentage}%</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Completed in {formatTime(attempt.time_taken_seconds)}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onReview}
              >
                Review Answers
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={onStart}
                disabled={disabled}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={onStart}
              disabled={disabled}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Section {sectionNumber}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
