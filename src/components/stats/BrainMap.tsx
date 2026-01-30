
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserSkill, SkillType } from '@/services/skillEngine';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface BrainMapProps {
  skills: UserSkill[];
}

// Mapping skills to Brain Regions
// Logic -> Frontal Lobe (Reasoning, Planning)
// Vocab -> Temporal Lobe (Language, Memory)
// Context -> Parietal Lobe (Sensory integration, Context)
// Precision -> Occipital/Cerebellum (Visual processing, Fine detail)

const BRAIN_PATHS = {
  frontal: "M 40 100 C 40 60, 70 20, 150 20 C 200 20, 220 50, 220 50 L 220 120 L 150 150 L 40 100 Z",
  parietal: "M 150 20 C 230 20, 280 40, 300 80 L 300 130 L 220 120 L 220 50 C 220 50, 200 20, 150 20 Z",
  temporal: "M 40 100 L 150 150 L 220 120 L 240 160 C 200 220, 100 200, 60 160 Z",
  occipital: "M 300 80 C 320 120, 320 160, 280 190 L 240 160 L 300 130 Z",
  cerebellum: "M 240 160 L 280 190 C 260 220, 200 230, 180 210 L 240 160 Z" // Merged with Precision for visual simplicity or separate? Let's keep Precision on Occipital+Cerebellum
};

// Colors for skill levels
const getSkillColor = (mu: number) => {
  if (mu < 30) return "#ef4444"; // Red-500
  if (mu < 50) return "#f97316"; // Orange-500
  if (mu < 70) return "#eab308"; // Yellow-500
  if (mu < 90) return "#84cc16"; // Lime-500
  return "#22c55e"; // Green-500
};

const SKILL_DESCRIPTIONS: Record<SkillType, { title: string; description: string; region: string }> = {
  logic: { 
    title: "Logic & Reasoning", 
    description: "Your ability to construct valid arguments and detect fallacies. Handled by the Frontal Lobe.",
    region: "Frontal Lobe"
  },
  vocab: { 
    title: "Vocabulary & Language", 
    description: "Your lexicon depth and ability to recall definitions. Handled by the Temporal Lobe.",
    region: "Temporal Lobe"
  },
  context: { 
    title: "Context & Synthesis", 
    description: "Your ability to infer meaning from surrounding text. Handled by the Parietal Lobe.",
    region: "Parietal Lobe"
  },
  precision: { 
    title: "Precision & Attention", 
    description: "Your attention to detail and ability to spot subtle traps. Handled by the Occipital Lobe.",
    region: "Occipital Lobe"
  }
};

export function BrainMap({ skills }: BrainMapProps) {
  const [hoveredSkill, setHoveredSkill] = useState<SkillType | null>(null);

  const skillMap = useMemo(() => {
    const map = new Map<SkillType, UserSkill>();
    skills.forEach(s => map.set(s.skill_type, s));
    return map;
  }, [skills]);

  const getSkillData = (type: SkillType) => {
    return skillMap.get(type) || { mu: 50, sigma: 10, skill_type: type, last_practice_at: '' };
  };

  const renderRegion = (type: SkillType, path: string, label: string) => {
    const data = getSkillData(type);
    const color = getSkillColor(data.mu);
    const opacity = hoveredSkill === type ? 1 : hoveredSkill ? 0.3 : 0.8;
    const glow = hoveredSkill === type ? `drop-shadow(0 0 10px ${color})` : "none";

    return (
      <motion.path
        d={path}
        fill={color}
        stroke="white"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity,
          filter: glow,
          scale: hoveredSkill === type ? 1.02 : 1
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setHoveredSkill(type)}
        onMouseLeave={() => setHoveredSkill(null)}
        className="cursor-pointer transition-all duration-300"
      />
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-6">
      {/* Brain Visualization */}
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
        <svg viewBox="0 0 350 250" className="w-full h-full overflow-visible">
            {/* Filter for Glow Effect */}
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Background Silhouette (Optional) */}
            {/* Frontal - Logic */}
            {renderRegion('logic', BRAIN_PATHS.frontal, "Logic")}
            
            {/* Parietal - Context */}
            {renderRegion('context', BRAIN_PATHS.parietal, "Context")}
            
            {/* Temporal - Vocab */}
            {renderRegion('vocab', BRAIN_PATHS.temporal, "Vocab")}
            
            {/* Occipital - Precision */}
            {renderRegion('precision', BRAIN_PATHS.occipital + " " + BRAIN_PATHS.cerebellum, "Precision")}
        </svg>

        {/* Floating Label when hovering */}
        <AnimatePresence>
            {hoveredSkill && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-0 left-0 right-0 text-center bg-background/80 backdrop-blur-md p-2 rounded-lg border shadow-lg z-10"
                >
                    <h3 className="font-bold text-lg">{SKILL_DESCRIPTIONS[hoveredSkill].title}</h3>
                    <p className="text-sm text-muted-foreground">{SKILL_DESCRIPTIONS[hoveredSkill].region}</p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Stats Detail Panel */}
      <div className="flex-1 space-y-4 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Neural Skill Map</h2>
        <div className="grid gap-4">
            {(Object.keys(SKILL_DESCRIPTIONS) as SkillType[]).map(type => {
                const data = getSkillData(type);
                const info = SKILL_DESCRIPTIONS[type];
                const color = getSkillColor(data.mu);
                
                return (
                    <motion.div 
                        key={type}
                        onMouseEnter={() => setHoveredSkill(type)}
                        onMouseLeave={() => setHoveredSkill(null)}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${hoveredSkill === type ? 'bg-muted border-primary' : 'bg-card'}`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                <span className="font-semibold">{info.title}</span>
                            </div>
                            <span className="font-mono font-bold">{Math.round(data.mu)}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${data.mu}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>Uncertainty: ±{Math.round(data.sigma)}%</span>
                            <span>{info.description}</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
