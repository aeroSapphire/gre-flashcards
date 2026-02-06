import { FlashcardWithProgress } from '@/hooks/useFlashcardsDb';

export interface ExportOptions {
  includeProgress?: boolean;
  includeExamples?: boolean;
  includeEtymology?: boolean;
  includeTags?: boolean;
}

/**
 * Export flashcards to CSV format
 */
export function exportToCSV(
  cards: FlashcardWithProgress[],
  options: ExportOptions = {}
): string {
  const {
    includeProgress = true,
    includeExamples = true,
    includeEtymology = false,
    includeTags = true,
  } = options;

  // Build headers
  const headers = ['Word', 'Definition', 'Part of Speech'];

  if (includeProgress) {
    headers.push('Status', 'Next Review', 'Times Reviewed');
  }
  if (includeExamples) {
    headers.push('Example');
  }
  if (includeEtymology) {
    headers.push('Etymology');
  }
  if (includeTags) {
    headers.push('Tags');
  }

  // Build rows
  const rows = cards.map((card) => {
    const row: string[] = [
      escapeCSV(card.word),
      escapeCSV(card.definition),
      escapeCSV(card.part_of_speech || ''),
    ];

    if (includeProgress) {
      row.push(
        card.status,
        card.next_review_at ? new Date(card.next_review_at).toLocaleDateString() : '',
        String(card.repetition || 0)
      );
    }
    if (includeExamples) {
      row.push(escapeCSV(card.example || ''));
    }
    if (includeEtymology) {
      row.push(escapeCSV(card.etymology || ''));
    }
    if (includeTags) {
      row.push(escapeCSV((card.tags || []).join(', ')));
    }

    return row;
  });

  // Combine headers and rows
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Export flashcards to JSON format
 */
export function exportToJSON(
  cards: FlashcardWithProgress[],
  options: ExportOptions = {}
): string {
  const {
    includeProgress = true,
    includeExamples = true,
    includeEtymology = false,
    includeTags = true,
  } = options;

  const exportData = cards.map((card) => {
    const data: Record<string, any> = {
      word: card.word,
      definition: card.definition,
      part_of_speech: card.part_of_speech || null,
    };

    if (includeProgress) {
      data.status = card.status;
      data.next_review_at = card.next_review_at || null;
      data.times_reviewed = card.repetition || 0;
    }
    if (includeExamples) {
      data.example = card.example || null;
    }
    if (includeEtymology) {
      data.etymology = card.etymology || null;
    }
    if (includeTags) {
      data.tags = card.tags || [];
    }

    return data;
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate a progress summary report
 */
export function generateProgressReport(cards: FlashcardWithProgress[]): string {
  const total = cards.length;
  const newCount = cards.filter((c) => c.status === 'new').length;
  const learningCount = cards.filter((c) => c.status === 'learning').length;
  const learnedCount = cards.filter((c) => c.status === 'learned').length;

  const dueNow = cards.filter(
    (c) =>
      c.status === 'learned' &&
      c.next_review_at &&
      new Date(c.next_review_at) <= new Date()
  ).length;

  const lines = [
    '=== GRE Vocabulary Progress Report ===',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '--- Summary ---',
    `Total Words: ${total}`,
    `New: ${newCount} (${Math.round((newCount / total) * 100)}%)`,
    `Learning: ${learningCount} (${Math.round((learningCount / total) * 100)}%)`,
    `Mastered: ${learnedCount} (${Math.round((learnedCount / total) * 100)}%)`,
    `Due for Review: ${dueNow}`,
    '',
    '--- Progress Bar ---',
    generateProgressBar(learnedCount / total),
    '',
  ];

  // Add top words by review count
  const topReviewed = [...cards]
    .filter((c) => (c.repetition || 0) > 0)
    .sort((a, b) => (b.repetition || 0) - (a.repetition || 0))
    .slice(0, 10);

  if (topReviewed.length > 0) {
    lines.push('--- Most Reviewed Words ---');
    topReviewed.forEach((card, i) => {
      lines.push(`${i + 1}. ${card.word} (${card.repetition} reviews) - ${card.status}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper to escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Helper to generate a text-based progress bar
function generateProgressBar(ratio: number, width = 40): string {
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${Math.round(ratio * 100)}%`;
}
