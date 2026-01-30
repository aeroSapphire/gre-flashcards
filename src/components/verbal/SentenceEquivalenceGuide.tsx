import { GitCompare, Target, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SentenceEquivalenceGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SentenceEquivalenceGuide = ({ open, onOpenChange }: SentenceEquivalenceGuideProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GitCompare className="h-5 w-5 text-primary" />
            Sentence Equivalence
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
              Sentence Equivalence questions test your ability to reach a conclusion about how a passage
              should be completed. The key challenge is finding two answers that create sentences with
              equivalent meanings.
            </p>
          </section>

          {/* Structure */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Question Structure</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Format:</span>
                  Single sentence with one blank
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Choices:</span>
                  6 answer choices
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Required:</span>
                  Select exactly 2 answers
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Goal:</span>
                  Both answers must produce sentences with equivalent meaning
                </li>
              </ul>
            </div>
          </section>

          {/* Critical Understanding */}
          <section>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Critical Understanding
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                The two correct answers don't need to be synonyms of each other - they need to create
                sentences with the same overall meaning. Sometimes different words can complete a sentence
                in ways that convey the same idea.
              </p>
              <p className="text-sm text-muted-foreground">
                You must select <strong>exactly two</strong> answers. Selecting more or fewer will result
                in no credit.
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
                <h4 className="font-medium text-foreground text-sm">Don't Start with Synonyms</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  A common mistake is to look for two synonyms among the choices. Instead, focus on finding
                  two words that complete the sentence to give it the same meaning - these words may not be
                  synonyms at all.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Read for Overall Meaning</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  First understand what the sentence is trying to say. What idea or concept needs to fill
                  the blank? Then find two words that express that same concept.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Test Each Pair</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  After identifying potential pairs, read the sentence with each word. Do both versions
                  convey the same essential meaning? If one version changes the meaning, that pair is wrong.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Watch for Traps</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Test makers often include pairs of synonyms that don't fit the sentence context, or single
                  words that fit perfectly but have no equivalent partner.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Use Context Clues</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Look for hints in the sentence about whether the blank needs a positive, negative, or
                  neutral word. Signal words like "despite," "although," and "therefore" are especially helpful.
                </p>
              </div>
            </div>
          </section>

          {/* Common Pitfalls */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Common Pitfalls to Avoid</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">x</span>
                Picking two synonyms without checking if they fit the sentence
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">x</span>
                Selecting a word because it "sounds right" without verifying equivalence
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">x</span>
                Ignoring subtle connotation differences that change meaning
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">x</span>
                Rushing and not reading both completed sentences carefully
              </li>
            </ul>
          </section>

          {/* Tips */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Focus on meaning equivalence, not word similarity
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Predict the meaning of the blank before looking at choices
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Always verify by reading both completed sentences
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                If you can't find two equivalent meanings, reconsider your interpretation
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
