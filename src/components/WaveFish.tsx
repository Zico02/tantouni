import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

// The detail-view fish: the image is mapped on a finely subdivided plane and a
// vertex shader bends it like a swimming body (travelling wave, stronger toward
// the tail, with a little depth so the light rolls over the flank).
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec2 vUv;
  varying float vSlope;
  void main() {
    vUv = uv;
    vec3 p = position;
    float k = pow(uv.x, 1.8) + 0.04;
    float ph = uv.x * 5.2 - uTime * 2.0;
    p.z += sin(ph) * uAmp * k;
    p.y += sin(ph + 1.2) * uAmp * 0.18 * k;
    vSlope = cos(ph) * k;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uDim;
  varying vec2 vUv;
  varying float vSlope;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.04) discard;
    float light = 1.0 + vSlope * 0.22;
    // soft moving caustics across the flank
    float ca = sin(vUv.x * 28.0 + uTime * 1.3) * sin(vUv.y * 22.0 - uTime * 1.1);
    c.rgb *= light;
    c.rgb += vec3(0.55, 0.8, 1.0) * smoothstep(0.55, 1.0, ca) * 0.12;
    c.rgb = mix(c.rgb, vec3(dot(c.rgb, vec3(0.3, 0.59, 0.11))), uDim);
    gl_FragColor = c;
    #include <colorspace_fragment>
  }
`;

function FishMesh({ src, dim }: { src: string; dim: boolean }) {
  const tex = useLoader(THREE.TextureLoader, src);
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const img = tex.image as HTMLImageElement;
  const aspect = img?.width && img?.height ? img.width / img.height : 2.6;
  const viewport = useThree((s) => s.viewport);
  // Fit inside the stage whatever its shape (portrait on mobile, wide on desktop).
  const w = Math.min(viewport.width * 0.8, viewport.height * 0.62 * aspect);
  const h = w / aspect;

  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { uMap: { value: tex }, uTime: { value: 0 }, uAmp: { value: 0.32 }, uDim: { value: 0 } };
  }, [tex]);

  useFrame((state, dt) => {
    if (!mat.current || !mesh.current) return;
    mat.current.uniforms.uTime.value += dt;
    mat.current.uniforms.uAmp.value = w * 0.075;
    mat.current.uniforms.uDim.value += ((dim ? 0.55 : 0) - mat.current.uniforms.uDim.value) * 0.08;
    const t = state.clock.elapsedTime;
    const { x, y } = state.pointer;
    mesh.current.rotation.y += (x * 0.35 - 0.12 - mesh.current.rotation.y) * 0.05;
    mesh.current.rotation.x += (-y * 0.2 - mesh.current.rotation.x) * 0.05;
    mesh.current.position.y = Math.sin(t * 0.7) * 0.08;
    mesh.current.position.x = Math.sin(t * 0.33) * 0.12;
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[w, h, 96, 24]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function WaveFish({ src, dim = false }: { src: string; dim?: boolean }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5.2], fov: 42 }} gl={{ alpha: true, antialias: true }} style={{ direction: 'ltr' }}>
      <Suspense fallback={null}>
        <FishMesh src={src} dim={dim} />
      </Suspense>
      <Sparkles count={40} scale={[7, 3.5, 2]} size={2.2} speed={0.35} opacity={0.5} color="#bfe8ff" />
    </Canvas>
  );
}
