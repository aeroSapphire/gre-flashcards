import type { MockTestRegistryEntry, NamedMockTest } from './types';

export type { NamedMockTest, MockTestRegistryEntry, MockTestSection, MockTestQuestion } from './types';

/**
 * Registry of all available named mock tests.
 * Tests are lazy-loaded to keep the initial bundle small.
 */
export const MOCK_TEST_REGISTRY: MockTestRegistryEntry[] = [
  {
    id: 'barrons-test-1',
    name: "Barron's Practice Test 1",
    source: "Barron's 6 GRE Practice Tests",
    sourceShort: "Barron's",
    description: 'Full-length GRE practice test with AW, 2 Verbal, and 2 Quant sections.',
    sectionCount: 5,
    totalTimeMinutes: 160,
    format: 'old',
    questionCount: 81,
    load: () => import('./barrons_test_1.json').then(m => m.default || m) as Promise<NamedMockTest>,
  },
  {
    id: 'barrons-test-2',
    name: "Barron's Practice Test 2",
    source: "Barron's 6 GRE Practice Tests",
    sourceShort: "Barron's",
    description: 'Full-length GRE practice test with AW, 2 Verbal, and 2 Quant sections.',
    sectionCount: 5,
    totalTimeMinutes: 160,
    format: 'old',
    questionCount: 81,
    load: () => import('./barrons_test_2.json').then(m => m.default || m) as Promise<NamedMockTest>,
  },
  {
    id: 'barrons-test-3',
    name: "Barron's Practice Test 3",
    source: "Barron's 6 GRE Practice Tests",
    sourceShort: "Barron's",
    description: 'Full-length GRE practice test with AW, 2 Verbal, and 2 Quant sections.',
    sectionCount: 5,
    totalTimeMinutes: 160,
    format: 'old',
    questionCount: 81,
    load: () => import('./barrons_test_3.json').then(m => m.default || m) as Promise<NamedMockTest>,
  },
  {
    id: 'barrons-test-4',
    name: "Barron's Practice Test 4",
    source: "Barron's 6 GRE Practice Tests",
    sourceShort: "Barron's",
    description: 'Full-length GRE practice test with AW, 2 Verbal, and 2 Quant sections.',
    sectionCount: 5,
    totalTimeMinutes: 160,
    format: 'old',
    questionCount: 81,
    load: () => import('./barrons_test_4.json').then(m => m.default || m) as Promise<NamedMockTest>,
  },
  {
    id: 'barrons-test-5',
    name: "Barron's Practice Test 5",
    source: "Barron's 6 GRE Practice Tests",
    sourceShort: "Barron's",
    description: 'Full-length GRE practice test with AW, 2 Verbal, and 2 Quant sections.',
    sectionCount: 5,
    totalTimeMinutes: 160,
    format: 'old',
    questionCount: 81,
    load: () => import('./barrons_test_5.json').then(m => m.default || m) as Promise<NamedMockTest>,
  },
  {
    id: 'barrons-test-6',
    name: "Barron's Practice Test 6",
    source: "Barron's 6 GRE Practice Tests",
    sourceShort: "Barron's",
    description: 'Full-length GRE practice test with AW, 2 Verbal, and 2 Quant sections.',
    sectionCount: 5,
    totalTimeMinutes: 160,
    format: 'old',
    questionCount: 81,
    load: () => import('./barrons_test_6.json').then(m => m.default || m) as Promise<NamedMockTest>,
  },
];

/**
 * Get a mock test by ID
 */
export function getMockTestById(id: string): MockTestRegistryEntry | undefined {
  return MOCK_TEST_REGISTRY.find(t => t.id === id);
}

/**
 * Get all mock tests grouped by source
 */
export function getMockTestsBySource(): Record<string, MockTestRegistryEntry[]> {
  const grouped: Record<string, MockTestRegistryEntry[]> = {};
  for (const test of MOCK_TEST_REGISTRY) {
    if (!grouped[test.source]) grouped[test.source] = [];
    grouped[test.source].push(test);
  }
  return grouped;
}
