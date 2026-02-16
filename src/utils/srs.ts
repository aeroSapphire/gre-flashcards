export type SRSRating = 'fail' | 'hard' | 'easy';

export interface SRSState {
    interval: number; // in minutes
    ease_factor: number;
    repetitions: number;
    consecutive_failures: number;
    consecutive_success: number;
    last_grade: SRSRating | null;
}

export const INITIAL_SRS_STATE: SRSState = {
    interval: 0,
    ease_factor: 2.1,
    repetitions: 0,
    consecutive_failures: 0,
    consecutive_success: 0,
    last_grade: null,
};

// Interval thresholds in minutes
const DAY = 24 * 60; // 1440 minutes

export function calculateNextReview(
    rating: SRSRating,
    currentState: SRSState = INITIAL_SRS_STATE
): { state: SRSState; nextReviewDate: Date; intervalDisplay: string } {
    let { interval, ease_factor, repetitions, consecutive_failures, consecutive_success, last_grade } = currentState;

    if (rating === 'fail') {
        repetitions = 0;
        interval = interval >= DAY ? 10 : 1;
        ease_factor = Math.max(1.3, ease_factor - 0.2);
        if (consecutive_failures >= 2) {
            ease_factor = Math.max(1.3, ease_factor - 0.05);
        }
        consecutive_failures += 1;
        consecutive_success = 0;
    } else if (rating === 'hard') {
        repetitions += 1;
        if (interval < DAY) {
            interval = DAY;
        } else {
            if (last_grade === 'fail') {
                interval = Math.round(interval * 1.2);
            } else {
                interval = Math.round(interval * ease_factor);
            }
        }
        // ease_factor unchanged for hard
        consecutive_failures = 0;
        consecutive_success = 0;
    } else if (rating === 'easy') {
        repetitions += 1;
        if (interval < DAY) {
            interval = DAY * 4;
        } else {
            interval = Math.round(interval * ease_factor * 1.3);
            if (consecutive_success >= 3) {
                interval = Math.round(interval * 1.1);
            }
        }
        ease_factor = Math.min(3.0, ease_factor + 0.15);
        consecutive_failures = 0;
        consecutive_success += 1;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + interval);

    const intervalDisplay = formatInterval(interval);

    return {
        state: {
            interval,
            ease_factor,
            repetitions,
            consecutive_failures,
            consecutive_success,
            last_grade: rating,
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
    fail: string;
    hard: string;
    easy: string;
} {
    return {
        fail: calculateNextReview('fail', currentState).intervalDisplay,
        hard: calculateNextReview('hard', currentState).intervalDisplay,
        easy: calculateNextReview('easy', currentState).intervalDisplay,
    };
}
