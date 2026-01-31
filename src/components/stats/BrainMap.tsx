
import { useMemo, useState } from 'react';
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
import { BrainCircuit, BookOpen, Network, Target, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

interface BrainMapProps {
  skills: UserSkill[];
}

// Colors for skill levels
const getSkillColor = (mu: number) => {
  if (mu < 30) return { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "Needs Work" };
  if (mu < 50) return { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", label: "Developing" };
  if (mu < 70) return { bg: "#fefce8", border: "#fef08a", text: "#ca8a04", label: "Progressing" };
  if (mu < 90) return { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", label: "Strong" };
  return { bg: "#ecfdf5", border: "#a7f3d0", text: "#059669", label: "Mastered" };
};

const CATEGORY_INFO: Record<SkillCategory, {
  title: string;
  description: string;
  icon: any;
  gradient: string;
}> = {
  logic: {
    title: "Logic & Reasoning",
    description: "Constructing valid arguments and detecting fallacies.",
    icon: BrainCircuit,
    gradient: "from-orange-500 to-red-500"
  },
  vocab: {
    title: "Vocabulary",
    description: "Word knowledge, definitions, and nuance.",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-500"
  },
  context: {
    title: "Context & Synthesis",
    description: "Reading between the lines and synthesizing information.",
    icon: Network,
    gradient: "from-blue-500 to-cyan-500"
  },
  precision: {
    title: "Precision & Attention",
    description: "Spotting subtle traps and polarity shifts.",
    icon: Target,
    gradient: "from-green-500 to-emerald-500"
  }
};

export function BrainMap({ skills }: BrainMapProps) {
  const [expandedCategory, setExpandedCategory] = useState<SkillCategory | null>(null);

  // Aggregate skills into 4 categories
  const categorySkills = useMemo(() => {
    return aggregateSkillsToCategories(skills);
  }, [skills]);

  // Create category map
  const categoryMap = useMemo(() => {
    const map = new Map<SkillCategory, CategorySkill>();
    categorySkills.forEach(cs => map.set(cs.category, cs));
    return map;
  }, [categorySkills]);

  // Create skill map for component skills
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

  // Get component skills info
  const getComponentSkillsInfo = (category: SkillCategory) => {
    if (isOldSchema) {
      return [];
    }
    const componentSkills = SKILL_CATEGORIES[category];
    return componentSkills.map(skillType => {
      const skill = skillMap.get(skillType);
      return {
        name: getSkillDisplayName(skillType),
        skillType,
        mu: skill?.mu ?? 50,
        correct: skill?.correct_count ?? 0,
        incorrect: skill?.incorrect_count ?? 0
      };
    });
  };

  // Sort categories by score to show weakest first
  const sortedCategories = useMemo(() => {
    return (['logic', 'vocab', 'context', 'precision'] as SkillCategory[])
      .map(cat => ({ category: cat, data: getCategoryData(cat) }))
      .sort((a, b) => a.data.mu - b.data.mu);
  }, [categoryMap]);

  // Overall stats
  const overallScore = useMemo(() => {
    if (categorySkills.length === 0) return 50;
    return Math.round(categorySkills.reduce((acc, s) => acc + s.mu, 0) / categorySkills.length);
  }, [categorySkills]);

  const weakestCategory = sortedCategories[0];
  const strongestCategory = sortedCategories[sortedCategories.length - 1];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-400 mb-1">Overall Proficiency</p>
          <p className="text-5xl font-black text-white">{overallScore}%</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Weakest Area */}
        <div className="bg-gradient-to-br from-red-950/50 to-orange-950/50 border border-red-900/30 rounded-xl p-6">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <TrendingDown className="w-4 h-4" />
            <p className="text-sm">Needs Attention</p>
          </div>
          <p className="text-xl font-bold text-white">{CATEGORY_INFO[weakestCategory.category].title}</p>
          <p className="text-3xl font-black text-red-400">{Math.round(weakestCategory.data.mu)}%</p>
        </div>

        {/* Strongest Area */}
        <div className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border border-green-900/30 rounded-xl p-6">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <p className="text-sm">Strongest Skill</p>
          </div>
          <p className="text-xl font-bold text-white">{CATEGORY_INFO[strongestCategory.category].title}</p>
          <p className="text-3xl font-black text-green-400">{Math.round(strongestCategory.data.mu)}%</p>
        </div>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCategories.map(({ category, data }, index) => {
          const info = CATEGORY_INFO[category];
          const colors = getSkillColor(data.mu);
          const Icon = info.icon;
          const isExpanded = expandedCategory === category;
          const componentSkills = getComponentSkillsInfo(category);

          return (
            <motion.div
              key={category}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border overflow-hidden transition-all cursor-pointer ${
                isExpanded ? 'ring-2 ring-primary' : ''
              }`}
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
              onClick={() => setExpandedCategory(isExpanded ? null : category)}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${info.gradient} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{info.title}</h3>
                      <p className="text-xs text-white/70">{info.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{Math.round(data.mu)}%</p>
                    <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white">
                      {colors.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 py-3 bg-card">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${info.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.mu}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                  />
                </div>

                {/* Expand indicator */}
                {componentSkills.length > 0 && (
                  <div className="flex items-center justify-center mt-2 text-muted-foreground">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                    <span className="text-xs ml-1">
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Component Skills */}
              <AnimatePresence>
                {isExpanded && componentSkills.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {componentSkills.map(skill => {
                        const skillColors = getSkillColor(skill.mu);
                        return (
                          <div key={skill.skillType} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{skill.name}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${skill.mu}%`,
                                    backgroundColor: skillColors.text
                                  }}
                                />
                              </div>
                              <span
                                className="text-sm font-mono font-bold w-12 text-right"
                                style={{ color: skillColors.text }}
                              >
                                {Math.round(skill.mu)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* Radar Chart */}
      <SkillRadar skills={skills} />
    </div>
  );
}
