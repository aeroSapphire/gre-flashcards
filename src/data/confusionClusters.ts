export interface ConfusionCluster {
  id: string;
  name: string;
  description: string;
  words: string[];
}

export const CONFUSION_CLUSTERS: ConfusionCluster[] = [
  {
    id: 'ex-prefix',
    name: 'ex- Prefix Words',
    description: 'Words starting with "ex-" that have similar sounds but different meanings',
    words: ['exacerbate', 'exculpate', 'expostulate', 'expiate', 'extenuate'],
  },
  {
    id: 'ambiguous-ambivalent',
    name: 'Ambiguous vs Ambivalent',
    description: 'Ambiguous means unclear/open to interpretation; Ambivalent means having mixed feelings',
    words: ['ambiguous', 'ambivalent'],
  },
  {
    id: 'flaunt-flout',
    name: 'Flaunt vs Flout',
    description: 'Flaunt means to show off; Flout means to openly disregard rules',
    words: ['flaunt', 'flout'],
  },
  {
    id: 'tortuous-torturous',
    name: 'Tortuous vs Torturous',
    description: 'Tortuous means winding/complex; Torturous means causing torture/painful',
    words: ['tortuous', 'torturous'],
  },
  {
    id: 'amoral-immoral',
    name: 'Amoral vs Immoral',
    description: 'Amoral means lacking moral sense; Immoral means violating moral principles',
    words: ['amoral', 'immoral'],
  },
  {
    id: 'enervate-energize',
    name: 'Enervate vs Energize',
    description: 'Enervate means to weaken/drain energy (opposite of what it sounds like!)',
    words: ['enervate', 'energize'],
  },
  {
    id: 'perfunctory-peremptory',
    name: 'Perfunctory vs Peremptory',
    description: 'Perfunctory means routine/superficial; Peremptory means commanding/imperious',
    words: ['perfunctory', 'peremptory'],
  },
  {
    id: 'ingenious-ingenuous',
    name: 'Ingenious vs Ingenuous',
    description: 'Ingenious means clever/inventive; Ingenuous means innocent/naive',
    words: ['ingenious', 'ingenuous'],
  },
  {
    id: 'disinterested-uninterested',
    name: 'Disinterested vs Uninterested',
    description: 'Disinterested means impartial/unbiased; Uninterested means not interested',
    words: ['disinterested', 'uninterested'],
  },
  {
    id: 'compliment-complement',
    name: 'Compliment vs Complement',
    description: 'Compliment means praise; Complement means to complete or enhance',
    words: ['compliment', 'complement'],
  },
  {
    id: 'prescribe-proscribe',
    name: 'Prescribe vs Proscribe',
    description: 'Prescribe means to recommend/order; Proscribe means to forbid/prohibit',
    words: ['prescribe', 'proscribe'],
  },
  {
    id: 'elicit-illicit',
    name: 'Elicit vs Illicit',
    description: 'Elicit means to draw out/evoke; Illicit means illegal/forbidden',
    words: ['elicit', 'illicit'],
  },
  {
    id: 'principal-principle',
    name: 'Principal vs Principle',
    description: 'Principal means main/chief (or school head); Principle means a rule or standard',
    words: ['principal', 'principle'],
  },
  {
    id: 'discreet-discrete',
    name: 'Discreet vs Discrete',
    description: 'Discreet means careful/tactful; Discrete means separate/distinct',
    words: ['discreet', 'discrete'],
  },
  {
    id: 'affect-effect',
    name: 'Affect vs Effect',
    description: 'Affect is usually a verb (to influence); Effect is usually a noun (a result)',
    words: ['affect', 'effect'],
  },
  {
    id: 'eminent-imminent-immanent',
    name: 'Eminent vs Imminent vs Immanent',
    description: 'Eminent means distinguished; Imminent means about to happen; Immanent means inherent/indwelling',
    words: ['eminent', 'imminent', 'immanent'],
  },
  {
    id: 'venal-venial',
    name: 'Venal vs Venial',
    description: 'Venal means corrupt/bribable; Venial means minor/pardonable (sin)',
    words: ['venal', 'venial'],
  },
  {
    id: 'penurious-pernicious',
    name: 'Penurious vs Pernicious',
    description: 'Penurious means extremely poor/stingy; Pernicious means harmful/destructive',
    words: ['penurious', 'pernicious'],
  },
  {
    id: 'reticent-reluctant',
    name: 'Reticent vs Reluctant',
    description: 'Reticent means reserved/uncommunicative; Reluctant means unwilling/hesitant',
    words: ['reticent', 'reluctant'],
  },
  {
    id: 'diffuse-defuse',
    name: 'Diffuse vs Defuse',
    description: 'Diffuse means to spread out; Defuse means to remove tension/danger',
    words: ['diffuse', 'defuse'],
  },
];

// Helper function to find which cluster a word belongs to
export function findClusterForWord(word: string): ConfusionCluster | null {
  const lowerWord = word.toLowerCase();
  return CONFUSION_CLUSTERS.find(cluster =>
    cluster.words.some(w => w.toLowerCase() === lowerWord)
  ) || null;
}

// Helper to get all words from all clusters
export function getAllConfusedWords(): string[] {
  return CONFUSION_CLUSTERS.flatMap(cluster => cluster.words);
}
