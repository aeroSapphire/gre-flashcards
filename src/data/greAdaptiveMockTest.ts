// GRE Adaptive Mock Test — Question Data
// Arithmetic + Algebra only (Quant Reasoning)
// Matches real GRE format introduced September 2023

export type QuestionType = 'qc' | 'single' | 'multi' | 'numeric' | 'fraction';
export type QuestionCategory = 'qc' | 'problem-solving' | 'data-interpretation';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MockQuestion {
  id: string;
  type: QuestionType;
  category: QuestionCategory;
  topic: string;
  difficulty: Difficulty;
  /** Condition/given info shown above the question (for QC context) */
  condition?: string;
  /** Question stem text (for non-QC types) */
  stem?: string;
  /** Quantity A label (for QC) */
  quantityA?: string;
  /** Quantity B label (for QC) */
  quantityB?: string;
  /** Answer choices (for MC types) */
  options?: string[];
  /**
   * Correct answer:
   * - 'qc': 'A' | 'B' | 'C' | 'D'
   * - 'single': number (0-based index of correct option)
   * - 'multi': number[] (0-based indices of all correct options)
   * - 'numeric': string (the numeric answer)
   * - 'fraction': string 'numerator/denominator' (e.g. '6/25')
   */
  correctAnswer: string | number | number[];
  explanation: string;
}

// ─────────────────────────────────────────
// SECTION 1 — Standard (12 Questions)
// ─────────────────────────────────────────

