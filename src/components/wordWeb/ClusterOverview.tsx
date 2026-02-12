import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Network, Zap, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllClusters } from '@/data/wordRelationships/index';
import { getMasteryLevel } from '@/utils/clusterMastery';
import type { WordCluster } from '@/data/wordRelationships/types';

interface ClusterOverviewProps {
  clusterMastery: Record<string, number>;
  onSelectCluster: (clusterId: string) => void;
}

export function ClusterOverview({ clusterMastery, onSelectCluster }: ClusterOverviewProps) {
  const [clusters, setClusters] = useState<WordCluster[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClusters().then(data => {
      setClusters(data);
      setLoading(false);
    });
  }, []);

  const filtered = search.trim()
    ? clusters.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.concept.toLowerCase().includes(search.toLowerCase()) ||
          c.words.some(w => w.includes(search.toLowerCase()))
      )
    : clusters;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{clusters.length}</p>
          <p className="text-xs text-muted-foreground">Clusters</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {new Set(clusters.flatMap(c => c.words)).size}
          </p>
          <p className="text-xs text-muted-foreground">Words</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {clusters.reduce((sum, c) => sum + c.relationships.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Connections</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clusters or words..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Cluster grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((cluster, i) => {
          const mastery = clusterMastery[cluster.id] ?? 0;
          const { label, color } = getMasteryLevel(mastery);
          const highRelevance = cluster.relationships.filter(r => r.greRelevance === 'high').length;

          return (
            <motion.button
              key={cluster.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectCluster(cluster.id)}
              className="relative bg-card border border-border rounded-xl p-4 text-left transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer group overflow-hidden"
            >
              {/* Progress bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500"
                  style={{ width: `${mastery * 100}%` }}
                />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cluster.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{cluster.concept}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium ${color}`}>{label}</span>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {cluster.words.length} words
                </span>
                {highRelevance > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="h-3 w-3" />
                    {highRelevance} high-GRE
                  </span>
                )}
                {cluster.commonConfusions.length > 0 && (
                  <span className="text-orange-400">
                    {cluster.commonConfusions.length} traps
                  </span>
                )}
              </div>

              {/* Word preview */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {cluster.words.slice(0, 6).map(w => (
                  <span
                    key={w}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                  >
                    {w}
                  </span>
                ))}
                {cluster.words.length > 6 && (
                  <span className="text-[10px] text-muted-foreground/60">
                    +{cluster.words.length - 6}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          No clusters match "{search}"
        </p>
      )}
    </div>
  );
}
