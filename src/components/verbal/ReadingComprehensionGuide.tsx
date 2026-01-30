import { X, BookOpen, Target, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReadingComprehensionGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReadingComprehensionGuide = ({ open, onOpenChange }: ReadingComprehensionGuideProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Reading Comprehension
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
              Reading Comprehension questions test your ability to understand, analyze, and evaluate written passages.
              These passages cover a wide range of subjects from physical and biological sciences to social sciences,
              business, arts, and everyday topics.
            </p>
          </section>

          {/* Skills Tested */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Skills Assessed</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Understanding the meaning of individual words and sentences
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Understanding the meaning of paragraphs and larger text bodies
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Distinguishing between major and minor points
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Summarizing passages and understanding structure
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Drawing conclusions from incomplete data
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Identifying author's assumptions and perspective
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Analyzing logical structure of arguments
              </li>
            </ul>
          </section>

          {/* Question Formats */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Question Formats</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-foreground text-sm">Multiple Choice - Select One</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Traditional format with 5 answer choices. Select the single best answer.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-foreground text-sm">Multiple Choice - Select Multiple</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Select all answers that apply from 3 choices. Must select ALL correct answers.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-foreground text-sm">Select-in-Passage</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Click on a sentence in the passage that meets a specific description.
                </p>
              </div>
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
                <h4 className="font-medium text-foreground text-sm">Read All Answer Choices</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Don't pick the first answer that seems right. Evaluate all choices to find the BEST answer.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Understand Context</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Words may be used in unexpected ways. Look for contextual clues rather than relying on
                  dictionary definitions.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Identify Main Ideas vs. Evidence</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Distinguish between the author's main arguments and the supporting details or examples.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Watch for Strong Language</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Answer choices with words like "always," "never," or "completely" are often incorrect.
                  Look for more nuanced options.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <h4 className="font-medium text-foreground text-sm">Return to the Passage</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Base your answers on what's stated or implied in the passage, not on outside knowledge.
                </p>
              </div>
            </div>
          </section>

          {/* Passage Types */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Common Passage Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['Physical Sciences', 'Biological Sciences', 'Social Sciences', 'Business', 'Arts & Humanities', 'Everyday Topics'].map((topic) => (
                <span key={topic} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {topic}
                </span>
              ))}
            </div>
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
