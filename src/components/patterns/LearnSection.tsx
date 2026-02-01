import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PatternModule } from '@/data/rcPatterns';

interface LearnSectionProps {
  module: PatternModule;
}

export function LearnSection({ module }: LearnSectionProps) {
  return (
    <div className="space-y-6">
      {/* Definition */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-2">Definition</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {module.definition}
        </p>
      </section>

      <Separator />

      {/* Functions */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Function in GRE Passages</h3>
        <ul className="space-y-2">
          {module.functions.map((fn, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary font-medium">{index + 1}.</span>
              <span>{fn}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* Signal Words */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Signal Words and Cues</h3>
        <div className="space-y-4">
          {module.signalWords.map((category, index) => (
            <Card key={index} className="bg-muted/30">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {category.words.map((word, wordIndex) => (
                    <Badge
                      key={wordIndex}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Example Passage */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Example Passage</h3>
        <Card className="bg-muted/30 border-l-4 border-l-primary">
          <CardContent className="py-4 px-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {module.examplePassage}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
