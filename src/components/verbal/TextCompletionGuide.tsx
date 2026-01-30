import { PenLine, Target, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TextCompletionGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TextCompletionGuide = ({ open, onOpenChange }: TextCompletionGuideProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PenLine className="h-5 w-5 text-primary" />
            Text Completion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overview */}
          <section>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              What It Tests
            </h3>
            <p className="text-sm text-muted-foreground">
              Text Completion questions test your ability to interpret and evaluate the meaning of sentences
              and passages. You must fill in blanks with words that complete the passage coherently and meaningfully.
            </p>
          </section>

          {/* Structure */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Question Structure</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-foreground text-sm">Single Blank</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  1-5 sentences with one blank. Choose from 5 answer choices.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-foreground text-sm">Double Blank</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  1-5 sentences with two blanks. Each blank has 3 independent answer choices.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-foreground text-sm">Triple Blank</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  A short passage with three blanks. Each blank has 3 independent answer choices.
                </p>
              </div>
            </div>
          </section>

          {/* Scoring Warning */}
          <section>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Important: No Partial Credit
              </h3>
              <p className="text-sm text-muted-foreground">
                For questions with multiple blanks, you must answer ALL blanks correctly to receive credit.
                There is no partial credit. This makes careful reading and systematic checking essential.
              </p>
            </div>
          </section>

          {/* Strategies */}
          <section>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Key Strategies
            </h3>
            <div className="space-y-3">
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Read for Overall Meaning First</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Before looking at the choices, read the entire passage to understand its overall meaning and tone.
                  Don't focus on the blanks during your first read.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Identify Signal Words</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Look for structural words that indicate relationships: "however," "although," "therefore,"
                  "moreover," "in contrast." These reveal whether you need similar or contrasting words.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Predict Before Looking</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Try to predict the type of word needed before examining the choices. This prevents you
                  from being misled by attractive but incorrect options.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Consider All Blanks Together</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  For multi-blank questions, the blanks often relate to each other. An answer that works
                  for one blank might not work when you consider the others.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Verify Your Complete Answer</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  After selecting all answers, read the completed passage. Does it make logical sense?
                  Does the tone remain consistent throughout?
                </p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Don't just match words - match meanings and logic
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Start with the blank that seems easiest to you
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Be wary of answer choices that seem too obvious
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Pay attention to positive/negative tone shifts
              </li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
