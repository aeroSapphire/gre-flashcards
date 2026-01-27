import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, GraduationCap, Filter, ArrowLeft, LogOut, Settings, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFlashcardsDb, FlashcardWithProgress, FlashcardList } from '@/hooks/useFlashcardsDb';
import { useAuth } from '@/contexts/AuthContext';
import { FlashcardItem } from '@/components/FlashcardItem';
import { StudyMode } from '@/components/StudyMode';
import { StudyModeSelector } from '@/components/StudyModeSelector';
import { AddCardDialog } from '@/components/AddCardDialog';
import { StatsCard } from '@/components/StatsCard';
import { ListCard } from '@/components/ListCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterType = 'all' | 'new' | 'learning' | 'learned';
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
  } = useFlashcardsDb();

  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('lists');
  const [selectedList, setSelectedList] = useState<FlashcardList | null>(null);
  const [studyCards, setStudyCards] = useState<FlashcardWithProgress[]>([]);
  const [studyListName, setStudyListName] = useState<string | undefined>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardWithProgress | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const selectedListCards = useMemo(() => {
    if (!selectedList) return [];
    return getCardsForList(selectedList.id);
  }, [selectedList, getCardsForList]);

  const filteredCards = selectedListCards.filter((card) => {
    if (filter === 'all') return true;
    return card.status === filter;
  });

  const handleSelectList = (list: FlashcardList) => {
    setSelectedList(list);
    setViewMode('list-detail');
    setFilter('all');
  };

  const handleStartStudy = (selection: string[] | 'all') => {
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
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <StudyMode
            cards={studyCards}
            onMarkLearned={markAsLearned}
            onMarkLearning={markAsLearning}
            onExit={handleExitStudy}
            listName={studyListName}
          />
        </div>
      </div>
    );
  }

  // Study Selector
  if (viewMode === 'study-selector') {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
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
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('new')}>New</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('learning')}>Learning</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('learned')}>Mastered</DropdownMenuItem>
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
                      onMarkLearned={markAsLearned}
                      onMarkLearning={markAsLearning}
                      onReset={resetCard}
                      onDelete={deleteCard}
                      onEdit={(card) => {
                        setEditingCard(card);
                        setIsAddDialogOpen(true);
                      }}
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
    <div className="min-h-screen bg-background">
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
        {/* User info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{profile?.display_name || user?.email}</span>
        </div>

        {/* Overall Stats */}
        <div className="mb-8">
          <StatsCard stats={stats} />
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
                />
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
};

export default Index;
