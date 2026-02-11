import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertTriangle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, Passage } from '@/data/questionSchema';
import { SKILLS, DIFFICULTY_LEVELS } from '@/data/skillTaxonomy';
import { getPassageById } from '@/data/questionBank';

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | string[] | null;
  onSelectAnswer: (answer: string | string[]) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  showExplanation: boolean;
}

export function QuestionDisplay({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  isCorrect,
  showExplanation
}: QuestionDisplayProps) {
  const [passage, setPassage] = useState<Passage | null>(null);
  const isSE = question.type === 'sentence_equivalence';
  const isMultiBlank = question.blanks > 1;

  // Load passage for RC questions
  useEffect(() => {
    if (question.passageId) {
      getPassageById(question.passageId).then(setPassage);
    } else {
      setPassage(null);
    }
  }, [question.passageId]);

  const handleOptionClick = (optionId: string) => {
    if (showResult) return;

    if (isSE) {
      // SE: toggle selection, max 2
      const current = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
      const idx = current.indexOf(optionId);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else if (current.length < 2) {
        current.push(optionId);
      }
      onSelectAnswer(current);
    } else {
      onSelectAnswer(optionId);
    }
  };

  const isSelected = (optionId: string) => {
    if (Array.isArray(selectedAnswer)) return selectedAnswer.includes(optionId);
    return selectedAnswer === optionId;
  };

  const diffInfo = DIFFICULTY_LEVELS[question.difficulty];

  return (
    <div className="space-y-4">
      {/* Difficulty badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {diffInfo?.label || `Level ${question.difficulty}`}
        </span>
        {question.skills.map(skillId => (
          <span key={skillId} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {SKILLS[skillId]?.name || skillId}
          </span>
        ))}
      </div>

      {/* Passage (for RC) */}
      {passage && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 sm:p-6 max-h-[300px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Passage</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{passage.text}</p>
        </div>
      )}

      {/* Question stem */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <p className="text-base sm:text-lg leading-relaxed">{question.stem}</p>
        {isSE && (
          <p className="text-xs text-muted-foreground mt-2">Select exactly two answers.</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option) => {
          const selected = isSelected(option.id);
          const isOptionCorrect = option.correct;

          let optionClass = "border-border hover:border-primary/50 cursor-pointer";

          if (showResult) {
            if (isOptionCorrect) {
              optionClass = "border-success bg-success/10";
            } else if (selected && !isOptionCorrect) {
              optionClass = "border-destructive bg-destructive/10";
            } else {
              optionClass = "border-border opacity-60";
            }
          } else if (selected) {
            optionClass = "border-primary bg-primary/10";
          }

          return (
            <motion.div
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={cn(
                "flex items-start gap-3 p-3 sm:p-4 rounded-xl border transition-all",
                optionClass,
                showResult && "cursor-default"
              )}
              whileHover={!showResult ? { scale: 1.01 } : undefined}
              whileTap={!showResult ? { scale: 0.99 } : undefined}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
                selected && !showResult && "bg-primary text-primary-foreground",
                !selected && !showResult && "bg-muted text-muted-foreground",
                showResult && isOptionCorrect && "bg-success text-white",
                showResult && selected && !isOptionCorrect && "bg-destructive text-white",
                showResult && !selected && !isOptionCorrect && "bg-muted text-muted-foreground"
              )}>
                {showResult && isOptionCorrect ? (
                  <Check className="h-4 w-4" />
                ) : showResult && selected && !isOptionCorrect ? (
                  <X className="h-4 w-4" />
                ) : (
                  option.id
                )}
              </div>
              <span className="text-sm sm:text-base leading-relaxed pt-0.5">{option.text}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Result feedback */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Correct/Incorrect banner */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
          )}>
            {isCorrect ? (
              <Check className="h-5 w-5 text-success shrink-0" />
            ) : (
              <X className="h-5 w-5 text-destructive shrink-0" />
            )}
            <p className={cn("font-medium", isCorrect ? "text-success" : "text-destructive")}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-foreground">Explanation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>

              {/* Skill-specific explanation */}
              {Object.entries(question.skillExplanation).map(([skillId, explanation]) => (
                <div key={skillId} className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-primary mb-1">{SKILLS[skillId]?.name || skillId}</p>
                  <p className="text-sm text-muted-foreground">{explanation}</p>
                </div>
              ))}

              {/* Trap analysis for selected wrong answer */}
              {!isCorrect && selectedAnswer && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <p className="text-xs font-medium text-orange-500">Why your answer was tempting</p>
                  </div>
                  {(() => {
                    const answerId = Array.isArray(selectedAnswer) ? selectedAnswer[0] : selectedAnswer;
                    const trapExpl = question.trapAnalysis[answerId];
                    return trapExpl ? (
                      <p className="text-sm text-muted-foreground">{trapExpl}</p>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
