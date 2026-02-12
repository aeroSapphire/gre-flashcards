import type {
  WordCluster,
  WordRelationship,
  RelationshipType,
  ConfusionPair,
  CrossClusterRelationship,
  RootFamily,
  ClusterDrill,
} from './types';
import type { WordNetworkData } from './wordExtension';

// Lazy-loaded cluster cache
let clustersCache: WordCluster[] | null = null;
let crossClusterCache: CrossClusterRelationship[] | null = null;
let rootFamiliesCache: RootFamily[] | null = null;

// All cluster imports - add new clusters here as batches are generated
const clusterImports = [
  () => import('./clusters/cluster_spending.json'),
  () => import('./clusters/cluster_speech.json'),
  () => import('./clusters/cluster_praise.json'),
  () => import('./clusters/cluster_stubbornness.json'),
  () => import('./clusters/cluster_deception.json'),
  () => import('./clusters/cluster_anger.json'),
  () => import('./clusters/cluster_confusions.json'),
  () => import('./clusters/cluster_change.json'),
  () => import('./clusters/cluster_clarity.json'),
  () => import('./clusters/cluster_enthusiasm.json'),
];

export async function getAllClusters(): Promise<WordCluster[]> {
  if (clustersCache) return clustersCache;
  const modules = await Promise.all(clusterImports.map(fn => fn()));
  clustersCache = modules.map(m => (m as { default: WordCluster }).default ?? m as unknown as WordCluster);
  return clustersCache;
}

export async function getCrossClusterRelationships(): Promise<CrossClusterRelationship[]> {
  if (crossClusterCache) return crossClusterCache;
  try {
    const mod = await import('./crossCluster.json');
    crossClusterCache = (mod.default ?? mod) as unknown as CrossClusterRelationship[];
  } catch {
    crossClusterCache = [];
  }
  return crossClusterCache;
}

export async function getRootFamilies(): Promise<RootFamily[]> {
  if (rootFamiliesCache) return rootFamiliesCache;
  try {
    const mod = await import('./rootFamilies.json');
    rootFamiliesCache = (mod.default ?? mod) as unknown as RootFamily[];
  } catch {
    rootFamiliesCache = [];
  }
  return rootFamiliesCache;
}

// 1. Get the cluster a word belongs to
export async function getClusterForWord(word: string): Promise<WordCluster | null> {
  const clusters = await getAllClusters();
  const lower = word.toLowerCase();
  return clusters.find(c => c.words.includes(lower)) ?? null;
}

// 2. Get all relationships involving a word
export async function getRelationshipsForWord(word: string): Promise<WordRelationship[]> {
  const cluster = await getClusterForWord(word);
  if (!cluster) return [];
  const lower = word.toLowerCase();
  const intra = cluster.relationships.filter(
    r => r.wordA === lower || r.wordB === lower
  );
  // Also check cross-cluster relationships
  const cross = await getCrossClusterRelationships();
  const crossRels = cross.filter(r => r.wordA === lower || r.wordB === lower);
  return [...intra, ...crossRels];
}

// 3. Get words related to a given word, optionally filtered by type
export async function getRelatedWords(
  word: string,
  type?: RelationshipType
): Promise<string[]> {
  const rels = await getRelationshipsForWord(word);
  const lower = word.toLowerCase();
  const related = new Set<string>();
  for (const r of rels) {
    if (type && r.type !== type) continue;
    if (r.wordA === lower) related.add(r.wordB);
    else related.add(r.wordA);
  }
  return Array.from(related);
}

// 4. Get confusion pairs for a word
export async function getConfusionPairs(word: string): Promise<ConfusionPair[]> {
  const cluster = await getClusterForWord(word);
  if (!cluster) return [];
  const lower = word.toLowerCase();
  return cluster.commonConfusions.filter(
    cp => cp.words[0] === lower || cp.words[1] === lower
  );
}

// 5. Get intensity neighbors (weaker/stronger words on the scale)
export async function getIntensityNeighbors(
  word: string
): Promise<{ weaker: string[]; stronger: string[] } | null> {
  const cluster = await getClusterForWord(word);
  if (!cluster?.intensityScale) return null;

  const scale = cluster.intensityScale.words;
  const lower = word.toLowerCase();
  const idx = scale.findIndex(w => w.word === lower);
  if (idx === -1) return null;

  const position = scale[idx].position;
  const weaker = scale.filter(w => w.position < position).map(w => w.word);
  const stronger = scale.filter(w => w.position > position).map(w => w.word);
  return { weaker, stronger };
}

// 6. Get clusters sorted by GRE relevance (most high-relevance relationships first)
export async function getClustersByGRERelevance(): Promise<WordCluster[]> {
  const clusters = await getAllClusters();
  return [...clusters].sort((a, b) => {
    const scoreA = a.relationships.filter(r => r.greRelevance === 'high').length;
    const scoreB = b.relationships.filter(r => r.greRelevance === 'high').length;
    return scoreB - scoreA;
  });
}

// 7. Get extended network data for a word
export async function getWordNetworkData(word: string): Promise<WordNetworkData | null> {
  const cluster = await getClusterForWord(word);
  if (!cluster) return null;

  const lower = word.toLowerCase();
  const rels = cluster.relationships.filter(
    r => r.wordA === lower || r.wordB === lower
  );
  const confusions = cluster.commonConfusions
    .filter(cp => cp.words[0] === lower || cp.words[1] === lower)
    .flatMap(cp => cp.words.filter(w => w !== lower));

  // Check root families
  const roots = await getRootFamilies();
  let rootParts = null;
  for (const family of roots) {
    const entry = family.words.find(w => w.word === lower);
    if (entry) {
      rootParts = {
        prefix: null,
        root: { part: family.root, meaning: family.meaning },
        suffix: null,
        derivedFamily: family.words.map(w => w.word),
      };
      break;
    }
  }

  return {
    word: lower,
    clusterId: cluster.id,
    relationships: rels.map(r => `${r.wordA}-${r.type}-${r.wordB}`),
    rootParts,
    confusedWith: confusions,
    greFrequencyTier: rels.some(r => r.greRelevance === 'high') ? 1 : rels.some(r => r.greRelevance === 'medium') ? 2 : 3,
    contextNotes: '',
  };
}

// 8. Search clusters by name, concept, or contained words
export async function searchClusters(query: string): Promise<WordCluster[]> {
  const clusters = await getAllClusters();
  const lower = query.toLowerCase();
  return clusters.filter(
    c =>
      c.name.toLowerCase().includes(lower) ||
      c.concept.toLowerCase().includes(lower) ||
      c.words.some(w => w.includes(lower))
  );
}

// Get drills for a specific cluster
export async function getDrillsForCluster(clusterId: string): Promise<ClusterDrill[]> {
  const clusters = await getAllClusters();
  const cluster = clusters.find(c => c.id === clusterId);
  return cluster?.drills ?? [];
}

// Get a specific cluster by ID
export async function getClusterById(clusterId: string): Promise<WordCluster | null> {
  const clusters = await getAllClusters();
  return clusters.find(c => c.id === clusterId) ?? null;
}

// Get total stats
export async function getWordWebStats(): Promise<{
  totalClusters: number;
  totalWords: number;
  totalRelationships: number;
  totalDrills: number;
}> {
  const clusters = await getAllClusters();
  return {
    totalClusters: clusters.length,
    totalWords: new Set(clusters.flatMap(c => c.words)).size,
    totalRelationships: clusters.reduce((sum, c) => sum + c.relationships.length, 0),
    totalDrills: clusters.reduce((sum, c) => sum + c.drills.length, 0),
  };
}
