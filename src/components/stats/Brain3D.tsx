
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SkillCategory } from '@/services/skillEngine';

interface Brain3DProps {
  categoryScores: Record<SkillCategory, { mu: number; sigma: number }>;
  onRegionHover: (region: SkillCategory | null) => void;
  onRegionClick: (region: SkillCategory) => void;
  hoveredRegion: SkillCategory | null;
}

// Brain region definitions with approximate 3D positions
const BRAIN_REGIONS: Record<SkillCategory, {
  center: [number, number, number];
  color: string;
  vertices: [number, number, number][];
}> = {
  logic: {
    center: [-0.3, 0.4, 0.3],
    color: '#3b82f6', // Blue - Frontal lobe
    vertices: generateRegionVertices(-0.3, 0.4, 0.3, 0.5, 40)
  },
  vocab: {
    center: [-0.2, -0.2, 0.2],
    color: '#8b5cf6', // Purple - Temporal lobe
    vertices: generateRegionVertices(-0.2, -0.2, 0.2, 0.45, 35)
  },
  context: {
    center: [0.3, 0.3, -0.1],
    color: '#eab308', // Yellow - Parietal lobe
    vertices: generateRegionVertices(0.3, 0.3, -0.1, 0.45, 35)
  },
  precision: {
    center: [0.4, -0.1, -0.3],
    color: '#22c55e', // Green - Occipital lobe
    vertices: generateRegionVertices(0.4, -0.1, -0.3, 0.4, 30)
  }
};

// Generate vertices for a brain region (clustered points)
function generateRegionVertices(
  cx: number, cy: number, cz: number,
  radius: number,
  count: number
): [number, number, number][] {
  const vertices: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.5 + Math.random() * 0.5);
    vertices.push([
      cx + r * Math.sin(phi) * Math.cos(theta),
      cy + r * Math.sin(phi) * Math.sin(theta),
      cz + r * Math.cos(phi)
    ]);
  }
  return vertices;
}

// Generate brain outline vertices (general brain shape)
function generateBrainOutline(): [number, number, number][] {
  const vertices: [number, number, number][] = [];

  // Create brain-like shape using parametric equations
  for (let i = 0; i < 80; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;

    // Brain-like ellipsoid with some deformation
    const rx = 1.0 + 0.2 * Math.sin(3 * u);
    const ry = 0.7 + 0.1 * Math.cos(2 * v);
    const rz = 0.8 + 0.15 * Math.sin(2 * u + v);

    vertices.push([
      rx * Math.sin(v) * Math.cos(u),
      ry * Math.sin(v) * Math.sin(u) * 0.8,
      rz * Math.cos(v)
    ]);
  }

  return vertices;
}

// Get color based on skill level
function getSkillColor(mu: number, baseColor: string): string {
  if (mu < 30) return '#ef4444';
  if (mu < 50) return '#f97316';
  if (mu < 70) return baseColor;
  if (mu < 90) return '#84cc16';
  return '#22c55e';
}

// Brain mesh component
function BrainMesh({ categoryScores, onRegionHover, onRegionClick, hoveredRegion }: Brain3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate the brain
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Generate all points and connections
  const { points, connections, regionPoints } = useMemo(() => {
    const allPoints: THREE.Vector3[] = [];
    const allConnections: [number, number][] = [];
    const regionPointsMap: Record<SkillCategory, number[]> = {
      logic: [], vocab: [], context: [], precision: []
    };

    // Add brain outline points
    const outlineVertices = generateBrainOutline();
    outlineVertices.forEach(v => {
      allPoints.push(new THREE.Vector3(...v));
    });

    // Add region-specific points
    let pointIndex = allPoints.length;
    (Object.keys(BRAIN_REGIONS) as SkillCategory[]).forEach(region => {
      const regionData = BRAIN_REGIONS[region];
      regionData.vertices.forEach(v => {
        regionPointsMap[region].push(allPoints.length);
        allPoints.push(new THREE.Vector3(...v));
      });
    });

    // Generate connections (neural network style)
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        const dist = allPoints[i].distanceTo(allPoints[j]);
        // Connect nearby points with probability based on distance
        if (dist < 0.5 && Math.random() < 0.3) {
          allConnections.push([i, j]);
        } else if (dist < 0.8 && Math.random() < 0.08) {
          allConnections.push([i, j]);
        }
      }
    }

    return { points: allPoints, connections: allConnections, regionPoints: regionPointsMap };
  }, []);

  // Create line segments for connections
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    connections.forEach(([i, j]) => {
      positions.push(points[i].x, points[i].y, points[i].z);
      positions.push(points[j].x, points[j].y, points[j].z);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [points, connections]);

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setAutoRotate(false)}
      onPointerOut={() => setAutoRotate(true)}
    >
      {/* Neural connections (lines) */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Brain outline points */}
      {points.slice(0, 80).map((point, i) => (
        <mesh key={`outline-${i}`} position={point}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* Region-specific points with interactivity */}
      {(Object.keys(BRAIN_REGIONS) as SkillCategory[]).map(region => {
        const regionData = BRAIN_REGIONS[region];
        const score = categoryScores[region] || { mu: 50, sigma: 15 };
        const color = getSkillColor(score.mu, regionData.color);
        const isHovered = hoveredRegion === region;
        const scale = isHovered ? 1.3 : 1;
        const opacity = isHovered ? 1 : 0.8;

        return (
          <group key={region}>
            {regionPoints[region].map((pointIdx, i) => (
              <mesh
                key={`${region}-${i}`}
                position={points[pointIdx]}
                scale={scale}
                onPointerEnter={(e) => {
                  e.stopPropagation();
                  onRegionHover(region);
                }}
                onPointerLeave={() => onRegionHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onRegionClick(region);
                }}
              >
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity}
                />
              </mesh>
            ))}

            {/* Glowing center for each region */}
            <mesh position={regionData.center} scale={isHovered ? 1.5 : 1}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isHovered ? 0.6 : 0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Ambient glow effect */}
      <mesh>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Main exported component
export function Brain3D({
  categoryScores,
  onRegionHover,
  onRegionClick,
  hoveredRegion
}: Brain3DProps) {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Controls for manual interaction */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={5}
          autoRotate={false}
        />

        {/* Floating effect wrapper */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <BrainMesh
            categoryScores={categoryScores}
            onRegionHover={onRegionHover}
            onRegionClick={onRegionClick}
            hoveredRegion={hoveredRegion}
          />
        </Float>
      </Canvas>
    </div>
  );
}

export default Brain3D;
