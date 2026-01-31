
import { useMemo, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserSkill,
  SkillType,
  SkillCategory,
  CategorySkill,
  aggregateSkillsToCategories,
  SKILL_CATEGORIES,
  getSkillDisplayName
} from '@/services/skillEngine';
import { SkillRadar } from './SkillRadar';
import { BrainPlexus } from './BrainPlexus';
import { Loader2, BrainCircuit, BookOpen, Network, Target } from 'lucide-react';

interface BrainMapProps {
  skills: UserSkill[];
}

// Colors for skill levels
const getSkillColor = (mu: number) => {
  if (mu < 30) return "#ef4444"; // Red-500
  if (mu < 50) return "#f97316"; // Orange-500
  if (mu < 70) return "#eab308"; // Yellow-500
  if (mu < 90) return "#84cc16"; // Lime-500
  return "#22c55e"; // Green-500
};

const CATEGORY_DESCRIPTIONS: Record<SkillCategory, { title: string; description: string; region: string; icon: any }> = {
  logic: {
    title: "Logic & Reasoning",
    description: "Constructing valid arguments and detecting fallacies.",
    region: "Frontal Lobe",
    icon: BrainCircuit
  },
  vocab: {
    title: "Vocabulary & Language",
    description: "Lexicon depth and ability to recall definitions.",
    region: "Temporal Lobe",
    icon: BookOpen
  },
  context: {
    title: "Context & Synthesis",
    description: "Inferring meaning from surrounding text.",
    region: "Parietal Lobe",
    icon: Network
  },
  precision: {
    title: "Precision & Attention",
    description: "Attention to detail and spotting subtle traps.",
    region: "Occipital Lobe",
    icon: Target
  }
};

export function BrainMap({ skills }: BrainMapProps) {
  const [hoveredCategory, setHoveredCategory] = useState<SkillCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);

  // Aggregate 10 skills into 4 categories
  const categorySkills = useMemo(() => {
    return aggregateSkillsToCategories(skills);
  }, [skills]);

  // Create a map for easy lookup
  const categoryMap = useMemo(() => {
    const map = new Map<SkillCategory, CategorySkill>();
    categorySkills.forEach(cs => map.set(cs.category, cs));
    return map;
  }, [categorySkills]);

  // Create category scores for 3D brain
  const categoryScores = useMemo(() => {
    const scores: Record<SkillCategory, { mu: number; sigma: number }> = {
      logic: { mu: 50, sigma: 15 },
      vocab: { mu: 50, sigma: 15 },
      context: { mu: 50, sigma: 15 },
      precision: { mu: 50, sigma: 15 }
    };
    categorySkills.forEach(cs => {
      scores[cs.category] = { mu: cs.mu, sigma: cs.sigma };
    });
    return scores;
  }, [categorySkills]);

  // Create a skill map for component skill lookup
  const skillMap = useMemo(() => {
    const map = new Map<SkillType, UserSkill>();
    skills.forEach(s => map.set(s.skill_type as SkillType, s));
    return map;
  }, [skills]);

  // Check if using old schema
  const isOldSchema = useMemo(() => {
    const oldCategoryNames = ['precision', 'vocab', 'logic', 'context'];
    return skills.some(s => oldCategoryNames.includes(s.skill_type as string));
  }, [skills]);

  const getCategoryData = (category: SkillCategory) => {
    return categoryMap.get(category) || {
      category,
      mu: 50,
      sigma: 15,
      componentSkills: SKILL_CATEGORIES[category]
    };
  };

  // Get component skills info for hover tooltip
  const getComponentSkillsInfo = (category: SkillCategory) => {
    if (isOldSchema) {
      const categoryData = getCategoryData(category);
      return [{
        name: `${category} (aggregated)`,
        mu: categoryData.mu
      }];
    }

    const componentSkills = SKILL_CATEGORIES[category];
    return componentSkills.map(skillType => {
      const skill = skillMap.get(skillType);
      return {
        name: getSkillDisplayName(skillType),
        mu: skill?.mu ?? 50
      };
    });
  };

  const activeCategory = hoveredCategory || selectedCategory;

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* 3D Brain Visualization Section */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        {/* 3D Brain */}
        <div className="flex-1 w-full max-w-2xl flex flex-col items-center">
          <BrainPlexus categoryScores={categoryScores} />

          {/* Instructions */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Interactive 3D Neural Network
          </p>
        </div>

        {/* Stats Detail Panel */}
        <div className="flex-1 space-y-4 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Neural Skill Map</h2>

          {/* Active region detail card */}
          <AnimatePresence mode="wait">
            {activeCategory && (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg border bg-primary/5 border-primary/30 mb-4"
              >
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getSkillColor(getCategoryData(activeCategory).mu) }}
                    aria-hidden="true"
                  />
                  {(() => {
                    const Icon = CATEGORY_DESCRIPTIONS[activeCategory].icon;
                    return <Icon className="w-5 h-5 text-primary" aria-hidden="true" />;
                  })()}
                  {CATEGORY_DESCRIPTIONS[activeCategory].title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {CATEGORY_DESCRIPTIONS[activeCategory].region} - {CATEGORY_DESCRIPTIONS[activeCategory].description}
                </p>
                <div className="text-sm space-y-1">
                  {getComponentSkillsInfo(activeCategory).map(skill => (
                    <div key={skill.name} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{skill.name}</span>
                      <span className="font-mono font-bold" style={{ color: getSkillColor(skill.mu) }}>
                        {Math.round(skill.mu)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All regions grid */}
          <div className="grid gap-3">
            {(['logic', 'vocab', 'context', 'precision'] as SkillCategory[]).map(category => {
              const data = getCategoryData(category);
              const info = CATEGORY_DESCRIPTIONS[category];
              const color = getSkillColor(data.mu);
              const isActive = activeCategory === category;

              return (
                <motion.div
                  key={category}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  onFocus={() => setHoveredCategory(category)}
                  onBlur={() => setHoveredCategory(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${info.title}: ${Math.round(data.mu)}% Proficiency`}
                  className={`p-3 rounded-lg border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive
                      ? 'bg-muted border-primary shadow-lg'
                      : 'bg-card hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full transition-transform"
                        style={{
                          backgroundColor: color,
                          boxShadow: isActive ? `0 0 10px ${color}` : 'none'
                        }}
                        aria-hidden="true"
                      />
                      <info.icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span className="font-semibold text-sm">{info.title}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">{Math.round(data.mu)}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.mu}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-4" />

      {/* Radar Chart Section */}
      <SkillRadar skills={skills} />
    </div>
  );
}