export const section1Questions: MockQuestion[] = [
  // ── Quantitative Comparison (5 questions) ──
  {
    id: 'S1-Q1',
    type: 'qc',
    category: 'qc',
    topic: 'GCF with prime factorization',
    difficulty: 'medium',
    quantityA: 'GCF(180, 270)',
    quantityB: '100',
    correctAnswer: 'B',
    explanation:
      '180 = 2² × 3² × 5. 270 = 2 × 3³ × 5. GCF = 2 × 3² × 5 = 90. Since 90 < 100, Quantity B is greater.',
  },
  {
    id: 'S1-Q2',
    type: 'qc',
    category: 'qc',
    topic: 'Roots comparison',
    difficulty: 'easy',
    quantityA: '√150',
    quantityB: '12',
    correctAnswer: 'A',
    explanation:
      'Square both sides to compare: 150 vs 144. Since 150 > 144, √150 > 12. Quantity A is greater.',
  },
  {
    id: 'S1-Q3',
    type: 'qc',
    category: 'qc',
    topic: 'Even/odd exponents with negatives',
    difficulty: 'medium',
    condition: 'x is a negative integer.',
    quantityA: 'x³',
    quantityB: 'x²',
    correctAnswer: 'B',
    explanation:
      'x² is always positive for any non-zero x. x³ is always negative when x is negative. Therefore x² > x³ always. Quantity B is greater.',
  },
  {
    id: 'S1-Q4',
    type: 'qc',
    category: 'qc',
    topic: 'System of equations shortcut',
    difficulty: 'medium',
    condition: '5x + 3y = 29 and 3x + y = 13',
    quantityA: 'x + y',
    quantityB: '9',
    correctAnswer: 'B',
    explanation:
      'Subtract equation 2 from equation 1: (5x+3y) − (3x+y) = 29−13 → 2x+2y = 16 → x+y = 8. Since 8 < 9, Quantity B is greater.',
  },
  {
    id: 'S1-Q5',
    type: 'qc',
    category: 'qc',
    topic: 'Remainders and exponent cycles',
    difficulty: 'hard',
    quantityA: 'Remainder when 4⁸⁰ is divided by 7',
    quantityB: '3',
    correctAnswer: 'B',
    explanation:
      'Cycle of 4ⁿ mod 7: 4, 2, 1, 4, 2, 1... (period 3). 80 ÷ 3 = 26 remainder 2 → position 2 → remainder = 2. Since 2 < 3, Quantity B is greater.',
  },

  // ── Problem Solving (5 questions) ──
  {
    id: 'S1-Q6',
    type: 'single',
    category: 'problem-solving',
    topic: 'Trailing zeros in factorials',
    difficulty: 'easy',
    stem: 'How many trailing zeros does 85! have?',
    options: ['17', '19', '20', '21', '25'],
    correctAnswer: 2,
    explanation:
      '⌊85/5⌋ + ⌊85/25⌋ = 17 + 3 = 20. Each factor of 10 requires one factor of 2 and one of 5; factors of 5 are the bottleneck.',
  },
  {
    id: 'S1-Q7',
    type: 'single',
    category: 'problem-solving',
    topic: 'Work/rate — collaborative',
    difficulty: 'medium',
    stem: 'Machine A can complete a job in 8 hours. Machine B can complete the same job in 12 hours. Working together, how many hours will it take to complete the job?',
    options: ['4', '4.5', '4.8', '5', '6'],
    correctAnswer: 2,
    explanation:
      'Combined rate = 1/8 + 1/12 = 3/24 + 2/24 = 5/24 of the job per hour. Time = 24/5 = 4.8 hours.',
  },
  {
    id: 'S1-Q8',
    type: 'single',
    category: 'problem-solving',
    topic: 'Absolute value equations',
    difficulty: 'medium',
    stem: 'If |2x − 7| = 11, what is the product of all possible values of x?',
    options: ['−18', '−7', '7', '18', '−2'],
    correctAnswer: 0,
    explanation:
      'Case 1: 2x−7 = 11 → x = 9. Case 2: 2x−7 = −11 → x = −2. Product = 9 × (−2) = −18.',
  },
  {
    id: 'S1-Q9',
    type: 'numeric',
    category: 'problem-solving',
    topic: 'Consecutive integers',
    difficulty: 'easy',
    stem: 'Three consecutive even integers have a sum of 138. What is the largest of the three?',
    correctAnswer: '48',
    explanation:
      'Let the integers be n−2, n, n+2. Sum = 3n = 138 → n = 46. The largest is n+2 = 48.',
  },
  {
    id: 'S1-Q10',
    type: 'single',
    category: 'problem-solving',
    topic: 'Mixture problems',
    difficulty: 'medium',
    stem: '20 liters of a 25% acid solution is mixed with x liters of a 70% acid solution to produce a 40% solution. What is x?',
    options: ['8', '10', '12', '15', '20'],
    correctAnswer: 1,
    explanation:
      '0.25(20) + 0.70x = 0.40(20+x) → 5 + 0.7x = 8 + 0.4x → 0.3x = 3 → x = 10. Check: (5+7)/30 = 40% ✓',
  },

  // ── Data Interpretation / Numeric Entry (2 questions) ──
  {
    id: 'S1-Q11',
    type: 'numeric',
    category: 'data-interpretation',
    topic: 'Recursive sequences',
    difficulty: 'medium',
    stem: 'A sequence is defined by a₁ = 3 and aₙ = 2aₙ₋₁ + 1 for n ≥ 2. What is a₄?',
    correctAnswer: '31',
    explanation:
      'a₁ = 3. a₂ = 2(3)+1 = 7. a₃ = 2(7)+1 = 15. a₄ = 2(15)+1 = 31.',
  },
  {
    id: 'S1-Q12',
    type: 'numeric',
    category: 'data-interpretation',
    topic: 'Factor counting — odd factors',
    difficulty: 'hard',
    stem: 'How many odd factors does the number 2⁵ × 3² × 7 have?',
    correctAnswer: '6',
    explanation:
      'Odd factors ignore all powers of 2. The odd part = 3² × 7. Number of odd factors = (2+1)(1+1) = 6.',
  },
];

// ─────────────────────────────────────────
// SECTION 2 EASY (15 Questions)
// Served to users who score ≤ 7/12 on Section 1
// ─────────────────────────────────────────

