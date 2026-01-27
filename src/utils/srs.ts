export interface SRSState {
    interval: number; // in days
    ease_factor: number;
    repetitions: number;
}

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export const INITIAL_SRS_STATE: SRSState = {
    interval: 0,
    ease_factor: 2.5,
    repetitions: 0,
};

export function calculateNextReview(
    rating: SRSRating,
    currentState: SRSState = INITIAL_SRS_STATE
): { state: SRSState; nextReviewDate: Date } {
    let { interval, ease_factor, repetitions } = currentState;

    if (rating === 'again') {
        repetitions = 0;
        interval = 1; // Reset to 1 day
        ease_factor = Math.max(1.3, ease_factor - 0.2);
    } else if (rating === 'hard') {
        repetitions += 1;
        interval = interval === 0 ? 1 : interval * 1.2;
        ease_factor = Math.max(1.3, ease_factor - 0.15);
    } else if (rating === 'good') {
        repetitions += 1;
        if (interval === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * ease_factor);
        }
        // Ease factor stays the same for 'good'
    } else if (rating === 'easy') {
        repetitions += 1;
        if (interval === 0) {
            interval = 4;
        } else if (repetitions === 1) {
            interval = 10; // Jumpstart
        } else {
            interval = Math.round(interval * ease_factor * 1.3);
        }
        ease_factor += 0.15;
    }

    // Calculate specific date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    // Normalize to start of day potentially, but exact time is fine for now

    return {
        state: {
            interval,
            ease_factor,
            repetitions,
        },
        nextReviewDate,
    };
}
