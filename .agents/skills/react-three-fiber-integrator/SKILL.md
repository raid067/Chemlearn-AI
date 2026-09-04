---
name: react-three-fiber-integrator
description: Expert workflow for migrating Vanilla JS/Three.js 3D simulations and heavy DOM animations into Next.js App Router using React Three Fiber and Framer Motion.
---

# React Three Fiber & Motion Integrator

This skill provides the mandatory architectural patterns for integrating 3D graphics (WebGL/Three.js) and complex hardware-accelerated animations into a Next.js App Router (React 19) environment.

## 1. Context & Use Case
Use this skill whenever you need to:
- Port Vanilla JS WebGL/Three.js scripts (e.g., `inject-three.js`) into React components.
- Build interactive science simulations or 3D models.
- Implement gesture-based animations (drag, physics, spring).
- Avoid SSR (Server-Side Rendering) Hydration crashes when dealing with browser-only Canvas APIs.

## 2. Core Rules & Boundaries

### The Client Boundary (`'use client'`)
All 3D Canvas elements and Motion components **MUST** be executed purely on the client. 
- You must add `'use client';` to the top of any file utilizing `@react-three/fiber`, `@react-three/drei`, or `framer-motion`.

### Dynamic Imports for Next.js (`ssr: false`)
The Next.js server cannot render WebGL. Any parent component that wraps a `<Canvas>` must be dynamically imported with SSR disabled if it relies on browser window APIs prior to hydration.
```typescript
import dynamic from 'next/dynamic';

// Correct way to import a 3D scene in a Next.js Server Component
const ChemistryScene = dynamic(() => import('@/components/3d/ChemistryScene'), { 
  ssr: false,
  loading: () => <div className="spinner">Loading Simulation...</div>
});
```

## 3. React Three Fiber (R3F) Workflow

When converting vanilla `THREE.Scene` code to R3F:
1. **Never use raw `new THREE.Mesh()`** inside a React render function. Use declarative JSX: `<mesh><boxGeometry /><meshStandardMaterial /></mesh>`.
2. **Leverage Drei:** Use `@react-three/drei` for all controls, environments, and loaders.
   - Example: `<OrbitControls />`, `<Environment preset="laboratory" />`, `useGLTF('/model.glb')`.
3. **The Render Loop (`useFrame`):** Move all animation logic out of `requestAnimationFrame` and into the R3F `useFrame` hook. Do not update React state inside `useFrame` as it will cause 60fps re-renders of the DOM. Instead, mutate Three.js `ref` properties directly.

```tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function SpinningMolecule() {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#6d28d9" wireframe />
    </mesh>
  );
}
```

## 4. State Management Integration (Zustand)
When bridging 3D interactions (e.g., clicking a 3D beaker) with the 2D DOM (e.g., updating a score or text overlay):
1. **Do not pass props deeply** down the Canvas tree if they update frequently.
2. **Use Zustand** to share state between the DOM layer and the Canvas layer.
3. **Transient Updates:** If the 3D scene needs to read state every frame without re-rendering the component, use Zustand's transient state subscription pattern: `useStore.subscribe(state => ...)`.

## 5. Animation (Framer Motion)
When porting complex CSS animations or DOM manipulations:
1. Use `<motion.div>` instead of standard `<div>`.
2. **Avoid Layout Thrashing:** Animate only `transform` (x, y, scale, rotate) and `opacity`. Never animate `width`, `height`, or `top`/`left` unless utilizing Motion's layout animations (`layout` prop).
3. **Gestures:** Replace vanilla JS drag listeners with Motion's `<motion.div drag>` props.

## 6. Optimization Checklist
- [ ] Are 3D assets loaded using `useGLTF` and compressed (Draco/WEBP)?
- [ ] Is the `<Canvas>` isolated in its own file to prevent unnecessary re-renders of the parent DOM?
- [ ] Are we using `<Suspense>` to catch loading states for models and textures?
- [ ] Is `ssr: false` applied at the route/page level for the heavy simulation components?
