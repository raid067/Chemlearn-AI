'use client';
import { Text } from '@react-three/drei';
import { useLabStore } from '@/stores/useLabStore';

export default function VRUI() {
  const activeLab = useLabStore(s => s.activeLab);

  return (
    <group position={[-1.5, 1.5, -2]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        {activeLab ? activeLab.charAt(0).toUpperCase() + activeLab.slice(1) + ' Lab' : 'Virtual Lab'}
      </Text>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="left"
        anchorY="top"
      >
        Interactive 3D Simulation
      </Text>
    </group>
  );
}
