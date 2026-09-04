'use client';
import { useLabStore } from '@/stores/useLabStore';
import { useRef } from 'react';
import dynamic from 'next/dynamic';

const ChemistryScene = dynamic(() => import('@/components/3d/ChemistryScene'), {
  ssr: false,
  loading: () => <div className="text-white text-xl">Loading Simulation...</div>
});

// Since Next.js requires dynamic imports to be outside of the component body,
// we also dynamically import the Canvas to prevent any hydration mismatch for R3F.
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false });

export default function VirtualLab() {
  const { activeLab } = useLabStore();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-slate-900 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
        <h2 className="text-xl font-bold capitalize">{activeLab} Lab</h2>
        <p className="text-sm text-slate-400">Interactive 3D Simulation</p>
      </div>
      
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <ChemistryScene />
      </Canvas>
    </div>
  );
}