export const section2EasyQuestions: MockQuestion[] = [
  // ── Quantitative Comparison (6 questions) ──
  {
    id: 'E-Q1',
    type: 'qc',
    category: 'qc',
    topic: 'Even exponents with negatives',
    difficulty: 'easy',
    quantityA: '(−2)⁶',
    quantityB: '2⁶',
    correctAnswer: 'C',
    explanation:
      '(−2)⁶ = 64 (even exponent makes it positive). 2⁶ = 64. They are equal.',
  },
  {
    id: 'E-Q2',
    type: 'qc',
    category: 'qc',
    topic: 'Decimal-fraction conversion',
    difficulty: 'easy',
    quantityA: '0.35',
    quantityB: '7/20',
    correctAnswer: 'C',
    explanation: '7/20 = 0.35. The two quantities are equal.',
  },
  {
    id: 'E-Q3',
    type: 'qc',
    category: 'qc',
    topic: 'Ratios',
    difficulty: 'easy',
    condition: 'The ratio of boys to girls in a class is 4:5. There are 36 students total.',
    quantityA: 'Number of girls',
    quantityB: '19',
    correctAnswer: 'A',
    explanation:
      'Girls = (5/9) × 36 = 20. Since 20 > 19, Quantity A is greater.',
  },
  {
    id: 'E-Q4',
    type: 'qc',
    category: 'qc',
    topic: 'Sum of integers formula',
    difficulty: 'easy',
    quantityA: 'Sum of integers from 1 to 40',
    quantityB: '800',
    correctAnswer: 'A',
    explanation:
      'Sum = 40 × 41 / 2 = 820. Since 820 > 800, Quantity A is greater.',
  },
  {
    id: 'E-Q5',
    type: 'qc',
    category: 'qc',
    topic: 'Percent change — base trap',
    difficulty: 'medium',
    quantityA: 'The percent decrease from 80 to 60',
    quantityB: 'The percent increase from 60 to 80',
    correctAnswer: 'B',
    explanation:
      'Percent decrease: (80−60)/80 = 25%. Percent increase: (80−60)/60 ≈ 33.3%. Different bases! 33.3% > 25%. Quantity B is greater.',
  },
  {
    id: 'E-Q6',
    type: 'qc',
    category: 'qc',
    topic: 'LCM',
    difficulty: 'easy',
    quantityA: 'LCM(15, 20, 24)',
    quantityB: '100',
    correctAnswer: 'A',
    explanation:
      '15 = 3×5. 20 = 2²×5. 24 = 2³×3. LCM = 2³×3×5 = 120. Since 120 > 100, Quantity A is greater.',
  },

  // ── Problem Solving (6 questions) ──
  {
    id: 'E-Q7',
    type: 'single',
    category: 'problem-solving',
    topic: 'Fraction equations',
    difficulty: 'easy',
    stem: '3/5 of a certain number is 45. What is the number?',
    options: ['27', '60', '72', '75', '80'],
    correctAnswer: 3,
    explanation: '(3/5)x = 45 → x = 45 × (5/3) = 75.',
  },
  {
    id: 'E-Q8',
    type: 'single',
    category: 'problem-solving',
    topic: 'Units digit cycle',
    difficulty: 'medium',
    stem: 'What is the units digit of 8⁴⁷?',
    options: ['2', '4', '6', '8', '0'],
    correctAnswer: 0,
    explanation:
      'Cycle of units digits of powers of 8: 8, 4, 2, 6 (period 4). 47 ÷ 4 = 11 remainder 3 → position 3 in the cycle = 2.',
  },
  {
    id: 'E-Q9',
    type: 'single',
    category: 'problem-solving',
    topic: 'Factor counting with prime factorization',
    difficulty: 'easy',
    stem: 'How many positive factors does 360 have?',
    options: ['12', '18', '20', '24', '36'],
    correctAnswer: 3,
    explanation:
      '360 = 2³ × 3² × 5. Number of factors = (3+1)(2+1)(1+1) = 4 × 3 × 2 = 24.',
  },
  {
    id: 'E-Q10',
    type: 'single',
    category: 'problem-solving',
    topic: 'Function evaluation',
    difficulty: 'easy',
    stem: 'If f(x) = 2x² − 3x + 1, what is f(3)?',
    options: ['7', '8', '10', '12', '16'],
    correctAnswer: 2,
    explanation: 'f(3) = 2(9) − 3(3) + 1 = 18 − 9 + 1 = 10.',
  },
  {
    id: 'E-Q11',
    type: 'single',
    category: 'problem-solving',
    topic: 'Simple interest',
    difficulty: 'easy',
    stem: '$3,000 is invested at 6% simple interest per year for 5 years. What is the total amount at the end?',
    options: ['$3,450', '$3,600', '$3,750', '$3,900', '$4,015'],
    correctAnswer: 3,
    explanation:
      'Simple Interest = 3000 × 0.06 × 5 = $900. Total = $3,000 + $900 = $3,900.',
  },
  {
    id: 'E-Q12',
    type: 'single',
    category: 'problem-solving',
    topic: 'Sum of integers in interval',
    difficulty: 'easy',
    stem: 'The sum of all integers from −8 to 12, inclusive, is:',
    options: ['38', '40', '42', '44', '46'],
    correctAnswer: 2,
    explanation:
      'Number of terms = 12 − (−8) + 1 = 21. Average = (−8+12)/2 = 2. Sum = 21 × 2 = 42.',
  },

  // ── Data Interpretation / Numeric Entry (3 questions) ──
  {
    id: 'E-Q13',
    type: 'single',
    category: 'data-interpretation',
    topic: 'Repeating decimals',
    difficulty: 'easy',
    stem: 'The repeating decimal 0.454545... is equal to which fraction?',
    options: ['9/20', '45/100', '5/11', '9/22', '45/110'],
    correctAnswer: 2,
    explanation:
      'Let x = 0.454545... → 100x = 45.4545... → 99x = 45 → x = 45/99 = 5/11.',
  },
  {
    id: 'E-Q14',
    type: 'numeric',
    category: 'data-interpretation',
    topic: "Vieta's formulas / quadratic roots",
    difficulty: 'easy',
    stem: 'If x² − 9x + 20 = 0, what is the sum of all solutions?',
    correctAnswer: '9',
    explanation:
      "By Vieta's formulas, sum of roots = −(−9)/1 = 9. Or factor: (x−4)(x−5) = 0 → roots are 4 and 5. Sum = 4+5 = 9.",
  },
  {
    id: 'E-Q15',
    type: 'numeric',
    category: 'data-interpretation',
    topic: 'Distance = rate × time',
    difficulty: 'easy',
    stem: 'A car travels at 60 mph for 2.5 hours, then at 40 mph for 1.5 hours. What is the total distance traveled, in miles?',
    correctAnswer: '210',
    explanation:
      'Distance = 60 × 2.5 + 40 × 1.5 = 150 + 60 = 210 miles.',
  },
];

