import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWordWeb } from '@/hooks/useWordWeb';
import { useFlashcardsDb } from '@/hooks/useFlashcardsDb';
import { ClusterOverview } from '@/components/wordWeb/ClusterOverview';
import { ClusterDetail } from '@/components/wordWeb/ClusterDetail';
import { ClusterDrillSession } from '@/components/wordWeb/ClusterDrillSession';
import { calculateClusterMastery } from '@/utils/clusterMastery';
import { getClusterById } from '@/data/wordRelationships/index';
import type { DrillResult } from '@/utils/clusterMastery';

type ViewMode = 'overview' | 'cluster-detail' | 'drill-session' | 'analytics';

const WordWeb = () => {
  const navigate = useNavigate();
  const { cards: flashcards } = useFlashcardsDb();
  const {
    state,
    visitCluster,
    exploreWord,
    recordDrill,
    recordConfusion,
    updateClusterMastery,
  } = useWordWeb();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // Build learned words set from flashcards progress
  const learnedWords = new Set<string>();
  if (flashcards) {
    for (const fc of flashcards) {
      if (fc.status === 'learned') {
        learnedWords.add(fc.word.toLowerCase());
      }
    }
  }

  const handleSelectCluster = useCallback(
    (clusterId: string) => {
      setSelectedClusterId(clusterId);
      setViewMode('cluster-detail');
      visitCluster(clusterId);
    },
    [visitCluster]
  );

  const handleStartDrill = useCallback((clusterId: string) => {
    setSelectedClusterId(clusterId);
    setViewMode('drill-session');
  }, []);

  const handleDrillComplete = useCallback(
    async (results: { clusterId: string; answers: { drillId: string; correct: boolean; wordsInvolved: string[] }[]; accuracy: number }) => {
      // Record each drill result
      for (const answer of results.answers) {
        const drillResult: DrillResult = {
          clusterId: results.clusterId,
          drillId: answer.drillId,
          correct: answer.correct,
          timestamp: new Date().toISOString(),
          wordsInvolved: answer.wordsInvolved,
        };
        recordDrill(drillResult);

        // Record confusions for incorrect answers
        if (!answer.correct && answer.wordsInvolved.length >= 2) {
          recordConfusion(answer.wordsInvolved[0], answer.wordsInvolved[1]);
        }
      }

      // Recalculate mastery
      const cluster = await getClusterById(results.clusterId);
      if (cluster && state) {
        const mastery = calculateClusterMastery(
          results.clusterId,
          cluster.words,
          learnedWords,
          [...state.drillHistory, ...results.answers.map(a => ({
            clusterId: results.clusterId,
            drillId: a.drillId,
            correct: a.correct,
            timestamp: new Date().toISOString(),
            wordsInvolved: a.wordsInvolved,
          }))],
          state.confusionMatrix,
          cluster.commonConfusions.length
        );
        updateClusterMastery(results.clusterId, mastery.overall);
      }

      setViewMode('cluster-detail');
    },
    [state, learnedWords, recordDrill, recordConfusion, updateClusterMastery]
  );

  const handleDrillConfusion = useCallback(
    (wordA: string, wordB: string, clusterId: string) => {
      // Start a targeted confusion drill
      setSelectedClusterId(clusterId);
      setViewMode('drill-session');
    },
    []
  );

  const handleBack = useCallback(() => {
    if (viewMode === 'cluster-detail') {
      setViewMode('overview');
      setSelectedClusterId(null);
    } else if (viewMode === 'drill-session') {
      setViewMode('cluster-detail');
    } else if (viewMode === 'analytics') {
      setViewMode('overview');
    } else {
      navigate(-1);
    }
  }, [viewMode, navigate]);

  // Render based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'overview':
        return (
          <ClusterOverview
            clusterMastery={state?.clusterMastery ?? {}}
            onSelectCluster={handleSelectCluster}
          />
        );

      case 'cluster-detail':
        if (!selectedClusterId) return null;
        return (
          <ClusterDetail
            clusterId={selectedClusterId}
            clusterMastery={state?.clusterMastery[selectedClusterId] ?? 0}
            learnedWords={learnedWords}
            onBack={() => {
              setViewMode('overview');
              setSelectedClusterId(null);
            }}
            onStartDrill={handleStartDrill}
            onDrillConfusion={handleDrillConfusion}
          />
        );

      case 'drill-session':
        if (!selectedClusterId) return null;
        return (
          <ClusterDrillSession
            clusterId={selectedClusterId}
            onBack={() => setViewMode('cluster-detail')}
            onComplete={handleDrillComplete}
          />
        );

      case 'analytics':
        return (
          <div className="text-center text-muted-foreground py-20">
            <p>Analytics coming soon</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setViewMode('overview')}>
              Back to Overview
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewMode === 'overview' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Word Web</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {state.clustersVisited.length} clusters explored
              </span>
            )}
            {viewMode === 'overview' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('analytics')}
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                Stats
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-5xl mx-auto px-3 sm:px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default WordWeb;
