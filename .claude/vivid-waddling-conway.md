# Curriculum Orchestrator: Internal State Logic Plan

## Vision
Create a lightweight orchestration layer that systematizes the app like a GRE tutor would teach - using internal state logic to prioritize content, practice types, and feedback based on the user's current learning phase and dominant mistake patterns. **No new pages or UI-heavy components** - just smart recommendations surfaced through existing features.

---

## Learning Phases (Pedagogical Progression)

A GRE tutor teaches in a specific order because certain skills build on others. The 10 mistake types naturally form a learning progression:

```
Phase 0: CALIBRATION
   │   Entry: < 20 total questions OR average sigma > 12
   │   Exit:  20+ questions AND average sigma < 12
   │   Focus: Take any tests to establish baseline
   ▼
Phase 1: POLARITY MASTERY
   │   Entry: Calibration complete
   │   Exit:  POLARITY_ERROR mu >= 65 AND DOUBLE_NEGATIVE_CONFUSION mu >= 60
   │   Focus: POLARITY_ERROR, DOUBLE_NEGATIVE_CONFUSION
   │   Why first: Most basic error - confusing positive/negative meaning
   ▼
Phase 2: INTENSITY & VOCABULARY
   │   Entry: Phase 1 exit criteria met
   │   Exit:  INTENSITY_MISMATCH mu >= 65 AND PARTIAL_SYNONYM_TRAP mu >= 60
   │   Focus: INTENSITY_MISMATCH, PARTIAL_SYNONYM_TRAP
   │   Why second: Requires word knowledge + degree sensitivity
   ▼
Phase 3: SCOPE & LOGIC
   │   Entry: Phase 2 exit criteria met
   │   Exit:  SCOPE_ERROR mu >= 65 AND LOGICAL_CONTRADICTION mu >= 60
   │   Focus: SCOPE_ERROR, LOGICAL_CONTRADICTION
   │   Why third: Builds on polarity awareness, adds reasoning
   ▼
Phase 4: CONTEXT & TONE
   │   Entry: Phase 3 exit criteria met
   │   Exit:  TONE_REGISTER_MISMATCH mu >= 65 AND CONTEXT_MISREAD mu >= 60 AND TEMPORAL_ERROR mu >= 60
   │   Focus: TONE_REGISTER_MISMATCH, CONTEXT_MISREAD, TEMPORAL_ERROR
   │   Why fourth: Requires all previous skills + passage comprehension
   ▼
Phase 5: ELIMINATION MASTERY
   │   Entry: Phase 4 exit criteria met
   │   Exit:  ELIMINATION_FAILURE mu >= 70
   │   Focus: ELIMINATION_FAILURE
   │   Why fifth: Process skill that combines all content skills
   ▼
Phase 6: TEST READINESS
      Entry: Phase 5 exit criteria met
      Ongoing: All skills >= 65, practice mixed tests
      Focus: Speed, stamina, all question types mixed
```

---

## Entry/Exit Criteria (Quantitative)

Using existing signals from the database:

| Signal | Source | Usage |
|--------|--------|-------|
| `mu` | `user_skills.mu` | Ability estimate (0-100) |
| `sigma` | `user_skills.sigma` | Uncertainty (2-20), high = needs practice |
| `correct_count` | `user_skills.correct_count` | Practice volume |
| `incorrect_count` | `user_skills.incorrect_count` | Error volume |
| `last_practice_at` | `user_skills.last_practice_at` | Recency (decay factor) |
| `weighted_mistakes` | `user_mistakes` + recency | Dominant weakness pattern |

### Phase Transition Logic

```typescript
interface PhaseStatus {
  currentPhase: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  phaseProgress: number;        // 0-100% toward exit criteria
  dominantWeakness: SkillType;  // Current priority skill
  blockedBy: SkillType[];       // Skills preventing phase advancement
  recommendation: Recommendation;
}

// Exit criteria expressed as mu thresholds
const PHASE_EXIT_CRITERIA = {
  0: { minQuestions: 20, maxAvgSigma: 12 },
  1: { POLARITY_ERROR: 65, DOUBLE_NEGATIVE_CONFUSION: 60 },
  2: { INTENSITY_MISMATCH: 65, PARTIAL_SYNONYM_TRAP: 60 },
  3: { SCOPE_ERROR: 65, LOGICAL_CONTRADICTION: 60 },
  4: { TONE_REGISTER_MISMATCH: 65, CONTEXT_MISREAD: 60, TEMPORAL_ERROR: 60 },
  5: { ELIMINATION_FAILURE: 70 },
  6: null // Ongoing maintenance
};
```

---

## Implementation: curriculumOrchestrator.ts

### Core Functions

```typescript
// 1. Determine current phase
function getCurrentPhase(skills: UserSkill[]): number

// 2. Calculate progress within current phase
function getPhaseProgress(skills: UserSkill[], phase: number): number

// 3. Get prioritized skill for current phase
function getPrioritySkillForPhase(skills: UserSkill[], phase: number): SkillType

// 4. Generate recommendation based on phase + skills
function getRecommendation(skills: UserSkill[], recentMistakes: Mistake[]): Recommendation

// 5. Main orchestrator function
async function getCurriculumStatus(): Promise<PhaseStatus>
```

### Recommendation Types