// ─────────────────────────────────────────
// SECTION 2 HARD (15 Questions)
// Served to users who score ≥ 8/12 on Section 1
// ─────────────────────────────────────────

export const section2HardQuestions: MockQuestion[] = [
  // ── Quantitative Comparison (6 questions) ──
  {
    id: 'H-Q1',
    type: 'qc',
    category: 'qc',
    topic: 'Factor counting comparison',
    difficulty: 'medium',
    quantityA: 'Number of positive factors of 720',
    quantityB: 'Number of positive factors of 2⁵ × 3²',
    correctAnswer: 'A',
    explanation:
      '720 = 2⁴×3²×5 → (4+1)(2+1)(1+1) = 30 factors. 2⁵×3² → (5+1)(2+1) = 18 factors. Since 30 > 18, Quantity A is greater.',
  },
  {
    id: 'H-Q2',
    type: 'qc',
    category: 'qc',
    topic: 'Units digit cycles — comparison',
    difficulty: 'hard',
    quantityA: 'Units digit of 3²⁰',
    quantityB: 'Units digit of 7²⁰',
    correctAnswer: 'C',
    explanation:
      '3 cycle: 3,9,7,1 (period 4). 20 ÷ 4 = 5 R0 → units digit = 1. 7 cycle: 7,9,3,1 (period 4). 20 ÷ 4 = 5 R0 → units digit = 1. Both equal 1. The quantities are equal.',
  },
  {
    id: 'H-Q3',
    type: 'qc',
    category: 'qc',
    topic: 'GCF × LCM = product identity',
    difficulty: 'hard',
    condition: 'GCF(n, 84) = 14 and LCM(n, 84) = 420',
    quantityA: 'n',
    quantityB: '65',
    correctAnswer: 'A',
    explanation:
      'Using the identity: GCF × LCM = product of the two numbers. So n × 84 = 14 × 420 = 5880. n = 5880/84 = 70. Since 70 > 65, Quantity A is greater.',
  },
  {
    id: 'H-Q4',
    type: 'qc',
    category: 'qc',
    topic: 'Successive percent changes',
    difficulty: 'hard',
    condition: 'A price is increased by 20%, then decreased by 15%, then increased by 10%.',
    quantityA: 'The final price as a percent of the original',
    quantityB: '112%',
    correctAnswer: 'A',
    explanation:
      'Net multiplier = 1.20 × 0.85 × 1.10 = 1.122. Final price = 112.2% of original. Since 112.2% > 112%, Quantity A is greater.',
  },
  {
    id: 'H-Q5',
    type: 'qc',
    category: 'qc',
    topic: 'Composite functions',
    difficulty: 'hard',
    condition: 'f(x) = x² − 6x + 8 and g(x) = x + 2',
    quantityA: 'f(g(3))',
    quantityB: 'g(f(3))',
    correctAnswer: 'A',
    explanation:
      'g(3) = 5. f(g(3)) = f(5) = 25−30+8 = 3. f(3) = 9−18+8 = −1. g(f(3)) = g(−1) = −1+2 = 1. Since 3 > 1, Quantity A is greater.',
  },
  {
    id: 'H-Q6',
    type: 'qc',
    category: 'qc',
    topic: 'Inclusion-exclusion with divisibility',
    difficulty: 'hard',
    quantityA: 'The number of integers from 1 to 300 divisible by 4 or 6 but NOT both',
    quantityB: '80',
    correctAnswer: 'B',
    explanation:
      'Divisible by 4: ⌊300/4⌋ = 75. Divisible by 6: ⌊300/6⌋ = 50. Divisible by both (LCM=12): ⌊300/12⌋ = 25. Only by 4: 75−25 = 50. Only by 6: 50−25 = 25. Total = 50+25 = 75. Since 75 < 80, Quantity B is greater.',
  },

  // ── Problem Solving (6 questions) ──
  {
    id: 'H-Q7',
    type: 'single',
    category: 'problem-solving',
    topic: 'Factorial divisibility with prime power bottleneck',
    difficulty: 'hard',
    stem: 'What is the smallest positive integer n such that n! is divisible by 4,050?',
    options: ['9', '10', '12', '15', '25'],
    correctAnswer: 1,
    explanation:
      '4050 = 2 × 3⁴ × 5². Need 3⁴ and 5² in n!. In 9!: factors of 5 = ⌊9/5⌋ = 1 (need 2). In 10!: factors of 5 = ⌊10/5⌋ = 2 ✓, factors of 3 = ⌊10/3⌋+⌊10/9⌋ = 3+1 = 4 ✓. Smallest n = 10.',
  },
  {
    id: 'H-Q8',
    type: 'single',
    category: 'problem-solving',
    topic: 'Exponent equations — matching bases',
    difficulty: 'medium',
    stem: 'If 2^(3x−1) = 4^(x+2), what is x?',
    options: ['2', '3', '4', '5', '6'],
    correctAnswer: 3,
    explanation:
      'Rewrite 4^(x+2) = (2²)^(x+2) = 2^(2x+4). Now set exponents equal: 3x−1 = 2x+4 → x = 5.',
  },
  {
    id: 'H-Q9',
    type: 'single',
    category: 'problem-solving',
    topic: 'Relative speed / upstream-downstream',
    difficulty: 'hard',
    stem: 'A boat travels at 12 mph in still water. The river current is 6 mph. The boat goes 36 miles upstream and 36 miles back downstream. What is the average speed for the entire trip?',
    options: ['8 mph', '9 mph', '10 mph', '10.5 mph', '12 mph'],
    correctAnswer: 1,
    explanation:
      'Upstream speed = 12−6 = 6 mph → time = 36/6 = 6 hrs. Downstream speed = 12+6 = 18 mph → time = 36/18 = 2 hrs. Average speed = total distance / total time = 72/8 = 9 mph. (Not 12 mph — the harmonic mean trap!)',
  },
  {
    id: 'H-Q10',
    type: 'single',
    category: 'problem-solving',
    topic: 'Compound interest',
    difficulty: 'medium',
    stem: '$8,000 is invested at 10% annual compound interest for 3 years. What is the total interest earned?',
    options: ['$2,400', '$2,480', '$2,648', '$2,800', '$2,928'],
    correctAnswer: 2,
    explanation:
      'A = 8000 × (1.10)³ = 8000 × 1.331 = $10,648. Interest = $10,648 − $8,000 = $2,648.',
  },
  {
    id: 'H-Q11',
    type: 'single',
    category: 'problem-solving',
    topic: 'Work/rate — workers leave midway',
    difficulty: 'hard',
    stem: '15 workers can finish a project in 24 days. After 6 days, 5 workers leave. How many more days will the remaining workers need to finish the project?',
    options: ['22', '24', '25', '27', '30'],
    correctAnswer: 3,
    explanation:
      'Total work = 15 × 24 = 360 worker-days. Work done in 6 days = 15 × 6 = 90 worker-days. Remaining work = 270 worker-days. Remaining workers = 10. Additional days = 270/10 = 27 days.',
  },
  {
    id: 'H-Q12',
    type: 'multi',
    category: 'problem-solving',
    topic: 'Absolute value quadratics',
    difficulty: 'hard',
    stem: 'Which of the following are integer solutions to |x² − 5x| = 6? Select all that apply.',
    options: ['−1', '2', '3', '6', '0'],
    correctAnswer: [0, 1, 2, 3],
    explanation:
      'Case 1: x²−5x = 6 → x²−5x−6 = 0 → (x−6)(x+1) = 0 → x = 6 or x = −1. Case 2: x²−5x = −6 → x²−5x+6 = 0 → (x−3)(x−2) = 0 → x = 3 or x = 2. Integer solutions: −1, 2, 3, 6. (0 is not a solution: |0−0| = 0 ≠ 6.)',
  },

  // ── Data Interpretation / Numeric Entry (3 questions) ──
  {
    id: 'H-Q13',
    type: 'fraction',
    category: 'data-interpretation',
    topic: 'Telescoping series',
    difficulty: 'hard',
    stem: '1/(2×4) + 1/(4×6) + 1/(6×8) + ... + 1/(48×50) = ?\n\nExpress your answer as a fraction.',
    correctAnswer: '6/25',
    explanation:
      'Use partial fractions: 1/(n(n+2)) = (1/2)(1/n − 1/(n+2)). Sum = (1/2)[(1/2−1/4) + (1/4−1/6) + ... + (1/48−1/50)] = (1/2)(1/2 − 1/50) = (1/2)(24/50) = 12/50 = 6/25.',
  },
  {
    id: 'H-Q14',
    type: 'numeric',
    category: 'data-interpretation',
    topic: 'Arithmetic series sum',
    difficulty: 'medium',
    stem: 'What is the sum of the first 20 terms of the arithmetic sequence: 5, 8, 11, 14, ...?',
    correctAnswer: '670',
    explanation:
      'a₁ = 5, d = 3, n = 20. S = (n/2)(2a₁ + (n−1)d) = (20/2)(10 + 57) = 10 × 67 = 670.',
  },
  {
    id: 'H-Q15',
    type: 'numeric',
    category: 'data-interpretation',
    topic: 'Work/rate — two fill, one drain',
    difficulty: 'hard',
    stem: 'Pipe A fills a tank in 6 hours. Pipe B fills it in 8 hours. Pipe C drains it in 12 hours. If all three are opened simultaneously, how many hours does it take to fill the tank? Express your answer as a decimal.',
    correctAnswer: '4.8',
    explanation:
      'Net rate = 1/6 + 1/8 − 1/12 = 4/24 + 3/24 − 2/24 = 5/24 per hour. Time = 24/5 = 4.8 hours.',
  },
];

