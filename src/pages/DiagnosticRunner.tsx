
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { getDiagnosticQuestions, analyzeDiagnostic, DiagnosticResult } from '@/services/diagnosticService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function DiagnosticRunner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const questions = getDiagnosticQuestions();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    // For single choice (TC/RC)
    if (currentQuestion.type !== 'SE' && currentQuestion.type !== 'TC' || currentQuestion.correctAnswer.length === 1) {
       setAnswers(prev => ({
         ...prev,
         [currentQuestion.id]: [index]
       }));
    } else {
      // For multi-select (SE) - Simplified for this demo (toggle)
      const current = answers[currentQuestion.id] || [];
      if (current.includes(index)) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: current.filter(i => i !== index)
        }));
      } else {
        // Limit to 2 for SE usually, but flexible here
        if (current.length < 2) {
          setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: [...current, index]
          }));
        }
      }
    }
  };

  const handleNext = async () => {
    // Record time for current question
    const duration = Date.now() - startTime;
    const updatedTimings = {
      ...timings,
      [currentQuestion.id]: duration
    };
    setTimings(updatedTimings);
    setStartTime(Date.now()); // Reset for next question

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await handleSubmit(updatedTimings);
    }
  };

  const handleSubmit = async (finalTimings: Record<string, number>) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const results = await analyzeDiagnostic(answers, finalTimings, user.id);
      setResult(results);
      
      // Save result to local storage to pass to results page if needed, 
      // or just render results here.
      // We'll render results in-place for simplicity.
      
    } catch (error) {
      toast({
        title: "Error submitting diagnostic",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  if (result) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="border-violet-200 dark:border-violet-800 shadow-lg">
          <CardHeader className="bg-violet-50 dark:bg-violet-900/20 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              <CardTitle className="text-2xl text-violet-900 dark:text-violet-100">Diagnostic Complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-violet-800 dark:text-violet-200">Assessment Summary</h3>
              <p className="text-muted-foreground leading-relaxed">
                {result.summary}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-200 font-semibold">
                  <AlertCircle className="h-5 w-5" />
                  Primary Focus
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {result.focusArea}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-200 font-semibold">
                  <ArrowRight className="h-5 w-5" />
                  Recommended Phase
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Phase {result.startingLearningPhase}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
               <p className="text-sm text-muted-foreground mb-4">
                 Your curriculum has been updated. The "Daily Tutor" will now guide you through this specific phase.
               </p>
               <Button onClick={handleComplete} className="w-full" size="lg">
                 Go to Dashboard
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 min-h-screen flex flex-col justify-center">
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Diagnostic Assessment</span>
          <span>Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-fit mb-2">
                {currentQuestion.type}
              </span>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.content}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id]?.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500 dark:bg-violet-900/30' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          h-5 w-5 rounded border flex items-center justify-center
                          ${isSelected 
                            ? 'bg-violet-600 border-violet-600 text-white' 
                            : 'border-slate-400'}
                        `}>
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span className="text-base">{option}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <Button 
                type="button"
                onClick={handleNext} 
                className="w-full ml-auto md:w-auto"
                disabled={!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0}
              >
                {currentIndex === questions.length - 1 ? (
                  isSubmitting ? 'Analyzing...' : 'Submit Assessment'
                ) : (
                  <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
