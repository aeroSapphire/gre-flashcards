import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClusterById } from '@/data/wordRelationships/index';
import {
  generateDrillSession,
  scoreDrill,
  getSessionSummary,
  type DrillSession,
  type DrillAnswer,
} from '@/utils/drillEngine';
import type { WordCluster, ClusterDrill } from '@/data/wordRelationships/types';

interface ClusterDrillSessionProps {
  clusterId: string;
  onBack: () => void;
  onComplete: (results: {
    clusterId: string;
    answers: DrillAnswer[];
    accuracy: number;
  }) => void;
}

type Phase = 'loading' | 'answering' | 'feedback' | 'summary';

const DRILL_TYPE_LABELS: Record<string, string> = {
  shade_distinction: 'Shade Distinction',
  intensity_ordering: 'Intensity Ordering',
  odd_one_out: 'Odd One Out',
  confusion_resolver: 'Confusion Resolver',
  relationship_labeling: 'Relationship Labeling',
  connotation_sorting: 'Connotation Sorting',
};

export function ClusterDrillSession({ clusterId, onBack, onComplete }: ClusterDrillSessionProps) {
  const [cluster, setCluster] = useState<WordCluster | null>(null);
  const [session, setSession] = useState<DrillSession | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    getClusterById(clusterId).then(data => {
      if (!data) return;
      setCluster(data);
      setSession(generateDrillSession(data));
      setPhase('answering');
    });
  }, [clusterId]);

  const currentDrill: ClusterDrill | undefined = session?.drills[session.currentIndex];

  const handleAnswer = useCallback(
    (answerId: string) => {
      if (!session || !currentDrill || phase !== 'answering') return;
      setSelectedAnswer(answerId);

      const correct = scoreDrill(currentDrill, answerId);
      setIsCorrect(correct);

      // Extract words involved from the drill options
      const wordsInvolved = currentDrill.options.map(o => o.text);

      const answer: DrillAnswer = {
        drillId: currentDrill.id,
        selectedAnswer: answerId,
        correct,
        wordsInvolved,
      };

      setSession(prev => {
        if (!prev) return prev;
        return { ...prev, answers: [...prev.answers, answer] };
      });
      setPhase('feedback');
    },
    [session, currentDrill, phase]
  );

  const handleNext = useCallback(() => {
    if (!session) return;
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.drills.length) {
      // Session complete
      setPhase('summary');
      return;
    }
    setSession(prev => (prev ? { ...prev, currentIndex: nextIndex } : prev));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPhase('answering');
  }, [session]);

  const handleRestart = useCallback(() => {
    if (!cluster) return;
    setSession(generateDrillSession(cluster));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPhase('answering');
  }, [cluster]);

  const handleFinish = useCallback(() => {
    if (!session) return;
    const summary = getSessionSummary(session);
    onComplete({
      clusterId: session.clusterId,
      answers: session.answers,
      accuracy: summary.accuracy,
    });
  }, [session, onComplete]);

  if (phase === 'loading' || !session || !cluster) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Summary view
  if (phase === 'summary') {
    const summary = getSessionSummary(session);
    const pct = Math.round(summary.accuracy * 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Drill Complete</h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
          <div
            className={`text-5xl font-bold ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
          >
            {pct}%
          </div>
          <p className="text-muted-foreground text-sm">
            {summary.correct}/{summary.total} correct on {cluster.name}
          </p>

          {/* Breakdown by type */}
          <div className="mt-4 space-y-2">
            {Object.entries(summary.byType).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {DRILL_TYPE_LABELS[type] ?? type}
                </span>
                <span className={data.correct === data.total ? 'text-green-400' : 'text-foreground'}>
                  {data.correct}/{data.total}
                </span>
              </div>
            ))}
          </div>

          {/* Struggled words */}
          {summary.wordsStruggled.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Words to review:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {summary.wordsStruggled.map(w => (
                  <span key={w} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Retry
          </Button>
          <Button className="flex-1" onClick={handleFinish}>
            Done
          </Button>
        </div>
      </motion.div>
    );
  }

  // Quiz view
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{cluster.name} Drill</h2>
            <p className="text-xs text-muted-foreground">
              {DRILL_TYPE_LABELS[currentDrill?.type ?? ''] ?? ''}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {session.currentIndex + 1}/{session.drills.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((session.currentIndex + (phase === 'feedback' ? 1 : 0)) / session.drills.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      {currentDrill && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDrill.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-foreground text-sm leading-relaxed">{currentDrill.prompt}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentDrill.options.map(option => {
                let optionClass = 'bg-card border-border hover:border-primary/30';
                if (phase === 'feedback') {
                  if (option.id === (Array.isArray(currentDrill.correctAnswer) ? currentDrill.correctAnswer[0] : currentDrill.correctAnswer)) {
                    optionClass = 'bg-green-500/10 border-green-500/40';
                  } else if (option.id === selectedAnswer && !isCorrect) {
                    optionClass = 'bg-red-500/10 border-red-500/40';
                  } else {
                    optionClass = 'bg-card border-border opacity-50';
                  }
                } else if (selectedAnswer === option.id) {
                  optionClass = 'bg-primary/10 border-primary/40';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => phase === 'answering' && handleAnswer(option.id)}
                    disabled={phase === 'feedback'}
                    className={`w-full text-left border rounded-lg p-3 text-sm transition-all cursor-pointer ${optionClass} ${phase === 'feedback' ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{option.text}</span>
                      {phase === 'feedback' &&
                        option.id === (Array.isArray(currentDrill.correctAnswer) ? currentDrill.correctAnswer[0] : currentDrill.correctAnswer) && (
                          <Check className="h-4 w-4 text-green-400" />
                        )}
                      {phase === 'feedback' &&
                        option.id === selectedAnswer &&
                        !isCorrect && (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback explanation */}
            {phase === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div
                  className={`rounded-lg p-3 text-sm ${isCorrect ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentDrill.explanation}
                </p>
                <Button size="sm" onClick={handleNext} className="w-full">
                  {session.currentIndex + 1 < session.drills.length ? (
                    <>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    'See Results'
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
