import { FlashcardWithProgress } from '@/hooks/useFlashcardsDb';

export function getSynonymCards(card: FlashcardWithProgress, allCards: FlashcardWithProgress[]): FlashcardWithProgress[] {
    return allCards.filter(c => {
        if (c.id === card.id) return false;
        const isSynonymOfCard = card.synonyms?.some(s => s.toLowerCase() === c.word.toLowerCase());
        const cardIsSynonymOfC = c.synonyms?.some(s => s.toLowerCase() === card.word.toLowerCase());
        return isSynonymOfCard || cardIsSynonymOfC;
    });
}

export function getAntonymCards(card: FlashcardWithProgress, allCards: FlashcardWithProgress[]): FlashcardWithProgress[] {
    return allCards.filter(c => {
        if (c.id === card.id) return false;
        const isAntonymOfCard = card.antonyms?.some(a => a.toLowerCase() === c.word.toLowerCase());
        const cardIsAntonymOfC = c.antonyms?.some(a => a.toLowerCase() === card.word.toLowerCase());
        return isAntonymOfCard || cardIsAntonymOfC;
    });
}

export function getRelatedRootCards(card: FlashcardWithProgress, allCards: FlashcardWithProgress[]): FlashcardWithProgress[] {
    return allCards.filter(c => {
        if (c.id === card.id) return false;
        const myRoots = card.related_roots || [];
        const otherRoots = c.related_roots || [];
        
        // Check for shared roots
        const shareRoot = myRoots.some(root => 
            otherRoots.some(otherRoot => otherRoot.toLowerCase() === root.toLowerCase())
        );
        
        // Also check if one word is the root of the other
        const isRootOfCard = myRoots.some(r => r.toLowerCase() === c.word.toLowerCase());
        
        return shareRoot || isRootOfCard;
    });
}
