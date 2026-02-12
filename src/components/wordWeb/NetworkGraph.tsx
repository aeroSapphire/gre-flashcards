import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WordRelationship, RelationshipType } from '@/data/wordRelationships/types';

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

function getNodeColor(word: string, learned: Set<string>, highlight?: string, isConnected?: boolean): string {
  if (word === highlight) return '#38bdf8';
  if (learned.has(word)) return '#4ade80';
  if (isConnected) return '#cbd5e1'; // slate-300 for visible connected nodes
  return '#64748b';
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

    for (const rel of relationships) {
      const a = positions.get(rel.wordA);
      const b = positions.get(rel.wordB);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      a.vx += dx * attraction;
      a.vy += dy * attraction;
      b.vx -= dx * attraction;
      b.vy -= dy * attraction;
    }

    for (const word of words) {
      const pos = positions.get(word)!;
      pos.vx += (width / 2 - pos.x) * centerPull;
      pos.vy += (height / 2 - pos.y) * centerPull;
    }

    const padding = 60;
    for (const word of words) {
      const pos = positions.get(word)!;
      pos.x += pos.vx;
      pos.y += pos.vy;
      pos.vx *= damping;
      pos.vy *= damping;
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
  const [showAll, setShowAll] = useState(false);

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

  // Determine which words are connected to the highlighted word
  const connectedWords = useMemo(() => {
    if (!highlightWord) return new Set<string>();
    const connected = new Set<string>();
    for (const rel of relationships) {
      if (rel.wordA === highlightWord) connected.add(rel.wordB);
      if (rel.wordB === highlightWord) connected.add(rel.wordA);
    }
    return connected;
  }, [highlightWord, relationships]);

  // Determine which edges to show
  const visibleEdges = useMemo(() => {
    if (showAll) return relationships;
    if (!highlightWord) return []; // No edges when nothing selected
    return relationships.filter(
      r => r.wordA === highlightWord || r.wordB === highlightWord
    );
  }, [relationships, highlightWord, showAll]);

  const getEdgeId = useCallback(
    (r: WordRelationship) => `${r.wordA}-${r.type}-${r.wordB}`,
    []
  );

  // Determine node visibility
  const isNodeVisible = useCallback(
    (word: string) => {
      if (showAll) return true;
      if (!highlightWord) return true; // All labels visible when nothing selected
      return word === highlightWord || connectedWords.has(word);
    },
    [showAll, highlightWord, connectedWords]
  );

  return (
    <div ref={containerRef} className="w-full h-[400px] relative">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      >
        {/* Edges — only visible ones */}
        {visibleEdges.map(rel => {
          const a = positions.get(rel.wordA);
          const b = positions.get(rel.wordB);
          if (!a || !b) return null;
          const edgeId = getEdgeId(rel);
          const isHovered = hoveredEdge && getEdgeId(hoveredEdge) === edgeId;

          return (
            <g key={edgeId}>
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
                opacity={isHovered ? 1 : 0.6}
                className="pointer-events-none transition-opacity"
              />
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
          const isConnected = connectedWords.has(word);
          const visible = isNodeVisible(word);
          const nodeColor = getNodeColor(word, learnedWords, highlightWord, isConnected);
          const borderColor = getNodeBorder(word, learnedWords, highlightWord);
          // Fade non-connected nodes when a word is selected
          const nodeOpacity = !highlightWord || visible ? 1 : 0.15;

          return (
            <motion.g
              key={word}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: nodeOpacity, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
            >
              {isHighlight && (
                <circle
                  cx={pos.x} cy={pos.y} r={36}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={1}
                  opacity={0.3}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={26}
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
                fontSize={isHighlight ? 12 : 11}
                fontWeight={isHighlight ? 700 : visible ? 500 : 400}
                onClick={() => onWordClick(word)}
                className="cursor-pointer select-none"
              >
                {word.length > 12 ? word.slice(0, 11) + '\u2026' : word}
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
            {hoveredEdge.wordA} \u2194 {hoveredEdge.wordB}
          </div>
          <div className="text-muted-foreground mt-0.5">
            {hoveredEdge.type.replace(/_/g, ' ')}
          </div>
          <div className="text-foreground mt-1">{hoveredEdge.shadeNote}</div>
        </div>
      )}

      {/* Show all toggle — bottom right */}
      <div className="absolute bottom-2 right-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[10px] text-muted-foreground"
          onClick={() => setShowAll(prev => !prev)}
        >
          {showAll ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {showAll ? 'Focus mode' : 'Show all'}
        </Button>
      </div>

      {/* Hint when no word selected */}
      {!highlightWord && !showAll && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs text-muted-foreground/50 bg-background/80 px-3 py-1.5 rounded-lg">
            Click a word to see its connections
          </p>
        </div>
      )}
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
  const tipX = b.x - nx * 28;
  const tipY = b.y - ny * 28;
  const baseX = tipX - nx * 8;
  const baseY = tipY - ny * 8;
  const perpX = -ny * 4;
  const perpY = nx * 4;
  return `${tipX},${tipY} ${baseX + perpX},${baseY + perpY} ${baseX - perpX},${baseY - perpY}`;
}
