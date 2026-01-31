import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SkillCategory } from '@/services/skillEngine';

interface BrainPlexusProps {
  categoryScores: Record<SkillCategory, { mu: number; sigma: number }>;
}

// ----------------------------------------------------------------------
// 1. Geometry Helpers (Reused from Brain3D to maintain shape)
// ----------------------------------------------------------------------

function createFrontalLobeGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.5, 10, 8);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);
    z *= 1.3;
    y *= 0.8;
    x = isLeft ? x * 0.8 - 0.35 : x * 0.8 + 0.35;
    positions.setXYZ(i, x, y + 0.2, z + 0.7);
  }
  return geometry;
}

function createTemporalLobeGeometry(isLeft: boolean): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.4, 8, 6);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);
    x *= 1.2;
    z *= 1.4;
    y *= 0.7;
    const side = isLeft ? -1 : 1;
    x = x * 0.8 + side * 0.7;
    positions.setXYZ(i, x, y - 0.45, z + 0.1);
  }
  return geometry;
}

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
  return geometry;
}

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
  return geometry;
}

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
  return geometry;
}

// ----------------------------------------------------------------------
// 2. Plexus Component
// ----------------------------------------------------------------------

function PlexusMesh() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Combine all geometries into one set of points
  const { points, lineGeometry } = useMemo(() => {
    const geometries = [
      createFrontalLobeGeometry(true),
      createFrontalLobeGeometry(false),
      createTemporalLobeGeometry(true),
      createTemporalLobeGeometry(false),
      createParietalLobeGeometry(true),
      createParietalLobeGeometry(false),
      createOccipitalLobeGeometry(),
      createCerebellumGeometry(),
    ];

    const allPoints: THREE.Vector3[] = [];
    geometries.forEach(geo => {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        // Add some random jitter to make it look organic
        const jitter = 0.05;
        const pt = new THREE.Vector3(
          pos.getX(i) + (Math.random() - 0.5) * jitter,
          pos.getY(i) + (Math.random() - 0.5) * jitter,
          pos.getZ(i) + (Math.random() - 0.5) * jitter
        );
        allPoints.push(pt);
      }
    });

    // Create line connections (Plexus effect)
    const linePos: number[] = [];
    const maxDist = 0.5; // Connection distance threshold
    
    // Naive O(N^2) connection - okay for small point count (~500 points)
    for (let i = 0; i < allPoints.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < allPoints.length; j++) {
        // Limit connections per point to avoid clutter
        if (connections > 4) break; 
        
        const dist = allPoints[i].distanceTo(allPoints[j]);
        if (dist < maxDist) {
          linePos.push(allPoints[i].x, allPoints[i].y, allPoints[i].z);
          linePos.push(allPoints[j].x, allPoints[j].y, allPoints[j].z);
          connections++;
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    
    // Point geometry
    const pointGeo = new THREE.BufferGeometry().setFromPoints(allPoints);

    return { points: pointGeo, lineGeometry: lineGeo };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1; // Slow rotation
    }
    // Pulse effect on points
    if (pointsRef.current) {
        const time = state.clock.getElapsedTime();
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.size = 0.04 + Math.sin(time * 2) * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The Points (Nodes) */}
      <points ref={pointsRef} geometry={points}>
        <pointsMaterial
          color="#38bdf8" // Sky-400 (Cyan/Blue)
          size={0.04}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* The Lines (Edges) */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#0ea5e9" // Sky-500
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Inner Glow Sphere to give volume */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
            color="#0284c7" // Sky-600
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------------------------
// 3. Main Export
// ----------------------------------------------------------------------

export function BrainPlexus({ categoryScores }: BrainPlexusProps) {
  return (
    <div
      className="w-full h-[400px] md:h-[500px] bg-[#0f172a] rounded-xl overflow-hidden relative"
      role="img"
      aria-label="3D Plexus Brain Visualization"
    >
      {/* Background Gradient to match reference (Dark Blue Vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />

        <PlexusMesh />
      </Canvas>
    </div>
  );
}
