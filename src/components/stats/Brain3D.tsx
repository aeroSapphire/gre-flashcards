
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SkillCategory } from '@/services/skillEngine';

interface Brain3DProps {
  categoryScores: Record<SkillCategory, { mu: number; sigma: number }>;
  onRegionHover: (region: SkillCategory | null) => void;
  onRegionClick: (region: SkillCategory) => void;
  hoveredRegion: SkillCategory | null;
}

// Get color based on skill level
function getSkillColor(mu: number): string {
  if (mu < 30) return '#ef4444';
  if (mu < 50) return '#f97316';
  if (mu < 70) return '#eab308';
  if (mu < 90) return '#84cc16';
  return '#22c55e';
}

// Brain region mesh component
function BrainRegion({
  geometry,
  color,
  isHovered,
  onHover,
  onClick,
  position = [0, 0, 0] as [number, number, number]
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
  onClick: () => void;
  position?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 15);
  }, [geometry]);

  return (
    <group position={position}>
      {/* Solid mesh with low opacity */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(true); }}
        onPointerLeave={() => onHover(false)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.4 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments ref={edgesRef} geometry={edgesGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 1 : 0.7}
          linewidth={1}
        />
      </lineSegments>

      {/* Glowing points at vertices */}
      <points geometry={geometry}>
        <pointsMaterial
          color={color}
          size={isHovered ? 0.04 : 0.025}
          transparent
          opacity={isHovered ? 1 : 0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// Create brain hemisphere geometry
function createHemisphereGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, 16, 12,
    isLeft ? Math.PI : 0,
    Math.PI,
    0,
    Math.PI
  );

  // Deform to look more brain-like
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    // Flatten top and stretch front
    y *= 0.75;

    // Bulge at front (frontal lobe)
    if (z > 0.3) {
      x *= 1 + (z - 0.3) * 0.3;
      z *= 1.1;
    }

    // Narrow at back (occipital)
    if (z < -0.3) {
      x *= 0.85;
    }

    // Bulge at bottom sides (temporal lobes)
    if (y < -0.2) {
      const factor = 1 + Math.abs(y + 0.2) * 0.4;
      x *= factor;
    }

    positions.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Create frontal lobe geometry
function createFrontalLobeGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.5, 10, 8);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    // Make it more elongated forward
    z *= 1.3;
    y *= 0.8;

    // Shift based on hemisphere
    x = isLeft ? x * 0.8 - 0.35 : x * 0.8 + 0.35;

    positions.setXYZ(i, x, y + 0.2, z + 0.7);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Create temporal lobe geometry
function createTemporalLobeGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.4, 8, 6);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    // Elongate horizontally
    x *= 1.2;
    z *= 1.4;
    y *= 0.7;

    const side = isLeft ? -1 : 1;
    x = x * 0.8 + side * 0.7;

    positions.setXYZ(i, x, y - 0.45, z + 0.1);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Create parietal lobe geometry
function createParietalLobeGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.45, 10, 8);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    y *= 0.7;

    const side = isLeft ? -1 : 1;
    x = x * 0.8 + side * 0.4;

    positions.setXYZ(i, x, y + 0.45, z - 0.1);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Create occipital lobe geometry
function createOccipitalLobeGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.4, 10, 8);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    x *= 1.3;
    y *= 0.8;
    z *= 0.9;

    positions.setXYZ(i, x, y, z - 0.85);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Create cerebellum geometry
function createCerebellumGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.35, 12, 8);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    x *= 1.5;
    y *= 0.6;

    positions.setXYZ(i, x, y - 0.55, z - 0.7);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Create brain stem geometry
function createBrainStemGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    positions.setXYZ(i, x, y - 0.7, z - 0.5);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Neural connection lines between points
function NeuralConnections({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];

    // Connect nearby points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < 0.4 && Math.random() < 0.15) {
          positions.push(points[i].x, points[i].y, points[i].z);
          positions.push(points[j].x, points[j].y, points[j].z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [points]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.2} />
    </lineSegments>
  );
}

