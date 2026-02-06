import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, GraduationCap, Filter, ArrowLeft, LogOut, Settings, Trophy, Clock, FileText, Gamepad2, Search, X, Flame, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFlashcardsDb, FlashcardWithProgress, FlashcardList } from '@/hooks/useFlashcardsDb';
import { useAuth } from '@/contexts/AuthContext';
import { useHardWords } from '@/hooks/useHardWords';
import { useMnemonics } from '@/hooks/useMnemonics';
import { useStreak } from '@/hooks/useStreak';
import { FlashcardItem } from '@/components/FlashcardItem';
import { StudyMode } from '@/components/StudyMode';
import { StudyModeSelector, StudyDirection } from '@/components/StudyModeSelector';
import { AddCardDialog } from '@/components/AddCardDialog';
import { StatsCard } from '@/components/StatsCard';
import { ListCard } from '@/components/ListCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterType = 'all' | 'new' | 'learning' | 'learned' | 'hard' | 'due';
type ViewMode = 'lists' | 'list-detail' | 'study-selector' | 'study';

const Index = () => {
  const {
    cards,
    lists,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    markAsLearned,
    markAsLearning,
    resetCard,
    renameList,
    getCardsForList,
    getListStats,
    stats,
    allUserStats,
    dueCards,
  } = useFlashcardsDb();

  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();
  const { hardWordIds, toggleHardWord, isHard } = useHardWords();
  const { getMnemonic, isGenerating, generateAndSaveMnemonic } = useMnemonics();
  const { currentStreak, longestStreak, isStudiedToday } = useStreak();

  const [viewMode, setViewMode] = useState<ViewMode>('lists');
  const [selectedList, setSelectedList] = useState<FlashcardList | null>(null);
  const [studyCards, setStudyCards] = useState<FlashcardWithProgress[]>([]);
  const [studyListName, setStudyListName] = useState<string | undefined>();
  const [studyDirection, setStudyDirection] = useState<StudyDirection>('standard');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardWithProgress | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const existingWords = useMemo(() => new Set(cards.map(c => c.word.toLowerCase())), [cards]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return cards.filter(card =>
      card.word.toLowerCase().includes(query) ||
      card.definition.toLowerCase().includes(query)
    );
  }, [cards, searchQuery]);

  const selectedListCards = useMemo(() => {
    if (!selectedList) return [];
    return getCardsForList(selectedList.id);
  }, [selectedList, getCardsForList]);

  const filteredCards = selectedListCards.filter((card) => {
    switch (filter) {
      case 'all':
        return true;
      case 'new':
      case 'learning':
      case 'learned':
        return card.status === filter;
      case 'hard':
        return isHard(card.id);
      case 'due':
        return card.status === 'learned' && card.next_review_at && new Date(card.next_review_at) <= new Date();
      default:
        return true;
    }
  });

  const handleSelectList = (list: FlashcardList) => {
    setSelectedList(list);
    setViewMode('list-detail');
    setFilter('all');
  };

  const handleStartStudy = (selection: string[] | 'all', direction: StudyDirection = 'standard') => {
    let cardsToStudy: FlashcardWithProgress[];
    let listName: string | undefined;

    if (selection === 'all') {
      cardsToStudy = cards;
      listName = 'All Cards';
    } else if (selection.length === 1) {
      const list = lists.find(l => l.id === selection[0]);
      cardsToStudy = getCardsForList(selection[0]);
      listName = list?.name;
    } else {
      cardsToStudy = selection.flatMap(listId => getCardsForList(listId));
      listName = `${selection.length} Lists`;
    }

    setStudyCards(cardsToStudy);
    setStudyListName(listName);
    setStudyDirection(direction);
    setViewMode('study');
  };

  const handleExitStudy = () => {
    setViewMode('lists');
    setStudyCards([]);
    setStudyListName(undefined);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Study Mode
  if (viewMode === 'study') {
    return (
      <div className="min-h-screen">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <StudyMode
            cards={studyCards}
            allCards={cards}
            onMarkLearned={markAsLearned}
            onMarkLearning={markAsLearning}
            onUpdateCard={updateCard}
            onExit={handleExitStudy}
            listName={studyListName}
            studyDirection={studyDirection}
            hardWordIds={hardWordIds}
            onToggleHard={(id, isHard) => toggleHardWord(id, isHard)}
            getMnemonic={getMnemonic}
            isGeneratingMnemonic={isGenerating}
            onGenerateMnemonic={generateAndSaveMnemonic}
          />
        </div>
      </div>
    );
  }

  // Study Selector
  if (viewMode === 'study-selector') {
    return (
      <div className="min-h-screen">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <StudyModeSelector
            lists={lists}
            getListStats={getListStats}
            onStart={handleStartStudy}
            onCancel={() => setViewMode('lists')}
            totalCards={cards.length}
          />
        </div>
      </div>
    );
  }

  // List Detail View
  if (viewMode === 'list-detail' && selectedList) {
    const listStats = getListStats(selectedList.id);

    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setViewMode('lists')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="font-display text-xl font-semibold text-foreground">
                    {selectedList.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">{listStats.total} words</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Word
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setStudyCards(selectedListCards);
                    setStudyListName(selectedList.name);
                    setViewMode('study');
                  }}
                  disabled={selectedListCards.length === 0}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Study
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8">
          {/* Stats for this list */}
          <div className="mb-8">
            <StatsCard stats={listStats} />
          </div>

          {/* Filter & Cards */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Cards in {selectedList.name}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'All' :
                   filter === 'hard' ? 'Hard Words' :
                   filter === 'due' ? 'Due for Review' :
                   filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>All Cards</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('new')}>New Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('learning')}>Learning</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('learned')}>Mastered</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('hard')}>Hard Words</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('due')}>Due for Review</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredCards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {filter === 'all' ? 'No flashcards in this list' : `No ${filter} cards`}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {filter === 'all'
                  ? 'Add words to start building this list.'
                  : 'Try changing the filter to see more cards.'}
              </p>
              {filter === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Word
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {filteredCards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <FlashcardItem
                      card={card}
                      allCards={cards}
                      onMarkLearned={markAsLearned}
                      onMarkLearning={markAsLearning}
                      onReset={resetCard}
                      onDelete={deleteCard}
                      onEdit={(card) => {
                        setEditingCard(card);
                        setIsAddDialogOpen(true);
                      }}
                      isHard={isHard(card.id)}
                      onToggleHard={(id, hard) => toggleHardWord(id, hard)}
                      mnemonic={getMnemonic(card.id)}
                      isGeneratingMnemonic={isGenerating(card.id)}
                      onGenerateMnemonic={() => generateAndSaveMnemonic(
                        card.id,
                        card.word,
                        card.definition,
                        card.part_of_speech,
                        card.etymology
                      )}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>

        <AddCardDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setEditingCard(null);
          }}
          onAdd={addCard}
          onUpdate={updateCard}
          editingCard={editingCard}
        />
      </div>
    );
  }

  // Lists View (default)
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  GRE Vocab
                </h1>
                <p className="text-xs text-muted-foreground">{stats.total} words • {lists.length} lists</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Word
              </Button>
              <Button size="sm" onClick={() => setViewMode('study-selector')} disabled={cards.length === 0}>
                <BookOpen className="h-4 w-4 mr-1" />
                Study
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tests')}>
                <Trophy className="h-4 w-4 mr-1" />
                Tests
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/arcade')}>
                <Gamepad2 className="h-4 w-4 mr-1" />
                Arcade
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/etymology')}>
                <GraduationCap className="h-4 w-4 mr-1" />
                Etymology
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/verbal')}>
                <FileText className="h-4 w-4 mr-1" />
                Verbal
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* User info and streak */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{profile?.display_name || user?.email}</span>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <Zap className={`h-4 w-4 ${isStudiedToday ? 'text-orange-500 fill-orange-500' : 'text-orange-400'}`} />
              <span className="font-bold text-orange-600">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
              {longestStreak > currentStreak && (
                <span className="text-xs text-muted-foreground">(best: {longestStreak})</span>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search words or definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Search Results
              </h2>
              <span className="text-sm text-muted-foreground">
                {searchResults.length} {searchResults.length === 1 ? 'word' : 'words'} found
              </span>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No words found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {searchResults.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <FlashcardItem
                        card={card}
                        allCards={cards}
                        onMarkLearned={markAsLearned}
                        onMarkLearning={markAsLearning}
                        onReset={resetCard}
                        onDelete={deleteCard}
                        onEdit={(card) => {
                          setEditingCard(card);
                          setIsAddDialogOpen(true);
                        }}
                        isHard={isHard(card.id)}
                        onToggleHard={(id, hard) => toggleHardWord(id, hard)}
                        mnemonic={getMnemonic(card.id)}
                        isGeneratingMnemonic={isGenerating(card.id)}
                        onGenerateMnemonic={() => generateAndSaveMnemonic(
                          card.id,
                          card.word,
                          card.definition,
                          card.part_of_speech,
                          card.etymology
                        )}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Main content - hidden during search */}
        {!searchQuery.trim() && (
          <>
            {/* Overall Stats */}
            <div className="mb-8">
              <StatsCard stats={stats} />
            </div>

            {/* Spaced Repetition Review */}
            {(dueCards.length > 0 || stats.learned > 0) && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Spaced Repetition Review
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {dueCards.length > 0
                        ? `${dueCards.length} card${dueCards.length === 1 ? '' : 's'} due for review`
                        : 'No cards due right now. Great job!'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/study')}
                  disabled={dueCards.length === 0}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {dueCards.length > 0 ? 'Start Review' : 'All Caught Up'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hard Words Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Hard Words Hub
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track difficult words, generate mnemonics, and master confusion clusters.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-600"
                onClick={() => navigate('/hard-words')}
              >
                <Flame className="h-4 w-4 mr-2" />
                View Hub
              </Button>
            </div>
          </div>
        </div>

        {/* Arcade Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Word Arcade
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reinforce your vocabulary with fast-paced mini-games.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-600"
                onClick={() => navigate('/arcade')}
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play Now
              </Button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {allUserStats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Leaderboard
              </h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="space-y-3">
                {allUserStats.map((userStat, index) => (
                  <div
                    key={userStat.profile.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${userStat.profile.id === user?.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-yellow-950' :
                        index === 1 ? 'bg-gray-400 text-gray-950' :
                          index === 2 ? 'bg-amber-600 text-amber-950' :
                            'bg-muted text-muted-foreground'
                        }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">
                        {userStat.profile.display_name}
                        {userStat.profile.id === user?.id && (
                          <span className="text-xs text-muted-foreground ml-1">(you)</span>
                        )}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-success">{userStat.learned}</span>
                      <span className="text-muted-foreground"> / {userStat.total} words</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lists Section */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Your Lists
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Words are automatically organized into lists of 30. Click a list to view and study its cards.
          </p>
        </div>

        {lists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No lists yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start by adding your first flashcard. Lists will be created automatically as you add words.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Word
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  stats={getListStats(list.id)}
                  onSelect={() => handleSelectList(list)}
                  onRename={(newName) => renameList(list.id, newName)}
                  onDelete={list.is_auto ? undefined : undefined}
                  isAutoList={list.is_auto}
                  onStartQuiz={() => {
                    const listCards = getCardsForList(list.id);
                    navigate('/quick-quiz', {
                      state: {
                        listName: list.name,
                        words: listCards.map(c => ({ word: c.word, definition: c.definition }))
                      }
                    });
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
          </>
        )}
      </main>

      <AddCardDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingCard(null);
        }}
        onAdd={addCard}
        onUpdate={updateCard}
        editingCard={editingCard}
        existingWords={existingWords}
      />
    </div>
  );
};

export default Index;
