
import { SkillCategory } from '@/services/skillEngine';

interface BrainPolygonProps {
  categoryScores: Record<SkillCategory, { mu: number; sigma: number }>;
}

// Get color based on skill level
function getSkillColor(mu: number, baseColors: { low: string; mid: string; high: string }) {
  if (mu < 40) return baseColors.low;
  if (mu < 70) return baseColors.mid;
  return baseColors.high;
}

// Color schemes for each region (gradient from struggling to mastery)
const REGION_COLORS: Record<SkillCategory, { low: string; mid: string; high: string }> = {
  logic: { low: '#ef4444', mid: '#f97316', high: '#fb923c' },      // Red -> Orange
  context: { low: '#ec4899', mid: '#f472b6', high: '#f9a8d4' },    // Pink shades
  vocab: { low: '#7c3aed', mid: '#a855f7', high: '#c084fc' },      // Purple shades
  precision: { low: '#6366f1', mid: '#818cf8', high: '#a5b4fc' },  // Indigo shades
};

export function BrainPolygon({ categoryScores }: BrainPolygonProps) {
  const getColor = (category: SkillCategory) => {
    const score = categoryScores[category]?.mu ?? 50;
    return getSkillColor(score, REGION_COLORS[category]);
  };

  return (
    <svg
      viewBox="0 0 400 320"
      className="w-full max-w-md h-auto"
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
    >
      <defs>
        {/* Gradients for depth effect */}
        <linearGradient id="logicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={getColor('logic')} />
          <stop offset="100%" stopColor={getColor('logic')} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="contextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={getColor('context')} />
          <stop offset="100%" stopColor={getColor('context')} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="vocabGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={getColor('vocab')} />
          <stop offset="100%" stopColor={getColor('vocab')} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="precisionGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={getColor('precision')} />
          <stop offset="100%" stopColor={getColor('precision')} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* FRONTAL LOBE - Logic (Orange/Red region - top front) */}
      <g className="transition-all duration-300 hover:brightness-110">
        {/* Main frontal triangles */}
        <polygon points="80,120 140,60 180,100" fill="url(#logicGrad)" />
        <polygon points="80,120 180,100 160,140" fill={getColor('logic')} opacity="0.9" />
        <polygon points="140,60 200,40 180,100" fill={getColor('logic')} opacity="0.85" />
        <polygon points="180,100 200,40 240,60" fill={getColor('logic')} opacity="0.8" />
        <polygon points="180,100 240,60 220,110" fill={getColor('logic')} opacity="0.95" />
        <polygon points="160,140 180,100 220,110" fill={getColor('logic')} opacity="0.75" />
      </g>

      {/* PARIETAL LOBE - Context (Pink region - top back) */}
      <g className="transition-all duration-300 hover:brightness-110">
        <polygon points="240,60 300,50 280,100" fill="url(#contextGrad)" />
        <polygon points="220,110 240,60 280,100" fill={getColor('context')} opacity="0.9" />
        <polygon points="280,100 300,50 340,80" fill={getColor('context')} opacity="0.85" />
        <polygon points="280,100 340,80 320,130" fill={getColor('context')} opacity="0.8" />
        <polygon points="220,110 280,100 260,150" fill={getColor('context')} opacity="0.95" />
        <polygon points="260,150 280,100 320,130" fill={getColor('context')} opacity="0.75" />
      </g>

      {/* TEMPORAL LOBE - Vocab (Purple region - middle/bottom) */}
      <g className="transition-all duration-300 hover:brightness-110">
        <polygon points="80,120 160,140 120,180" fill="url(#vocabGrad)" />
        <polygon points="120,180 160,140 160,200" fill={getColor('vocab')} opacity="0.9" />
        <polygon points="160,140 220,110 200,160" fill={getColor('vocab')} opacity="0.85" />
        <polygon points="160,140 200,160 160,200" fill={getColor('vocab')} opacity="0.8" />
        <polygon points="200,160 220,110 260,150" fill={getColor('vocab')} opacity="0.95" />
        <polygon points="160,200 200,160 180,230" fill={getColor('vocab')} opacity="0.75" />
        <polygon points="180,230 200,160 220,210" fill={getColor('vocab')} opacity="0.85" />
      </g>

      {/* OCCIPITAL LOBE - Precision (Indigo/Blue region - back) */}
      <g className="transition-all duration-300 hover:brightness-110">
        <polygon points="260,150 320,130 300,180" fill="url(#precisionGrad)" />
        <polygon points="260,150 300,180 280,200" fill={getColor('precision')} opacity="0.9" />
        <polygon points="200,160 260,150 240,200" fill={getColor('precision')} opacity="0.85" />
        <polygon points="240,200 260,150 280,200" fill={getColor('precision')} opacity="0.8" />
        <polygon points="220,210 240,200 260,240" fill={getColor('precision')} opacity="0.95" />
        <polygon points="240,200 280,200 260,240" fill={getColor('precision')} opacity="0.75" />
      </g>

      {/* BRAIN STEM (Dark purple - bottom) */}
      <g>
        <polygon points="220,210 260,240 240,280" fill="#581c87" opacity="0.9" />
        <polygon points="180,230 220,210 240,280" fill="#6b21a8" opacity="0.8" />
        <polygon points="240,280 260,240 250,290" fill="#4c1d95" opacity="0.95" />
      </g>

      {/* Subtle edge highlights for depth */}
      <g stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none">
        <polygon points="140,60 200,40 240,60" />
        <polygon points="300,50 340,80 320,130" />
        <polygon points="80,120 140,60 180,100" />
      </g>
    </svg>
  );
}

export default BrainPolygon;
