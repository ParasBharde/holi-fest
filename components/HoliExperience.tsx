'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const palette = ['#FF3CAC', '#FFB86B', '#33E8FF', '#7A5CFF', '#7CFC8A', '#FF5E5E'];
const stageLabels = ['Identity', 'Ignition', 'Resonance', 'Supernova'];

function colorFromName(name: string) {
  const seed = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

export default function HoliExperience() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const rafRef = useRef<number | null>(null);

  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState('Enter your name and use scroll to evolve the same hero scene.');
  const [challenge, setChallenge] = useState<{ target: string; options: string[] } | null>(null);
  const [challengeResult, setChallengeResult] = useState('');

  const personalColor = useMemo(() => colorFromName(name || 'Guest'), [name]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 5200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;
      velocities[i3] = (Math.random() - 0.5) * 0.004;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.004;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color('#ffffff'),
      size: 0.03,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    pointsRef.current = points;
    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    materialRef.current = material;

    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      if (positionsRef.current && velocitiesRef.current && pointsRef.current) {
        const pos = positionsRef.current;
        const vel = velocitiesRef.current;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          pos[i3] += vel[i3];
          pos[i3 + 1] += vel[i3 + 1] + Math.sin(t + i * 0.015) * 0.0008;
          pos[i3 + 2] += vel[i3 + 2];

          if (Math.abs(pos[i3]) > 4) vel[i3] *= -1;
          if (Math.abs(pos[i3 + 1]) > 3.5) vel[i3 + 1] *= -1;
          if (Math.abs(pos[i3 + 2]) > 4) vel[i3 + 2] *= -1;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.rotation.y += 0.0018;
        pointsRef.current.rotation.x += 0.0008;
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const onPointerMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1100px) rotateY(${x * 7}deg) rotateX(${y * -7}deg)`;
      }

      if (auraRef.current) {
        auraRef.current.style.transform = `translate(${x * 28}px, ${y * 28}px)`;
      }

      if (cameraRef.current) {
        gsap.to(cameraRef.current.position, {
          x: x * 0.45,
          y: y * 0.25,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    return () => window.removeEventListener('mousemove', onPointerMove);
  }, []);

  const applyStage = (nextStage: number) => {
    const material = materialRef.current;
    const points = pointsRef.current;
    if (!material || !points) return;

    if (nextStage === 0) {
      setStatus('Stage 1: Identity — your aura is forming.');
      gsap.to(material.color, { r: 1, g: 1, b: 1, duration: 0.8 });
      gsap.to(material, { size: 0.03, opacity: 0.7, duration: 0.8 });
      gsap.to(points.rotation, { x: 0, y: points.rotation.y + 0.5, duration: 1.2 });
    }

    if (nextStage === 1) {
      setStatus('Stage 2: Ignition — your personalized color ignites.');
      const c = new THREE.Color(personalColor);
      gsap.to(material.color, { r: c.r, g: c.g, b: c.b, duration: 0.9 });
      gsap.to(material, { size: 0.042, opacity: 0.95, duration: 0.9 });
      gsap.to(points.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.9, ease: 'expo.out' });
    }

    if (nextStage === 2) {
      setStatus('Stage 3: Resonance — cinematic swirl and parallax drift.');
      gsap.to(material, { size: 0.05, opacity: 0.9, duration: 0.8 });
      gsap.to(points.rotation, { y: points.rotation.y + 2.4, x: points.rotation.x + 0.8, duration: 1.2, ease: 'power2.out' });
      gsap.to(points.scale, { x: 2.4, y: 2.4, z: 2.4, duration: 1.1 });
    }

    if (nextStage === 3) {
      setStatus('Stage 4: Supernova — final aura challenge unlocked.');
      gsap.to(material, { size: 0.065, opacity: 1, duration: 0.6 });
      gsap.to(points.scale, { x: 3.4, y: 3.4, z: 3.4, duration: 0.9, ease: 'expo.out' });

      const answer = palette[Math.floor(Math.random() * palette.length)];
      const options = [answer, ...palette.filter((p) => p !== answer).sort(() => Math.random() - 0.5).slice(0, 2)].sort(
        () => Math.random() - 0.5
      );
      setChallenge({ target: answer, options });
      setChallengeResult('');
    }
  };

  useEffect(() => {
    if (!started || !rootRef.current) return;

    let lock = false;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (lock) return;
      lock = true;
      setTimeout(() => {
        lock = false;
      }, 420);

      setStage((current) => {
        const next = Math.min(3, Math.max(0, current + (event.deltaY > 0 ? 1 : -1)));
        if (next !== current) applyStage(next);
        return next;
      });
    };

    const node = rootRef.current;
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [started, personalColor]);

  const startJourney = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });

    setStarted(true);
    setStage(0);
    applyStage(0);
  };

  return (
    <main ref={rootRef} className="relative h-screen overflow-hidden bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-cyan-950 text-white">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div
        ref={auraRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <section className="relative z-10 mx-auto flex h-screen w-full max-w-6xl items-center justify-center px-6">
        <div ref={cardRef} className="glass w-full max-w-4xl rounded-3xl p-8 text-center transition-transform duration-150 md:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Single Hero • Scroll Controlled</p>
          <h1 className="mt-2 text-4xl font-bold md:text-6xl">Holi Parallax Supernova</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-200">
            Same hero page, no section jumps. Enter your name once, then scroll to evolve the scene from Identity → Ignition → Resonance → Supernova.
          </p>

          {!started ? (
            <form onSubmit={startJourney} className="mx-auto mt-8 flex max-w-lg flex-col gap-4 sm:flex-row">
              <input
                className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-105">Begin</button>
            </form>
          ) : (
            <div className="mt-8">
              <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
                {stageLabels.map((label, index) => (
                  <div key={label} className="flex-1">
                    <div className={`h-1.5 rounded-full ${index <= stage ? 'bg-cyan-300' : 'bg-white/20'}`} />
                    <p className={`mt-2 text-xs ${index === stage ? 'text-cyan-200' : 'text-slate-400'}`}>{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-cyan-200">{status}</p>
            </div>
          )}

          <p className="mt-4 text-sm text-slate-300">
            Your generated hue: <span className="font-semibold" style={{ color: personalColor }}>{personalColor}</span>
          </p>

          {challenge && stage === 3 && (
            <div className="mt-6 rounded-2xl border border-white/20 bg-black/20 p-5">
              <p className="text-sm text-slate-200">Final mini challenge: pick the exact target aura color.</p>
              <div className="mx-auto mt-3 h-8 w-28 rounded-full border border-white/40" style={{ background: challenge.target }} />
              <div className="mt-4 flex justify-center gap-3">
                {challenge.options.map((color) => (
                  <button
                    key={color}
                    onClick={() => setChallengeResult(color === challenge.target ? 'Perfect resonance achieved!' : 'Decoy picked, try again!')}
                    className="h-10 w-10 rounded-full border border-white/40 transition hover:scale-110"
                    style={{ background: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              {challengeResult && <p className="mt-3 text-emerald-300">{challengeResult}</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
