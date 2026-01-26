export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example?: string;
  status: 'new' | 'learning' | 'learned';
  createdAt: number;
  lastReviewedAt?: number;
  listId?: string;
}

export interface FlashcardList {
  id: string;
  name: string;
  createdAt: number;
}
