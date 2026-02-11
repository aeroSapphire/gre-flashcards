import { BrainMap } from '@/data/brainMapSchema';
import { SKILLS, getSkillsByCategory } from '@/data/skillTaxonomy';
import { getWeakSkills, getSkillsNeedingReview } from '@/utils/brainMap';

export interface StudyRecommendation {
  type: "lesson" | "practice" | "test" | "review";
  skillId?: string;
  skillName?: string;
  category?: string;
  description: string;
  estimatedMinutes: number;
  priority: number; // 1 = highest
}

export interface StudyPlan {
  today: StudyRecommendation[];
  thisWeek: StudyRecommendation[];
  focusAreas: string[];
  overallMessage: string;
}

export function generateStudyPlan(brainMap: BrainMap): StudyPlan {
  const recommendations: StudyRecommendation[] = [];

  // 1. Find skills with incomplete lessons
  const allSkillIds = Object.keys(SKILLS).filter(id => !id.startsWith('TRAP-'));
  const incompleteLessons = allSkillIds.filter(id => !brainMap.lessonsCompleted[id]);

  for (const skillId of incompleteLessons.slice(0, 3)) {
    const skill = SKILLS[skillId];
    recommendations.push({
      type: "lesson",
      skillId,
      skillName: skill.name,
      category: skill.category,
      description: `Complete the ${skill.name} lesson`,
      estimatedMinutes: 10,
      priority: 1
    });
  }

  // 2. Find weak skills (mastery < 0.5)
  const weakSkills = getWeakSkills(brainMap)
    .filter(id => !id.startsWith('TRAP-') && brainMap.skills[id]?.questionsSeen > 0)
    .slice(0, 3);

  for (const skillId of weakSkills) {
    const skill = SKILLS[skillId];
    if (!skill) continue;
    recommendations.push({
      type: "practice",
      skillId,
      skillName: skill.name,
      category: skill.category,
      description: `Practice ${skill.name} (${Math.round(brainMap.skills[skillId].mastery * 100)}% mastery)`,
      estimatedMinutes: 15,
      priority: 2
    });
  }

  // 3. Find decaying skills (not practiced in 5+ days)
  const decayingSkills = getSkillsNeedingReview(brainMap).slice(0, 3);
  for (const skillId of decayingSkills) {
    const skill = SKILLS[skillId];
    if (!skill) continue;
    if (weakSkills.includes(skillId)) continue; // Already in weak list
    recommendations.push({
      type: "review",
      skillId,
      skillName: skill.name,
      category: skill.category,
      description: `Review ${skill.name} (hasn't been practiced recently)`,
      estimatedMinutes: 10,
      priority: 3
    });
  }

  // 4. Suggest section tests if enough practice done
  const categories = ["reading_comprehension", "text_completion", "sentence_equivalence"] as const;
  for (const cat of categories) {
    const catSkills = getSkillsByCategory(cat);
    const lessonsComplete = catSkills.filter(s => brainMap.lessonsCompleted[s.id]).length;
    const practiced = catSkills.filter(s => brainMap.skills[s.id]?.questionsSeen > 5).length;

    if (lessonsComplete >= catSkills.length * 0.5 && practiced >= 2) {
      const recentTests = brainMap.testHistory.filter(t => t.category === cat);
      const daysSinceLastTest = recentTests.length > 0
        ? (Date.now() - new Date(recentTests[recentTests.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysSinceLastTest > 2) {
        recommendations.push({
          type: "test",
          category: cat,
          description: `Take a ${getCategoryLabel(cat)} section test`,
          estimatedMinutes: 20,
          priority: 4
        });
      }
    }
  }

  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  // Split into today and this week
  const today = recommendations.slice(0, 3);
  const thisWeek = recommendations.slice(3, 8);

  // Identify focus areas
  const focusAreas = [...new Set(weakSkills.map(id => SKILLS[id]?.category).filter(Boolean))] as string[];

  // Overall message
  const totalPracticed = Object.values(brainMap.skills).filter(s => s.questionsSeen > 0).length;
  const totalSkills = allSkillIds.length;
  let overallMessage: string;

  if (totalPracticed === 0) {
    overallMessage = "Welcome! Start with the pattern lessons to build your foundation.";
  } else if (incompleteLessons.length > totalSkills * 0.5) {
    overallMessage = "Focus on completing lessons first — understanding patterns before testing is key.";
  } else if (weakSkills.length > 3) {
    overallMessage = "You have several weak areas. Targeted practice will help improve your score.";
  } else {
    overallMessage = "Good progress! Keep practicing weak areas and take section tests to track improvement.";
  }

  return { today, thisWeek, focusAreas, overallMessage };
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case "reading_comprehension": return "Reading Comprehension";
    case "text_completion": return "Text Completion";
    case "sentence_equivalence": return "Sentence Equivalence";
    default: return cat;
  }
}
