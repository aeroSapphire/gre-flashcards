import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, Timer, Trophy, Zap, Brain, Rocket, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type GameState = 'menu' | 'playing' | 'gameover';
type GameType = 'root-rush' | 'synonym-sprint' | 'definition-duel' | null;

interface Root {
  id: string;
  root: string;
  meaning: string;
}

export default function Arcade() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [activeGame, setActiveGame] = useState<GameType>(null);
  
  // Game Data
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [roots, setRoots] = useState<Root[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{
    root: Root;
    options: Root[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch roots when entering Root Rush
  useEffect(() => {
    if (activeGame === 'root-rush' && gameState === 'playing' && roots.length === 0) {
      fetchRoots();
    }
  }, [activeGame, gameState]);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const fetchRoots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('etymology_roots')
        .select('id, root, meaning')
        .limit(100);

      if (error) throw error;
      
      if (data) {
        setRoots(data);
        generateQuestion(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading game data",
        description: error.message,
        variant: "destructive"
      });
      setGameState('menu');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestion = (availableRoots: Root[]) => {
    if (availableRoots.length < 4) return;
    
    const targetIndex = Math.floor(Math.random() * availableRoots.length);
    const target = availableRoots[targetIndex];
    
    // Get 3 distractors
    const options = [target];
    while (options.length < 4) {
      const randomRoot = availableRoots[Math.floor(Math.random() * availableRoots.length)];
      if (!options.find(o => o.id === randomRoot.id)) {
        options.push(randomRoot);
      }
    }
    
    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    setCurrentQuestion({
      root: target,
      options: shuffledOptions
    });
  };

  const handleAnswer = (selectedRoot: Root) => {
    if (!currentQuestion) return;

    if (selectedRoot.id === currentQuestion.root.id) {
      // Correct
      setScore(prev => prev + 10);
      setTimeLeft(prev => Math.min(prev + 2, 60)); // Add 2 seconds, max 60
      toast({
        title: "Correct!",
        className: "bg-green-500 text-white border-none duration-500",
      });
    } else {
      // Incorrect
      setTimeLeft(prev => Math.max(prev - 5, 0)); // Penalty
      toast({
        title: "Wrong!",
        description: `Correct meaning: ${currentQuestion.root.meaning}`,
        variant: "destructive",
        className: "duration-1000"
      });
    }
    
    // Next question
    generateQuestion(roots);
  };

  const startGame = (game: GameType) => {
    setActiveGame(game);
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
  };

  const exitGame = () => {
    setGameState('menu');
    setActiveGame(null);
    setRoots([]);
  };

  // Render Game Over
  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="flex justify-center mb-6">
            <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black mb-2">Time's Up!</h2>
          <p className="text-muted-foreground mb-6">You scored</p>
          <div className="text-6xl font-black text-primary mb-8">{score}</div>
          
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={exitGame}>Exit</Button>
            <Button onClick={() => startGame(activeGame)}>Play Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render Active Game (Root Rush)
  if (gameState === 'playing' && activeGame === 'root-rush') {
    return (
      <div className="min-h-screen container max-w-4xl mx-auto p-4 py-8 flex flex-col">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={exitGame}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-mono font-bold text-xl">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
              <Progress value={(timeLeft / 60) * 100} className="w-32 h-2" />
              <span className={`font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          {loading || !currentQuestion ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestion.root.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full space-y-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground text-lg uppercase tracking-widest font-semibold">What is the meaning of</p>
                  <h1 className="text-6xl font-black text-primary mb-8">{currentQuestion.root.root}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-24 text-lg font-medium hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all"
                      onClick={() => handleAnswer(option)}
                    >
                      {option.meaning}
                    </Button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // Render Menu
  return (
    <div className="min-h-screen container max-w-5xl mx-auto p-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12 items-end">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            <Gamepad2 className="h-10 w-10 text-purple-500" />
            Word Arcade
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Take a break from flashcards. Play games to reinforce your neural pathways.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game 1: Root Rush */}
        <GameCard 
          title="Root Rush"
          description="Race against the clock to match roots to their meanings."
          icon={Zap}
          color="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          iconColor="text-yellow-500"
          onPlay={() => startGame('root-rush')}
        />

        {/* Game 2: Synonym Sprint (Coming Soon) */}
        <GameCard 
          title="Synonym Sprint"
          description="Find the synonym pairs before they disappear."
          icon={Rocket}
          color="bg-muted text-muted-foreground border-muted"
          iconColor="text-muted-foreground"
          disabled
        />

        {/* Game 3: Definition Duel (Coming Soon) */}
        <GameCard 
          title="Definition Duel"
          description="Challenge the AI to a definition standoff."
          icon={Brain}
          color="bg-muted text-muted-foreground border-muted"
          iconColor="text-muted-foreground"
          disabled
        />
      </div>
    </div>
  );
}

function GameCard({ title, description, icon: Icon, color, iconColor, onPlay, disabled }: any) {
  return (
    <motion.div whileHover={!disabled ? { y: -5 } : {}} whileTap={!disabled ? { scale: 0.98 } : {}}>
      <Card className={`h-full border-2 transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'}`} onClick={!disabled ? onPlay : undefined}>
        <CardHeader>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <CardTitle>{title} {disabled && <Badge variant="secondary" className="ml-2">Soon</Badge>}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full group" disabled={disabled} variant={disabled ? "outline" : "default"}>
            {disabled ? 'Coming Soon' : 'Play Now'} 
            {!disabled && <ArrowLeft className="h-4 w-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
