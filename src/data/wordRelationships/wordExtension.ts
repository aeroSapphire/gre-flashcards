export interface WordNetworkData {
  word: string;
  clusterId: string;
  relationships: string[];
  rootParts: RootDecomposition | null;
  confusedWith: string[];
  greFrequencyTier: 1 | 2 | 3;
  contextNotes: string;
}

export interface RootDecomposition {
  prefix: { part: string; meaning: string } | null;
  root: { part: string; meaning: string };
  suffix: { part: string; meaning: string } | null;
  derivedFamily: string[];
}