```typescript
interface Recommendation {
  type: 'weakness_practice' | 'test' | 'vocabulary' | 'mixed_practice';
  priority: 'high' | 'medium' | 'low';
  skillFocus?: SkillType;
  testId?: string;
  reason: string;           // Human-readable explanation
  estimatedBenefit: number; // 1-10 impact score
}
```

---

## Integration Points (Lightweight)

### 1. Homepage (Index.tsx)
**Current**: DailyTutor shows random nudge
**Change**: Replace with curriculum-aware recommendation

```typescript
// In Index.tsx, replace DailyTutor logic:
const { recommendation, currentPhase, phaseProgress } = useCurriculumStatus();

// Show: "Phase 2: Vocabulary & Precision (68% complete)"
// Show: "Recommended: Practice PARTIAL_SYNONYM_TRAP"
// Button: "Start Practice" → routes to /practice-weakness
```

### 2. TestResults (TestResults.tsx)
**Current**: Shows score and mistake analysis
**Change**: Add "What's Next?" based on curriculum state

```typescript
// After analyzeMistakes() completes:
const nextStep = await getRecommendation(updatedSkills, newMistakes);

// Show: "Based on this test, focus on: [skill]"
// Show: "You're in Phase 3: Scope & Logic"
// Button: "Practice This" → routes appropriately
```

### 3. WeaknessPractice (WeaknessPractice.tsx)
**Current**: Uses analyzeMistakes() to find dominant weakness
**Change**: Prefer phase-appropriate skill when no clear dominant

```typescript
// In findDominantWeakness():
const mistakeAnalysis = await analyzeMistakes();
if (!mistakeAnalysis.dominantWeakness) {
  // Fall back to curriculum phase priority
  return getPrioritySkillForPhase(skills, currentPhase);
}
```

### 4. DailyTutor (DailyTutor.tsx)
**Current**: Generates random AI nudge
**Change**: Use curriculum context for nudge generation

```typescript
// Include phase and priority skill in prompt:
const prompt = `User is in Phase ${phase}: ${phaseName}.
Their priority skill is ${prioritySkill}.
Generate a coaching nudge about this skill.`;
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/services/curriculumOrchestrator.ts` | Core phase logic and recommendations |
| `src/hooks/useCurriculumStatus.ts` | React hook for components |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Use curriculum recommendation instead of random nudge |
| `src/pages/TestResults.tsx` | Add "What's Next?" section after analysis |
| `src/pages/WeaknessPractice.tsx` | Fall back to phase skill when no dominant |
| `src/components/DailyTutor.tsx` | Include phase context in nudge generation |

### No New Database Tables
All data already exists in:
- `user_skills` (mu, sigma, counts, last_practice_at)
- `user_mistakes` (recent mistakes with timestamps)
- `user_test_attempts` (test history)

---

## Example Orchestrator Logic

```typescript
// curriculumOrchestrator.ts

export async function getCurriculumStatus(): Promise<PhaseStatus> {
  const skills = await getUserSkills();
  const mistakes = await getRecentMistakes(100);

  const totalQuestions = skills.reduce((sum, s) =>
    sum + (s.correct_count || 0) + (s.incorrect_count || 0), 0);
  const avgSigma = skills.reduce((sum, s) => sum + s.sigma, 0) / skills.length;

  // Phase 0: Calibration
  if (totalQuestions < 20 || avgSigma > 12) {
    return {
      currentPhase: 0,
      phaseProgress: Math.min(100, (totalQuestions / 20) * 100),
      dominantWeakness: getMostUncertainSkill(skills),
      blockedBy: [],
      recommendation: {
        type: 'test',
        priority: 'high',
        reason: 'Take tests to establish your baseline',
        estimatedBenefit: 10
      }
    };
  }

  // Check phase exit criteria sequentially
  const phase = determineCurrentPhase(skills);
  const phaseSkills = PHASE_SKILLS[phase];
  const blockedBy = phaseSkills.filter(skill =>
    getSkillMu(skills, skill) < PHASE_EXIT_CRITERIA[phase][skill]
  );

  // Find weakest skill within current phase
  const dominantWeakness = phaseSkills
    .sort((a, b) => getSkillMu(skills, a) - getSkillMu(skills, b))[0];

  return {
    currentPhase: phase,
    phaseProgress: calculatePhaseProgress(skills, phase),
    dominantWeakness,
    blockedBy,
    recommendation: generateRecommendation(phase, dominantWeakness, skills, mistakes)
  };
}
```

---

## User Experience (No Change to Freedom)

The curriculum orchestrator is **advisory only**:

1. **User can ignore recommendations** - All features remain fully accessible
2. **No locked content** - Tests, flashcards, arcade all work as before
3. **Soft guidance** - Homepage shows recommendation, user decides
4. **Progress visibility** - User sees phase/progress but isn't gated

This maintains the "tutor" feel (structured guidance) while preserving user autonomy.

---

## Verification

1. **Phase detection**: New user starts at Phase 0, progresses through phases
2. **Recommendations**: Recommendation changes based on skill levels
3. **Integration**: Homepage shows phase-aware suggestion
4. **Fallback**: WeaknessPractice uses phase skill when no dominant mistake
5. **No regression**: All existing features work unchanged

---

## Implementation Order

1. Create `curriculumOrchestrator.ts` with phase logic
2. Create `useCurriculumStatus.ts` hook
3. Update Index.tsx to show curriculum recommendation
4. Update TestResults.tsx with "What's Next?"
5. Update WeaknessPractice.tsx fallback logic
6. Update DailyTutor.tsx with phase context
