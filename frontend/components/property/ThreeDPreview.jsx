'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// GLB Model Loader Component
function Model({ url }) {
  const { scene } = useGLTF(url); // Load GLB file
  const ref = useRef();

  // Auto-rotate the model slowly
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001; // Slow rotation
    }
  });

  return <primitive ref={ref} object={scene} scale={1} position={[0, 0, 0]} />;
}

// Main 3D Preview Component
export default function ThreeDPreview({ modelUrl = '/models/property.glb' }) { // Default model path
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-purple-500/30 shadow-xl">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }} // Camera setup
        shadows
        style={{ background: 'transparent' }} // Transparent background for glassmorphism
      >
        {/* Lights */}
        <ambientLight intensity={0.5} /> // Soft ambient light
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        /> // Main light with shadows
        <pointLight position={[-5, 5, -5]} intensity={1} /> // Back light

        {/* Model */}
        <Model url={modelUrl} />

        {/* Controls */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> // User can rotate/zoom

        {/* Floor (optional reflection) */}
        <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.4} />
        </mesh>
      </Canvas>
    </div>
  );
}

// Preload the model for faster loading (optional)
useGLTF.preload('/models/property.glb');