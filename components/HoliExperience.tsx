'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const palette = ['#FF3CAC', '#FFB86B', '#33E8FF', '#7A5CFF', '#7CFC8A', '#FF5E5E'];

function colorFromName(name: string) {
  const seed = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

export default function HoliExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'playing' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [targetColor, setTargetColor] = useState('#ffffff');
  const [choices, setChoices] = useState<string[]>([]);
  const [miniGameResult, setMiniGameResult] = useState('');

  const personalColor = useMemo(() => colorFromName(name || 'Guest'), [name]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${y * -6}deg) translateZ(0)`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const launchThreeBurst = () => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.4;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.4;

      velocities[i3] = (Math.random() - 0.5) * 0.08;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.08;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(personalColor),
      size: 0.035,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(personalColor),
      transparent: true,
      opacity: 0.6
    });

    const halo = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.1, 80), haloMaterial);
    scene.add(halo);

    gsap.to(halo.scale, { x: 7, y: 7, duration: 2.5, ease: 'expo.out' });
    gsap.to(halo.material, { opacity: 0, duration: 2.8, ease: 'sine.out' });
    gsap.to(pointsMaterial, { opacity: 0, duration: 4.2, delay: 1.1, ease: 'power2.out' });

    const start = performance.now();
    const clock = new THREE.Clock();

    const tick = () => {
      const t = clock.getElapsedTime();
      const pos = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pos[i3] += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1] + Math.sin(t + i * 0.01) * 0.0006;
        pos[i3 + 2] += velocities[i3 + 2];
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0025;
      points.rotation.x += 0.0013;
      halo.rotation.z += 0.013;

      renderer.render(scene, camera);

      if (performance.now() - start < 5500) {
        requestAnimationFrame(tick);
      } else {
        renderer.dispose();
        geometry.dispose();
        pointsMaterial.dispose();
        halo.geometry.dispose();
        haloMaterial.dispose();
      }
    };

    tick();
  };

  const buildMiniGame = () => {
    const answer = palette[Math.floor(Math.random() * palette.length)];
    const distractors = palette.filter((p) => p !== answer).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [answer, ...distractors].sort(() => Math.random() - 0.5);

    setTargetColor(answer);
    setChoices(options);
    setShowMiniGame(true);
    setMiniGameResult('');
  };

  const startHoli = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setStatus('playing');
    setMessage('Mapping your aura and preparing a cinematic color burst...');

    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });

    launchThreeBurst();

    setTimeout(() => {
      setStatus('done');
      setMessage(`${name}, your personalized Holi supernova is complete.`);
      buildMiniGame();
    }, 5800);
  };

  const pickColor = (color: string) => {
    if (!showMiniGame) return;
    if (color === targetColor) {
      setMiniGameResult('Perfect! You matched the resonance color.');
    } else {
      setMiniGameResult('Nice try! That was a decoy shade.');
    }
    setShowMiniGame(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-cyan-950">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div ref={glowRef} className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
        <div ref={cardRef} className="glass w-full rounded-3xl p-8 text-center transition-transform duration-150 md:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Immersive Holi Visual</p>
          <h1 className="mt-2 text-4xl font-bold md:text-6xl">Holi Parallax Colorverse</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-200">
            Move your cursor for parallax depth. Enter your name to trigger a personalized 3D powder bloom with cinematic glow.
          </p>

          <form onSubmit={startHoli} className="mx-auto mt-8 flex max-w-lg flex-col gap-4 sm:flex-row">
            <input
              className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-105">
              Ignite
            </button>
          </form>

          {status !== 'idle' && <p className="mt-6 text-cyan-200">{message}</p>}

          <div className="mt-6 text-sm text-slate-300">
            Your generated hue: <span className="font-semibold" style={{ color: personalColor }}>{personalColor}</span>
          </div>

          {showMiniGame && (
            <div className="mt-8 rounded-2xl border border-white/20 bg-black/20 p-5">
              <p className="text-sm text-slate-200">Mini challenge: pick the exact target color below.</p>
              <div className="mx-auto mt-3 h-8 w-28 rounded-full border border-white/40" style={{ background: targetColor }} />
              <div className="mt-4 flex justify-center gap-3">
                {choices.map((color) => (
                  <button
                    key={color}
                    onClick={() => pickColor(color)}
                    className="h-10 w-10 rounded-full border border-white/40 transition hover:scale-110"
                    style={{ background: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {miniGameResult && <p className="mt-4 text-sm text-emerald-300">{miniGameResult}</p>}
        </div>
      </section>
    </main>
  );
}
