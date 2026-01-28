export interface SRSState {
    interval: number; // in minutes for short intervals, converted to days for longer ones
    ease_factor: number;
    repetitions: number;
}

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export const INITIAL_SRS_STATE: SRSState = {
    interval: 0,
    ease_factor: 2.5,
    repetitions: 0,
};

// Interval thresholds in minutes
const MINUTE = 1;
const HOUR = 60;
const DAY = 24 * 60; // 1440 minutes

export function calculateNextReview(
    rating: SRSRating,
    currentState: SRSState = INITIAL_SRS_STATE
): { state: SRSState; nextReviewDate: Date; intervalDisplay: string } {
    let { interval, ease_factor, repetitions } = currentState;

    // Calculate new interval based on rating
    if (rating === 'again') {
        // Reset - show again in 1 minute (for learning), or 10 minutes if was longer
        repetitions = 0;
        interval = interval > 10 ? 10 : 1; // 1-10 minutes
        ease_factor = Math.max(1.3, ease_factor - 0.2);
    } else if (rating === 'hard') {
        repetitions += 1;
        if (interval === 0) {
            interval = DAY; // 1 day
        } else if (interval < DAY) {
            interval = DAY; // 1 day
        } else {
            interval = Math.round(interval * 1.2);
        }
        ease_factor = Math.max(1.3, ease_factor - 0.15);
    } else if (rating === 'good') {
        repetitions += 1;
        if (interval === 0) {
            interval = DAY * 4; // 4 days
        } else if (interval < DAY) {
            interval = DAY * 4; // 4 days
        } else {
            interval = Math.round(interval * ease_factor);
        }
    } else if (rating === 'easy') {
        repetitions += 1;
        if (interval === 0) {
            interval = DAY * 7; // 7 days
        } else if (interval < DAY) {
            interval = DAY * 10; // 10 days
        } else {
            interval = Math.round(interval * ease_factor * 1.3);
        }
        ease_factor = Math.min(3.0, ease_factor + 0.15);
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + interval);

    // Generate human-readable interval display
    const intervalDisplay = formatInterval(interval);

    return {
        state: {
            interval,
            ease_factor,
            repetitions,
        },
        nextReviewDate,
        intervalDisplay,
    };
}

// Format interval for display
export function formatInterval(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    } else if (minutes < DAY) {
        const hours = Math.round(minutes / 60);
        return `${hours}h`;
    } else {
        const days = Math.round(minutes / DAY);
        return `${days}d`;
    }
}

// Get preview of what intervals each rating would give
export function getIntervalPreviews(currentState: SRSState = INITIAL_SRS_STATE): {
    again: string;
    hard: string;
    good: string;
    easy: string;
} {
    return {
        again: calculateNextReview('again', currentState).intervalDisplay,
        hard: calculateNextReview('hard', currentState).intervalDisplay,
        good: calculateNextReview('good', currentState).intervalDisplay,
        easy: calculateNextReview('easy', currentState).intervalDisplay,
    };
}
