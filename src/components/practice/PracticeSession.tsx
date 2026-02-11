import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Zap, Target, TrendingUp, RotateCcw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/data/questionSchema';
import { SKILLS } from '@/data/skillTaxonomy';
import { BrainMap } from '@/data/brainMapSchema';
import { PracticeSession as PracticeSessionType, startPracticeSession, getNextPracticeQuestion, submitPracticeAnswer, getPracticeSessionSummary } from '@/utils/practiceEngine';
import { QuestionDisplay } from '@/components/practice/QuestionDisplay';
import { PracticeResults } from '@/components/practice/PracticeResults';

interface PracticeSessionProps {
  skillId: string;
  brainMap: BrainMap;
  onUpdateBrainMap: (brainMap: BrainMap) => void;
  onExit: () => void;
  onReviewLesson?: (skillId: string) => void;
}

export function PracticeSessionView({
  skillId,
  brainMap,
  onUpdateBrainMap,
  onExit,
  onReviewLesson
}: PracticeSessionProps) {
  const [session, setSession] = useState<PracticeSessionType>(() => startPracticeSession(skillId, brainMap));
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [brainMapSnapshot] = useState(brainMap);

  const skill = SKILLS[skillId];

  const loadNextQuestion = useCallback(async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setLastCorrect(null);

    const question = await getNextPracticeQuestion(session);
    if (!question) {
      setSessionComplete(true);
    } else {
      setCurrentQuestion(question);
    }
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion || !selectedAnswer) return;

    const result = submitPracticeAnswer(session, currentQuestion, selectedAnswer, brainMap);
    setLastCorrect(result.correct);
    setShowResult(true);
    setSession(result.updatedSession);
    onUpdateBrainMap(result.updatedBrainMap);
  }, [currentQuestion, selectedAnswer, session, brainMap, onUpdateBrainMap]);

  const handleNext = useCallback(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  const handleEndSession = useCallback(() => {
    setSessionComplete(true);
  }, []);

  if (sessionComplete) {
    const summary = getPracticeSessionSummary(session, brainMapSnapshot, brainMap);
    return (
      <PracticeResults
        summary={summary}
        onExit={onExit}
        onReviewLesson={onReviewLesson ? () => onReviewLesson(skillId) : undefined}
        onPracticeAgain={() => {
          setSession(startPracticeSession(skillId, brainMap));
          setSessionComplete(false);
          loadNextQuestion();
        }}
      />
    );
  }

  const questionsAnswered = session.sessionHistory.length;
  const accuracy = questionsAnswered > 0
    ? Math.round((session.correctCount / questionsAnswered) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{skill?.name || skillId}</p>
          <p className="text-sm font-medium">Question {questionsAnswered + 1}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleEndSession}>
          End Session
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 mb-6 p-3 bg-card border border-border rounded-xl text-sm">
        <div className="flex items-center gap-1.5">
          <Target className="h-4 w-4 text-primary" />
          <span>{questionsAnswered} answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-success" />
          <span>{accuracy}% accuracy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-orange-500" />
          <span>{session.currentStreak} streak</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Lvl {session.currentDifficulty.toFixed(1)}</span>
        </div>
      </div>

      {/* Question */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-pulse text-muted-foreground">Loading question...</div>
        </div>
      ) : currentQuestion ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={setSelectedAnswer}
              showResult={showResult}
              isCorrect={lastCorrect}
              showExplanation={showResult}
            />

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-3">
              {!showResult ? (
                <Button
                  size="lg"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button size="lg" onClick={handleNext}>
                  Next Question
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No more questions available for this skill.
        </div>
      )}
    </div>
  );
}
