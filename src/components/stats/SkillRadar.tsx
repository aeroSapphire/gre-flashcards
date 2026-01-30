
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserSkill, SkillType, ALL_SKILL_TYPES, getSkillDisplayName } from '@/services/skillEngine';

interface SkillRadarProps {
  skills: UserSkill[];
}

// Colors for skill levels (same as BrainMap)
const getSkillColor = (mu: number) => {
  if (mu < 30) return "#ef4444"; // Red-500
  if (mu < 50) return "#f97316"; // Orange-500
  if (mu < 70) return "#eab308"; // Yellow-500
  if (mu < 90) return "#84cc16"; // Lime-500
  return "#22c55e"; // Green-500
};

const DEFAULT_MU = 50;
const DEFAULT_SIGMA = 15;

export function SkillRadar({ skills }: SkillRadarProps) {
  // Check if using old schema
  const isOldSchema = useMemo(() => {
    const oldCategoryNames = ['precision', 'vocab', 'logic', 'context'];
    return skills.some(s => oldCategoryNames.includes(s.skill_type as string));
  }, [skills]);

  const skillMap = useMemo(() => {
    const map = new Map<SkillType, UserSkill>();
    skills.forEach(s => map.set(s.skill_type as SkillType, s));
    return map;
  }, [skills]);

  // Don't render detailed radar if using old schema
  if (isOldSchema) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 text-center">
        <h3 className="text-lg font-semibold mb-4">Detailed Skill Breakdown</h3>
        <p className="text-muted-foreground text-sm">
          Detailed 10-skill breakdown will be available after the database migration is applied.
          Currently showing aggregated 4-category view above.
        </p>
      </div>
    );
  }

  const getSkillData = (type: SkillType) => {
    return skillMap.get(type) || {
      mu: DEFAULT_MU,
      sigma: DEFAULT_SIGMA,
      skill_type: type,
      correct_count: 0,
      incorrect_count: 0,
      last_practice_at: ''
    };
  };

  // Radar chart configuration
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 150;
  const numSkills = ALL_SKILL_TYPES.length;
  const angleStep = (2 * Math.PI) / numSkills;

  // Calculate points for the radar polygon
  const radarPoints = useMemo(() => {
    return ALL_SKILL_TYPES.map((skillType, i) => {
      const data = skillMap.get(skillType) || {
        mu: DEFAULT_MU,
        sigma: DEFAULT_SIGMA,
        skill_type: skillType,
        correct_count: 0,
        incorrect_count: 0,
        last_practice_at: ''
      };
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const radius = (data.mu / 100) * maxRadius;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        skill: skillType,
        mu: data.mu,
        sigma: data.sigma,
        angle
      };
    });
  }, [skillMap, angleStep]);

  // Generate polygon path
  const polygonPath = radarPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Generate grid circles
  const gridLevels = [20, 40, 60, 80, 100];

  // Generate axis lines and labels
  const axes = ALL_SKILL_TYPES.map((skillType, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const endX = centerX + maxRadius * Math.cos(angle);
    const endY = centerY + maxRadius * Math.sin(angle);
    const labelRadius = maxRadius + 30;
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);

    return {
      skillType,
      startX: centerX,
      startY: centerY,
      endX,
      endY,
      labelX,
      labelY,
      angle
    };
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">Detailed Skill Breakdown</h3>
      <div className="relative">
        <svg viewBox="0 0 400 400" className="w-full h-auto overflow-visible">
          {/* Grid circles */}
          {gridLevels.map(level => (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={(level / 100) * maxRadius}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}

          {/* Grid level labels */}
          {gridLevels.map(level => (
            <text
              key={`label-${level}`}
              x={centerX + 5}
              y={centerY - (level / 100) * maxRadius}
              fontSize="10"
              fill="currentColor"
              opacity={0.4}
            >
              {level}
            </text>
          ))}

          {/* Axis lines */}
          {axes.map(axis => (
            <line
              key={axis.skillType}
              x1={axis.startX}
              y1={axis.startY}
              x2={axis.endX}
              y2={axis.endY}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeWidth={1}
            />
          ))}

          {/* Radar polygon with gradient fill */}
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <motion.path
            d={polygonPath}
            fill="url(#radarGradient)"
            stroke="#3b82f6"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Data points */}
          {radarPoints.map((point, i) => (
            <motion.circle
              key={point.skill}
              cx={point.x}
              cy={point.y}
              r={6}
              fill={getSkillColor(point.mu)}
              stroke="white"
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="cursor-pointer"
            />
          ))}

          {/* Skill labels */}
          {axes.map((axis, i) => {
            const data = getSkillData(axis.skillType);
            const shortName = getSkillDisplayName(axis.skillType).split(' ')[0];

            // Adjust text anchor based on position
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (axis.labelX < centerX - 20) textAnchor = 'end';
            else if (axis.labelX > centerX + 20) textAnchor = 'start';

            return (
              <g key={axis.skillType}>
                <text
                  x={axis.labelX}
                  y={axis.labelY}
                  fontSize="11"
                  fontWeight="500"
                  fill="currentColor"
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                >
                  {shortName}
                </text>
                <text
                  x={axis.labelX}
                  y={axis.labelY + 14}
                  fontSize="10"
                  fill={getSkillColor(data.mu)}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fontWeight="bold"
                >
                  {Math.round(data.mu)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        {ALL_SKILL_TYPES.map(skillType => {
          const data = getSkillData(skillType);
          const totalPractice = data.correct_count + data.incorrect_count;

          return (
            <div
              key={skillType}
              className="flex items-center gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: getSkillColor(data.mu) }}
              />
              <div className="min-w-0">
                <div className="font-medium truncate" title={getSkillDisplayName(skillType)}>
                  {getSkillDisplayName(skillType).split(' ')[0]}
                </div>
                <div className="text-muted-foreground">
                  {totalPractice > 0 ? `${totalPractice} practiced` : 'No data'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
