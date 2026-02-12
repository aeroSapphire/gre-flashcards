import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { WordRelationship, RelationshipType } from '@/data/wordRelationships/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NetworkGraphProps {
  words: string[];
  relationships: WordRelationship[];
  learnedWords: Set<string>;
  highlightWord?: string;
  onWordClick: (word: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const EDGE_COLORS: Record<RelationshipType, string> = {
  synonym: '#4ade80',
  near_synonym: '#4ade80',
  antonym: '#f87171',
  stronger_than: '#60a5fa',
  weaker_than: '#60a5fa',
  formal_variant: '#a78bfa',
  commonly_confused: '#fb923c',
  derived_from: '#94a3b8',
  category_sibling: '#94a3b8',
};

const EDGE_DASH: Record<string, string> = {
  near_synonym: '4,4',
  weaker_than: '6,3',
  commonly_confused: '2,4',
};

const RELEVANCE_WIDTH = { high: 2.5, medium: 1.5, low: 0.8 };

function getNodeColor(word: string, learned: Set<string>, highlight?: string): string {
  if (word === highlight) return '#38bdf8'; // sky-400 for highlight
  if (learned.has(word)) return '#4ade80'; // green-400
  return '#64748b'; // slate-500
}

function getNodeBorder(word: string, learned: Set<string>, highlight?: string): string {
  if (word === highlight) return '#0ea5e9';
  if (learned.has(word)) return '#22c55e';
  return '#475569';
}

// Simple force-directed layout
function runForceLayout(
  words: string[],
  relationships: WordRelationship[],
  width: number,
  height: number,
  iterations = 80
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  // Initialize in a circle
  words.forEach((word, i) => {
    const angle = (2 * Math.PI * i) / words.length;
    const r = Math.min(width, height) * 0.3;
    positions.set(word, {
      x: width / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    });
  });

  const repulsion = 3000;
  const attraction = 0.02;
  const damping = 0.85;
  const centerPull = 0.005;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const a = positions.get(words[i])!;
        const b = positions.get(words[j])!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Attraction along edges
    for (const rel of relationships) {
      const a = positions.get(rel.wordA);
      const b = positions.get(rel.wordB);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const fx = dx * attraction;
      const fy = dy * attraction;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center pull
    for (const word of words) {
      const pos = positions.get(word)!;
      pos.vx += (width / 2 - pos.x) * centerPull;
      pos.vy += (height / 2 - pos.y) * centerPull;
    }

    // Apply velocity with damping
    const padding = 60;
    for (const word of words) {
      const pos = positions.get(word)!;
      pos.x += pos.vx;
      pos.y += pos.vy;
      pos.vx *= damping;
      pos.vy *= damping;
      // Keep in bounds
      pos.x = Math.max(padding, Math.min(width - padding, pos.x));
      pos.y = Math.max(padding, Math.min(height - padding, pos.y));
    }
  }

  return positions;
}

export function NetworkGraph({
  words,
  relationships,
  learnedWords,
  highlightWord,
  onWordClick,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [hoveredEdge, setHoveredEdge] = useState<WordRelationship | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.max(400, width), height: Math.max(300, height) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const positions = useMemo(
    () => runForceLayout(words, relationships, dimensions.width, dimensions.height),
    [words, relationships, dimensions.width, dimensions.height]
  );

  const getEdgeId = useCallback(
    (r: WordRelationship) => `${r.wordA}-${r.type}-${r.wordB}`,
    []
  );

  return (
    <div ref={containerRef} className="w-full h-[400px] relative">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      >
        {/* Edges */}
        {relationships.map(rel => {
          const a = positions.get(rel.wordA);
          const b = positions.get(rel.wordB);
          if (!a || !b) return null;
          const edgeId = getEdgeId(rel);
          const isHovered = hoveredEdge && getEdgeId(hoveredEdge) === edgeId;

          return (
            <g key={edgeId}>
              {/* Invisible wider line for easier hover */}
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="transparent"
                strokeWidth={12}
                onMouseEnter={() => setHoveredEdge(rel)}
                onMouseLeave={() => setHoveredEdge(null)}
                className="cursor-pointer"
              />
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={EDGE_COLORS[rel.type]}
                strokeWidth={RELEVANCE_WIDTH[rel.greRelevance]}
                strokeDasharray={EDGE_DASH[rel.type] || undefined}
                opacity={isHovered ? 1 : 0.5}
                className="pointer-events-none transition-opacity"
              />
              {/* Arrow for directional relationships */}
              {!rel.bidirectional && (
                <polygon
                  points={getArrowPoints(a, b)}
                  fill={EDGE_COLORS[rel.type]}
                  opacity={0.7}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {words.map((word, i) => {
          const pos = positions.get(word);
          if (!pos) return null;
          const isHighlight = word === highlightWord;
          const nodeColor = getNodeColor(word, learnedWords, highlightWord);
          const borderColor = getNodeBorder(word, learnedWords, highlightWord);

          return (
            <motion.g
              key={word}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              {/* Glow for highlighted node */}
              {isHighlight && (
                <circle
                  cx={pos.x} cy={pos.y} r={32}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={1}
                  opacity={0.3}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={24}
                fill={`${nodeColor}20`}
                stroke={borderColor}
                strokeWidth={isHighlight ? 2 : 1}
                onClick={() => onWordClick(word)}
                className="cursor-pointer transition-all hover:opacity-80"
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={nodeColor}
                fontSize={words.length > 12 ? 9 : 10}
                fontWeight={isHighlight ? 600 : 400}
                onClick={() => onWordClick(word)}
                className="cursor-pointer select-none"
              >
                {word.length > 12 ? word.slice(0, 11) + '…' : word}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Edge tooltip */}
      {hoveredEdge && (
        <div
          className="absolute bg-card border rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none z-10 max-w-[250px]"
          style={{
            left: (() => {
              const a = positions.get(hoveredEdge.wordA);
              const b = positions.get(hoveredEdge.wordB);
              return a && b ? (a.x + b.x) / 2 : 0;
            })(),
            top: (() => {
              const a = positions.get(hoveredEdge.wordA);
              const b = positions.get(hoveredEdge.wordB);
              return a && b ? (a.y + b.y) / 2 - 40 : 0;
            })(),
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium text-foreground">
            {hoveredEdge.wordA} ↔ {hoveredEdge.wordB}
          </div>
          <div className="text-muted-foreground mt-0.5">
            {hoveredEdge.type.replace(/_/g, ' ')}
          </div>
          <div className="text-foreground mt-1">{hoveredEdge.shadeNote}</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-green-400 inline-block" /> synonym
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-400 inline-block" /> antonym
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-blue-400 inline-block" /> intensity
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-orange-400 inline-block" style={{ borderBottom: '1px dashed' }} /> confused
        </span>
      </div>
    </div>
  );
}

function getArrowPoints(
  a: { x: number; y: number },
  b: { x: number; y: number }
): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return '';
  const nx = dx / dist;
  const ny = dy / dist;
  // Arrow tip at 24px (node radius) from target
  const tipX = b.x - nx * 26;
  const tipY = b.y - ny * 26;
  const baseX = tipX - nx * 8;
  const baseY = tipY - ny * 8;
  const perpX = -ny * 4;
  const perpY = nx * 4;
  return `${tipX},${tipY} ${baseX + perpX},${baseY + perpY} ${baseX - perpX},${baseY - perpY}`;
}
