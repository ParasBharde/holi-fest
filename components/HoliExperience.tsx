'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const palette = ['#FF3CAC', '#FFB86B', '#33E8FF', '#7A5CFF', '#7CFC8A', '#FF5E5E'];

function colorFromName(name: string) {
  const seed = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

export default function HoliExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'playing' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const personalColor = useMemo(() => colorFromName(name || 'Guest'), [name]);

  const runAnimation = () => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const particleCount = 2400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 0.5;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(personalColor),
      size: 0.04,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    gsap.to(points.rotation, { duration: 6, x: 6, y: 8, ease: 'power2.out' });
    gsap.to(points.scale, { duration: 2.3, x: 8, y: 8, z: 8, ease: 'expo.out' });
    gsap.to(material, { duration: 2.8, opacity: 0, delay: 2.5, ease: 'sine.in' });

    const start = performance.now();
    const tick = () => {
      renderer.render(scene, camera);
      if (performance.now() - start < 6000) {
        requestAnimationFrame(tick);
      } else {
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };
    tick();
  };

  const startHoli = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setStatus('playing');
    setMessage('Saving your color signature...');
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });

    setMessage('Color Resonance mini-game: click 5 times before the blast ends!');
    setScore(0);
    runAnimation();

    setTimeout(() => {
      setStatus('done');
      const won = score >= 5;
      setMessage(
        won
          ? `Massive supernova unlocked, ${name}! Your resonance score was ${score}.`
          : `${name}, supernova triggered anyway. Try for higher resonance next round!`
      );
    }, 6500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-fuchsia-900 via-indigo-900 to-cyan-950">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="glass w-full rounded-3xl p-8">
          <h1 className="text-4xl font-bold md:text-6xl">Holi Colorverse</h1>
          <p className="mt-4 text-slate-200">Enter your name and ignite your personalized powder explosion.</p>

          <form onSubmit={startHoli} className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row">
            <input
              className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-105">
              Start Holi
            </button>
          </form>

          {status !== 'idle' && (
            <div
              className="mt-6 cursor-pointer rounded-xl bg-black/25 p-4"
              onClick={() => status === 'playing' && setScore((s) => s + 1)}
            >
              <p>{message}</p>
              {status === 'playing' && <p className="mt-2 text-cyan-300">Resonance score: {score}</p>}
            </div>
          )}

          <div className="mt-6 text-sm text-slate-300">
            Your generated hue: <span className="font-semibold" style={{ color: personalColor }}>{personalColor}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
