
import { SkillCategory } from '@/services/skillEngine';

interface BrainPolygonProps {
  categoryScores: Record<SkillCategory, { mu: number; sigma: number }>;
}

// Helper to get color with opacity variation based on score
function getPolygonalColor(baseHue: number, score: number, variant: 'light' | 'medium' | 'dark') {
  // Higher score = more vibrant/saturated
  const saturation = 60 + (score / 100) * 30; // 60-90%
  const lightness = variant === 'light' ? 65 : variant === 'medium' ? 55 : 45;
  
  return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
}

// Base hues for regions
const REGION_HUES: Record<SkillCategory, number> = {
  logic: 25,    // Orange
  context: 330, // Pink/Red
  vocab: 270,   // Purple
  precision: 220, // Blue/Indigo
};

export function BrainPolygon({ categoryScores }: BrainPolygonProps) {
  const getColor = (category: SkillCategory, variant: 'light' | 'medium' | 'dark') => {
    const score = categoryScores[category]?.mu ?? 50;
    return getPolygonalColor(REGION_HUES[category], score, variant);
  };

  return (
    <svg
      viewBox="0 0 500 400"
      className="w-full max-w-md h-auto"
      style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))' }}
      aria-label="Low-poly artistic representation of brain regions"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 
        COORDINATE SYSTEM: 0,0 top-left to 500,400 bottom-right
        Brain roughly centered: x:50-450, y:50-350
        Front of brain is LEFT side in the reference image
      */}

      {/* FRONTAL LOBE - Logic (Front/Left) - Orange */}
      <g className="transition-all duration-500 hover:filter hover:brightness-110">
        <polygon points="50,180 120,130 140,200" fill={getColor('logic', 'light')} />
        <polygon points="50,180 140,200 90,240" fill={getColor('logic', 'medium')} />
        <polygon points="120,130 190,100 160,160" fill={getColor('logic', 'light')} />
        <polygon points="120,130 160,160 140,200" fill={getColor('logic', 'dark')} />
        <polygon points="90,240 140,200 170,250" fill={getColor('logic', 'dark')} />
        <polygon points="140,200 160,160 210,190" fill={getColor('logic', 'medium')} />
        <polygon points="140,200 210,190 170,250" fill={getColor('logic', 'light')} />
        
        {/* Connection nodes */}
        <circle cx="120" cy="130" r="3" fill="white" opacity="0.6" />
        <circle cx="90" cy="240" r="3" fill="white" opacity="0.6" />
        <circle cx="170" cy="250" r="3" fill="white" opacity="0.6" />
      </g>

      {/* PARIETAL LOBE - Context (Top/Middle) - Pink/Red */}
      <g className="transition-all duration-500 hover:filter hover:brightness-110">
        <polygon points="190,100 280,80 240,140" fill={getColor('context', 'light')} />
        <polygon points="190,100 240,140 160,160" fill={getColor('context', 'medium')} />
        <polygon points="280,80 350,90 310,150" fill={getColor('context', 'light')} />
        <polygon points="280,80 310,150 240,140" fill={getColor('context', 'dark')} />
        <polygon points="240,140 310,150 260,200" fill={getColor('context', 'medium')} />
        <polygon points="160,160 240,140 210,190" fill={getColor('context', 'dark')} />
        
        {/* Connection nodes */}
        <circle cx="190" cy="100" r="3" fill="white" opacity="0.6" />
        <circle cx="280" cy="80" r="3" fill="white" opacity="0.6" />
        <circle cx="350" cy="90" r="3" fill="white" opacity="0.6" />
      </g>

      {/* OCCIPITAL LOBE - Precision (Back/Right) - Blue/Indigo */}
      <g className="transition-all duration-500 hover:filter hover:brightness-110">
        <polygon points="350,90 420,140 370,180" fill={getColor('precision', 'light')} />
        <polygon points="350,90 370,180 310,150" fill={getColor('precision', 'medium')} />
        <polygon points="420,140 440,220 380,240" fill={getColor('precision', 'light')} />
        <polygon points="420,140 380,240 370,180" fill={getColor('precision', 'dark')} />
        <polygon points="310,150 370,180 340,230" fill={getColor('precision', 'medium')} />
        <polygon points="370,180 380,240 340,230" fill={getColor('precision', 'dark')} />
        <polygon points="340,230 380,240 350,290" fill={getColor('precision', 'medium')} />
        
        {/* Connection nodes */}
        <circle cx="420" cy="140" r="3" fill="white" opacity="0.6" />
        <circle cx="440" cy="220" r="3" fill="white" opacity="0.6" />
      </g>

      {/* TEMPORAL LOBE - Vocab (Bottom/Middle) - Purple */}
      <g className="transition-all duration-500 hover:filter hover:brightness-110">
        <polygon points="170,250 210,190 260,200" fill={getColor('vocab', 'light')} />
        <polygon points="170,250 260,200 230,280" fill={getColor('vocab', 'medium')} />
        <polygon points="260,200 310,150 340,230" fill={getColor('vocab', 'light')} />
        <polygon points="260,200 340,230 300,270" fill={getColor('vocab', 'dark')} />
        <polygon points="230,280 260,200 300,270" fill={getColor('vocab', 'medium')} />
        <polygon points="170,250 230,280 190,320" fill={getColor('vocab', 'dark')} />
        <polygon points="230,280 300,270 270,330" fill={getColor('vocab', 'light')} />
        <polygon points="190,320 230,280 270,330" fill={getColor('vocab', 'medium')} />
        
        {/* Connection nodes */}
        <circle cx="230" cy="280" r="3" fill="white" opacity="0.6" />
        <circle cx="300" cy="270" r="3" fill="white" opacity="0.6" />
        <circle cx="190" cy="320" r="3" fill="white" opacity="0.6" />
      </g>

      {/* Brain Stem / Cerebellum area (Structural/Darker) */}
      <g opacity="0.8">
        <polygon points="350,290 380,240 400,310" fill="#475569" />
        <polygon points="350,290 400,310 360,340" fill="#334155" />
        <polygon points="270,330 350,290 360,340" fill="#1e293b" />
        <polygon points="270,330 360,340 310,360" fill="#0f172a" />
      </g>

      {/* Connecting Lines (White overlay for low-poly mesh look) */}
      <g stroke="white" strokeWidth="0.5" strokeOpacity="0.3" fill="none">
        {/* Logic lines */}
        <line x1="120" y1="130" x2="140" y2="200" />
        <line x1="140" y1="200" x2="90" y2="240" />
        <line x1="140" y1="200" x2="210" y2="190" />
        
        {/* Context lines */}
        <line x1="190" y1="100" x2="280" y2="80" />
        <line x1="280" y1="80" x2="350" y2="90" />
        <line x1="240" y1="140" x2="310" y2="150" />
        
        {/* Vocab lines */}
        <line x1="210" y1="190" x2="260" y2="200" />
        <line x1="260" y1="200" x2="300" y2="270" />
        <line x1="230" y1="280" x2="270" y2="330" />
        
        {/* Precision lines */}
        <line x1="350" y1="90" x2="420" y2="140" />
        <line x1="420" y1="140" x2="440" y2="220" />
        <line x1="370" y1="180" x2="340" y2="230" />
      </g>
    </svg>
  );
}


export default BrainPolygon;
