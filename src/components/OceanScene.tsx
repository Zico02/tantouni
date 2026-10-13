import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const SUN_DIR = new THREE.Vector3(0.0, 0.16, -1).normalize();

const ocean = {
  vertex: /* glsl */ `
    uniform float uTime;
    varying vec3 vWorld;
    varying vec3 vNormal;
    varying float vH;

    float h(vec2 p) {
      float t = uTime;
      float y = 0.0;
      y += sin(dot(p, vec2(0.80, 0.60)) * 0.16 + t * 0.9) * 0.55;
      y += sin(dot(p, vec2(-0.55, 0.83)) * 0.23 + t * 1.15) * 0.32;
      y += sin(dot(p, vec2(0.95, -0.30)) * 0.41 + t * 1.6) * 0.16;
      y += sin(dot(p, vec2(-0.20, -0.98)) * 0.67 + t * 2.1) * 0.08;
      y += sin(dot(p, vec2(0.62, 0.78)) * 1.13 + t * 2.7) * 0.04;
      return y;
    }

    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      vec2 p = world.xz;
      float e = 0.15;
      float y = h(p);
      vec3 n = normalize(vec3(h(p - vec2(e, 0.0)) - h(p + vec2(e, 0.0)), 2.0 * e, h(p - vec2(0.0, e)) - h(p + vec2(0.0, e))));
      world.y += y;
      vWorld = world.xyz;
      vNormal = n;
      vH = y;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragment: /* glsl */ `
    uniform float uTime;
    uniform vec3 uSun;
    uniform vec3 uDeep;
    uniform vec3 uShallow;
    uniform vec3 uSky;
    uniform vec3 uHorizon;
    varying vec3 vWorld;
    varying vec3 vNormal;
    varying float vH;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }

    void main() {
      vec3 v = normalize(cameraPosition - vWorld);
      // fine ripples
      vec2 q = vWorld.xz * 1.6;
      float r1 = noise(q + uTime * vec2(0.6, 0.9));
      float r2 = noise(q * 2.3 - uTime * vec2(0.8, 0.4));
      vec3 n = normalize(vNormal + vec3(r1 - 0.5, 0.0, r2 - 0.5) * 0.35);

      float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
      vec3 water = mix(uDeep, uShallow, clamp(vH * 0.6 + 0.45, 0.0, 1.0));
      vec3 refl = mix(uHorizon, uSky, clamp(reflect(-v, n).y * 2.5, 0.0, 1.0));
      vec3 col = mix(water, refl, clamp(fres * 0.9 + 0.08, 0.0, 1.0));

      vec3 rd = reflect(-v, n);
      float spec = pow(max(dot(rd, uSun), 0.0), 380.0) * 7.0 + pow(max(dot(rd, uSun), 0.0), 40.0) * 0.35;
      col += vec3(1.0, 0.93, 0.75) * spec;

      // foam on crests
      col += smoothstep(0.62, 0.95, vH + r1 * 0.25) * 0.18;

      float dist = length(vWorld.xz - cameraPosition.xz);
      col = mix(col, uHorizon, smoothstep(60.0, 260.0, dist));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }
  `,
};

const sky = {
  vertex: /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: /* glsl */ `
    uniform float uTime;
    uniform vec3 uSun;
    uniform vec3 uSky;
    uniform vec3 uHorizon;
    varying vec3 vDir;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float s = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { s += noise(p) * a; p *= 2.03; a *= 0.5; }
      return s;
    }

    void main() {
      vec3 d = normalize(vDir);
      float y = max(d.y, 0.0);
      vec3 col = mix(uHorizon, uSky, pow(y, 0.55));
      float sd = max(dot(d, uSun), 0.0);
      col += vec3(1.0, 0.85, 0.55) * pow(sd, 6.0) * 0.45;
      col += vec3(1.0, 0.95, 0.85) * pow(sd, 900.0) * 8.0;
      // clouds
      vec2 uv = d.xz / (d.y + 0.12) * 1.4 + vec2(uTime * 0.012, 0.0);
      float c = smoothstep(0.52, 0.85, fbm(uv));
      col = mix(col, vec3(1.0), c * smoothstep(0.0, 0.25, y) * 0.85);
      if (d.y < 0.0) col = uHorizon;
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }
  `,
};

const palette = {
  uDeep: new THREE.Color('#021c4a'),
  uShallow: new THREE.Color('#0a63c9'),
  uSky: new THREE.Color('#1b6fe0'),
  uHorizon: new THREE.Color('#bfe4ff'),
};

function Ocean() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSun: { value: SUN_DIR },
      uDeep: { value: palette.uDeep },
      uShallow: { value: palette.uShallow },
      uSky: { value: palette.uSky },
      uHorizon: { value: palette.uHorizon },
    }),
    [],
  );
  useFrame((_, dt) => { if (mat.current) mat.current.uniforms.uTime.value += dt; });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -120]}>
      <planeGeometry args={[600, 320, 300, 180]} />
      <shaderMaterial ref={mat} vertexShader={ocean.vertex} fragmentShader={ocean.fragment} uniforms={uniforms} />
    </mesh>
  );
}

function Sky() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSun: { value: SUN_DIR }, uSky: { value: palette.uSky }, uHorizon: { value: palette.uHorizon } }),
    [],
  );
  useFrame((_, dt) => { if (mat.current) mat.current.uniforms.uTime.value += dt; });
  return (
    <mesh>
      <sphereGeometry args={[500, 48, 24]} />
      <shaderMaterial ref={mat} side={THREE.BackSide} depthWrite={false} vertexShader={sky.vertex} fragmentShader={sky.fragment} uniforms={uniforms} />
    </mesh>
  );
}

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.03;
    camera.position.y = 3 + Math.sin(t * 0.8) * 0.18 + pointer.y * 0.4;
    camera.rotation.z = Math.sin(t * 0.6) * 0.012;
    camera.lookAt(0, 2.2, -60);
  });
  return null;
}

export default function OceanScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 3, 12], fov: 52, near: 0.1, far: 1200 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Sky />
        <Ocean />
        <CameraRig />
        <EffectComposer>
          <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.7} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