// ─────────────────────────────────────────
// SCORING UTILITIES
// ─────────────────────────────────────────

export const PERCENTILE_TABLE: [number, number][] = [
  [170, 98],
  [167, 95],
  [165, 91],
  [163, 87],
  [160, 79],
  [157, 69],
  [155, 62],
  [152, 50],
  [149, 38],
  [146, 26],
  [143, 17],
  [140, 10],
];

/** Calculate scaled GRE score from raw score and section 2 difficulty */
export function calculateScaledScore(
  rawScore: number,
  section2Difficulty: 'easy' | 'hard'
): number {
  if (section2Difficulty === 'hard') {
    return 142 + Math.round((rawScore / 27) * 28);
  } else {
    return 130 + Math.round((rawScore / 27) * 24);
  }
}

/** Get approximate percentile from scaled score */
export function getPercentile(scaledScore: number): number {
  for (const [score, pct] of PERCENTILE_TABLE) {
    if (scaledScore >= score) return pct;
  }
  return 5;
}

/** Check if a user's answer is correct for a given question */
export function isAnswerCorrect(
  question: MockQuestion,
  userAnswer: string
): boolean {
  if (!userAnswer || userAnswer === '') return false;

  switch (question.type) {
    case 'qc':
      return userAnswer === question.correctAnswer;

    case 'single':
      return parseInt(userAnswer, 10) === question.correctAnswer;

    case 'multi': {
      const userIndices = userAnswer
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
      const correctIndices = [...(question.correctAnswer as number[])].sort(
        (a, b) => a - b
      );
      return JSON.stringify(userIndices) === JSON.stringify(correctIndices);
    }

    case 'numeric': {
      const parsed = parseFloat(userAnswer.replace(/,/g, ''));
      const expected = parseFloat(question.correctAnswer as string);
      return !isNaN(parsed) && Math.abs(parsed - expected) < 0.001;
    }

    case 'fraction': {
      const parts = userAnswer.split('/');
      if (parts.length !== 2) return false;
      const un = parseInt(parts[0].trim(), 10);
      const ud = parseInt(parts[1].trim(), 10);
      const [cn, cd] = (question.correctAnswer as string)
        .split('/')
        .map(Number);
      if (!ud || !cd || isNaN(un) || isNaN(ud)) return false;
      return un * cd === cn * ud;
    }

    default:
      return false;
  }
}

/** Shuffle an array of questions within each category block */
export function shuffleWithinBlocks(questions: MockQuestion[]): MockQuestion[] {
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const qcQs = shuffle(questions.filter((q) => q.category === 'qc'));
  const psQs = shuffle(questions.filter((q) => q.category === 'problem-solving'));
  const diQs = shuffle(
    questions.filter((q) => q.category === 'data-interpretation')
  );

  return [...qcQs, ...psQs, ...diQs];
}