// Main brain mesh component
function BrainMesh({ categoryScores, onRegionHover, onRegionClick, hoveredRegion }: Brain3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  // Create geometries
  const geometries = useMemo(() => ({
    frontalLeft: createFrontalLobeGeometry(true),
    frontalRight: createFrontalLobeGeometry(false),
    temporalLeft: createTemporalLobeGeometry(true),
    temporalRight: createTemporalLobeGeometry(false),
    parietalLeft: createParietalLobeGeometry(true),
    parietalRight: createParietalLobeGeometry(false),
    occipital: createOccipitalLobeGeometry(),
    cerebellum: createCerebellumGeometry(),
    brainstem: createBrainStemGeometry(),
  }), []);

  // Extract points for neural connections
  const allPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    Object.values(geometries).forEach(geo => {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i += 3) {
        points.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
      }
    });
    return points;
  }, [geometries]);

  const getColor = (category: SkillCategory) => getSkillColor(categoryScores[category]?.mu ?? 50);

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setAutoRotate(false)}
      onPointerOut={() => setAutoRotate(true)}
      scale={1.2}
    >
      {/* Ambient glow */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Neural connections background */}
      <NeuralConnections points={allPoints} color="#06b6d4" />

      {/* Logic - Frontal Lobes (Blue) */}
      <BrainRegion
        geometry={geometries.frontalLeft}
        color={getColor('logic')}
        isHovered={hoveredRegion === 'logic'}
        onHover={(h) => onRegionHover(h ? 'logic' : null)}
        onClick={() => onRegionClick('logic')}
      />
      <BrainRegion
        geometry={geometries.frontalRight}
        color={getColor('logic')}
        isHovered={hoveredRegion === 'logic'}
        onHover={(h) => onRegionHover(h ? 'logic' : null)}
        onClick={() => onRegionClick('logic')}
      />

      {/* Vocab - Temporal Lobes (Purple) */}
      <BrainRegion
        geometry={geometries.temporalLeft}
        color={getColor('vocab')}
        isHovered={hoveredRegion === 'vocab'}
        onHover={(h) => onRegionHover(h ? 'vocab' : null)}
        onClick={() => onRegionClick('vocab')}
      />
      <BrainRegion
        geometry={geometries.temporalRight}
        color={getColor('vocab')}
        isHovered={hoveredRegion === 'vocab'}
        onHover={(h) => onRegionHover(h ? 'vocab' : null)}
        onClick={() => onRegionClick('vocab')}
      />

      {/* Context - Parietal Lobes (Yellow) */}
      <BrainRegion
        geometry={geometries.parietalLeft}
        color={getColor('context')}
        isHovered={hoveredRegion === 'context'}
        onHover={(h) => onRegionHover(h ? 'context' : null)}
        onClick={() => onRegionClick('context')}
      />
      <BrainRegion
        geometry={geometries.parietalRight}
        color={getColor('context')}
        isHovered={hoveredRegion === 'context'}
        onHover={(h) => onRegionHover(h ? 'context' : null)}
        onClick={() => onRegionClick('context')}
      />

      {/* Precision - Occipital + Cerebellum (Green) */}
      <BrainRegion
        geometry={geometries.occipital}
        color={getColor('precision')}
        isHovered={hoveredRegion === 'precision'}
        onHover={(h) => onRegionHover(h ? 'precision' : null)}
        onClick={() => onRegionClick('precision')}
      />
      <BrainRegion
        geometry={geometries.cerebellum}
        color={getColor('precision')}
        isHovered={hoveredRegion === 'precision'}
        onHover={(h) => onRegionHover(h ? 'precision' : null)}
        onClick={() => onRegionClick('precision')}
      />

      {/* Brain stem (neutral) */}
      <mesh geometry={geometries.brainstem}>
        <meshBasicMaterial color="#64748b" transparent opacity={0.3} />
      </mesh>
      <lineSegments geometry={new THREE.EdgesGeometry(geometries.brainstem, 15)}>
        <lineBasicMaterial color="#64748b" transparent opacity={0.5} />
      </lineSegments>
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
    <div
      className="w-full h-[400px] md:h-[500px] bg-gradient-to-b from-slate-900/50 to-slate-800/30 rounded-xl"
      role="img"
      aria-label="Interactive 3D Brain Map showing skill proficiency across four cognitive regions. Rotate to view different angles, or use the list below to highlight specific regions."
    >
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3 / 4}
        />

        <BrainMesh
          categoryScores={categoryScores}
          onRegionHover={onRegionHover}
          onRegionClick={onRegionClick}
          hoveredRegion={hoveredRegion}
        />
      </Canvas>
    </div>
  );
}

export default Brain3D;
