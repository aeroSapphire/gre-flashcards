import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, Link2 } from 'lucide-react';
import { FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { getSynonymCards, getAntonymCards, getRelatedRootCards } from '@/utils/wordConnections';

interface WordConnectionsProps {
    card: FlashcardWithProgress;
    allCards: FlashcardWithProgress[];
    compact?: boolean;
    showEtymology?: boolean;
}

export function WordConnections({ card, allCards, compact = false, showEtymology = true }: WordConnectionsProps) {
    const synonymCards = getSynonymCards(card, allCards);
    const antonymCards = getAntonymCards(card, allCards);
    const relatedRootCards = getRelatedRootCards(card, allCards);

    const hasConnections = synonymCards.length > 0 || antonymCards.length > 0 || relatedRootCards.length > 0 || (showEtymology && card.etymology);

    if (!hasConnections) return null;

    if (compact) {
        return (
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {showEtymology && card.etymology && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                        📚 {card.etymology.slice(0, 50)}{card.etymology.length > 50 ? '...' : ''}
                    </span>
                )}
                {synonymCards.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        ≈ {synonymCards.map(c => c.word).join(', ')}
                    </span>
                )}
                {antonymCards.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        ≠ {antonymCards.map(c => c.word).join(', ')}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-dashed border-border/50 space-y-3">
            {/* Etymology */}
            {showEtymology && card.etymology && (
                <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                        <GitBranch className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Origin</p>
                        <p className="text-sm text-foreground/80 font-mono leading-relaxed">{card.etymology}</p>
                    </div>
                </div>
            )}

            {/* Synonyms */}
            {synonymCards.length > 0 && (
                <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 mt-0.5">
                        <Link2 className="h-3.5 w-3.5 text-green-700 dark:text-green-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Similar Words</p>
                        <div className="flex flex-wrap gap-1.5">
                            {synonymCards.map(c => (
                                <span
                                    key={c.id}
                                    className="text-sm px-2 py-0.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                    title={c.definition}
                                >
                                    {c.word}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Antonyms */}
            {antonymCards.length > 0 && (
                <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 mt-0.5">
                        <ArrowRight className="h-3.5 w-3.5 text-red-700 dark:text-red-300 rotate-180" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Opposites</p>
                        <div className="flex flex-wrap gap-1.5">
                            {antonymCards.map(c => (
                                <span
                                    key={c.id}
                                    className="text-sm px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    title={c.definition}
                                >
                                    {c.word}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Related Roots */}
            {relatedRootCards.length > 0 && (
                <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 mt-0.5">
                        <GitBranch className="h-3.5 w-3.5 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Same Root</p>
                        <div className="flex flex-wrap gap-1.5">
                            {relatedRootCards.map(c => (
                                <span
                                    key={c.id}
                                    className="text-sm px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                    title={c.definition}
                                >
                                    {c.word}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
