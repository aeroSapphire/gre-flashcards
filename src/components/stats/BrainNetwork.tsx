
import { useMemo } from 'react';
import { SkillCategory } from '@/services/skillEngine';

interface BrainNetworkProps {
  categoryScores: Record<SkillCategory, { mu: number; sigma: number }>;
}

// Generate points within a brain-shaped region (top-down view)
function generateBrainPoints(): { x: number; y: number; region: SkillCategory }[] {
  const points: { x: number; y: number; region: SkillCategory }[] = [];

  // Brain dimensions (top-down view, centered at 200,200)
  const centerX = 200;
  const centerY = 200;

  // Helper to check if point is in brain shape
  const isInBrain = (x: number, y: number): boolean => {
    const dx = (x - centerX) / 140; // Width radius
    const dy = (y - centerY) / 170; // Height radius

    // Basic ellipse check with some bulging for temporal lobes
    const baseShape = dx * dx + dy * dy;

    // Add bulge at bottom sides (temporal lobes)
    const temporalBulge = dy > 0.2 ? Math.abs(dx) * 0.15 : 0;

    return baseShape - temporalBulge < 1;
  };

  // Determine region based on position
  const getRegion = (x: number, y: number): SkillCategory => {
    const dx = x - centerX;
    const dy = y - centerY;

    // Top half = frontal (logic) + parietal (context)
    // Bottom half = temporal (vocab) + occipital (precision)

    if (dy < -20) {
      // Top - Frontal/Parietal
      return dx < 0 ? 'logic' : 'context';
    } else if (dy > 60) {
      // Bottom - Occipital
      return 'precision';
    } else {
      // Middle - Temporal/Vocab
      return 'vocab';
    }
  };

  // Generate random points within brain shape
  const numPoints = 180;
  let attempts = 0;

  while (points.length < numPoints && attempts < 2000) {
    const x = centerX + (Math.random() - 0.5) * 300;
    const y = centerY + (Math.random() - 0.5) * 360;

    if (isInBrain(x, y)) {
      // Avoid the center line (corpus callosum gap)
      const distFromCenter = Math.abs(x - centerX);
      if (distFromCenter > 8 || Math.random() < 0.3) {
        points.push({ x, y, region: getRegion(x, y) });
      }
    }
    attempts++;
  }

  // Add some points along the center divide
  for (let i = 0; i < 15; i++) {
    const y = centerY - 140 + i * 20;
    if (y < centerY + 140) {
      points.push({ x: centerX - 3, y, region: y < centerY ? 'logic' : 'vocab' });
      points.push({ x: centerX + 3, y, region: y < centerY ? 'context' : 'precision' });
    }
  }

  return points;
}

// Generate connections between nearby points
function generateConnections(points: { x: number; y: number }[]): [number, number][] {
  const connections: [number, number][] = [];
  const maxDist = 45;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist && Math.random() < 0.4) {
        connections.push([i, j]);
      }
    }
  }

  return connections;
}

// Get color based on skill level
function getRegionColor(mu: number): string {
  if (mu < 30) return '#ef4444';
  if (mu < 50) return '#f97316';
  if (mu < 70) return '#06b6d4';
  if (mu < 90) return '#22d3ee';
  return '#67e8f9';
}

export function BrainNetwork({ categoryScores }: BrainNetworkProps) {
  // Generate points and connections (memoized for performance)
  const { points, connections } = useMemo(() => {
    const pts = generateBrainPoints();
    const conns = generateConnections(pts);
    return { points: pts, connections: conns };
  }, []);

  const getColor = (region: SkillCategory) => {
    const score = categoryScores[region]?.mu ?? 50;
    return getRegionColor(score);
  };

  // Group points by brightness (some glow more)
  const brightPoints = useMemo(() => {
    return points.map((_, i) => Math.random() < 0.15);
  }, [points]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))',
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.05) 0%, transparent 70%)'
        }}
      >
        <defs>
          {/* Glow filters for different intensities */}
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Radial gradient for background glow */}
          <radialGradient id="brain-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx="200" cy="200" rx="150" ry="180" fill="url(#brain-glow)" />

        {/* Connection lines */}
        <g opacity="0.4">
          {connections.map(([i, j], idx) => (
            <line
              key={`conn-${idx}`}
              x1={points[i].x}
              y1={points[i].y}
              x2={points[j].x}
              y2={points[j].y}
              stroke={getColor(points[i].region)}
              strokeWidth="0.5"
              opacity="0.6"
            />
          ))}
        </g>

        {/* Neural nodes (points) */}
        <g>
          {points.map((point, idx) => {
            const color = getColor(point.region);
            const isBright = brightPoints[idx];

            return (
              <g key={`node-${idx}`}>
                {/* Outer glow for bright nodes */}
                {isBright && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill={color}
                    opacity="0.2"
                    filter="url(#glow-strong)"
                  />
                )}
                {/* Main node */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isBright ? 3 : 1.5}
                  fill={color}
                  filter={isBright ? "url(#glow-soft)" : undefined}
                  opacity={isBright ? 1 : 0.8}
                />
              </g>
            );
          })}
        </g>

        {/* Center line indication (corpus callosum) */}
        <line
          x1="200"
          y1="60"
          x2="200"
          y2="320"
          stroke="#06b6d4"
          strokeWidth="0.5"
          opacity="0.1"
          strokeDasharray="4,8"
        />
      </svg>

      {/* Floating particles effect (CSS animated) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default BrainNetwork;
