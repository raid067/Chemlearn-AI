'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { OrbitControls, Environment } from '@react-three/drei';
import { useLabStore } from '@/stores/useLabStore';
import VRUI from './VRUI';

export default function ChemistryScene() {
  const activeLab = useLabStore(s => s.activeLab);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current && !active) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <>
      <OrbitControls makeDefault />
      <Environment preset="studio" />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <VRUI />

      <mesh 
        ref={meshRef}
        scale={active ? 1.2 : 1}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={hovered ? '#fbbf24' : (activeLab === 'composites' ? '#c2410c' : activeLab === 'glass' ? '#059669' : '#6d28d9')} 
          wireframe={activeLab === 'ceramics'}
          metalness={0.8}
          roughness={0.2}
          emissive={hovered ? '#fbbf24' : 'black'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
    </>
  );
}
