export type RelationshipType =
  | "synonym"
  | "near_synonym"
  | "antonym"
  | "stronger_than"
  | "weaker_than"
  | "formal_variant"
  | "commonly_confused"
  | "derived_from"
  | "category_sibling";

export interface WordRelationship {
  wordA: string;
  wordB: string;
  type: RelationshipType;
  shadeNote: string;
  greRelevance: "high" | "medium" | "low";
  bidirectional: boolean;
}

export interface WordCluster {
  id: string;
  name: string;
  concept: string;
  words: string[];
  relationships: WordRelationship[];
  intensityScale: IntensityScale | null;
  commonConfusions: ConfusionPair[];
  drills: ClusterDrill[];
}

export interface IntensityScale {
  dimension: string;
  poles: [string, string];
  words: {
    word: string;
    position: number;
    connotation: "positive" | "neutral" | "negative";
  }[];
}

export interface ConfusionPair {
  words: [string, string];
  whyConfused: string;
  mnemonic: string | null;
  exampleSentences: [string, string];
}

export interface ClusterDrill {
  id: string;
  type: DrillType;
  clusterId: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  options: DrillOption[];
  correctAnswer: string | string[];
  explanation: string;
}

export type DrillType =
  | "shade_distinction"
  | "intensity_ordering"
  | "odd_one_out"
  | "confusion_resolver"
  | "relationship_labeling"
  | "connotation_sorting";

export interface DrillOption {
  id: string;
  text: string;
}

export interface CrossClusterRelationship extends WordRelationship {
  clusterA: string;
  clusterB: string;
}

export interface RootFamily {
  root: string;
  meaning: string;
  origin: "Latin" | "Greek" | "Other";
  words: {
    word: string;
    breakdown: string;
    meaning: string;
  }[];
}
