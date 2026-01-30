import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuestionTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  testCount: number;
  onLearn: () => void;
  onPractice: () => void;
}

export const QuestionTypeCard = ({
  icon: Icon,
  title,
  description,
  testCount,
  onLearn,
  onPractice,
}: QuestionTypeCardProps) => {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {testCount} practice {testCount === 1 ? 'test' : 'tests'} available
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onLearn}>
            Learn Strategies
          </Button>
          <Button className="flex-1" onClick={onPractice} disabled={testCount === 0}>
            Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
