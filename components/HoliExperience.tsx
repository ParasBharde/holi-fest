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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scene2Ref = useRef<HTMLDivElement | null>(null);
  const scene3Ref = useRef<HTMLDivElement | null>(null);
  const scene4Ref = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState('Enter your name to unlock the Holi journey.');
  const [targetColor, setTargetColor] = useState('#ffffff');
  const [choices, setChoices] = useState<string[]>([]);
  const [miniGameResult, setMiniGameResult] = useState('');

  const personalColor = useMemo(() => colorFromName(name || 'Guest'), [name]);

  const runBurst = (color: string) => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 4200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.2;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.2;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
      velocities[i3] = (Math.random() - 0.5) * 0.07;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.07;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.07;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.035,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    const haloMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.7 });
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.2, 80), haloMaterial);
    scene.add(halo);

    gsap.to(halo.scale, { x: 8, y: 8, duration: 2.6, ease: 'expo.out' });
    gsap.to(haloMaterial, { opacity: 0, duration: 2.8 });
    gsap.to(pointsMaterial, { opacity: 0, duration: 4.2, delay: 1.2 });

    const start = performance.now();
    const tick = () => {
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pos[i3] += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1];
        pos[i3 + 2] += velocities[i3 + 2];
      }
      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.003;
      halo.rotation.z += 0.014;
      renderer.render(scene, camera);

      if (performance.now() - start < 5200) {
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

  useEffect(() => {
    if (!unlocked || !scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target.getAttribute('data-scene');
          if (target === '2') {
            setStatus(`Welcome ${name}, Scene 2: Powder ignition.`);
            runBurst(personalColor);
          }
          if (target === '3') {
            setStatus('Scene 3: Color cosmos resonance.');
            runBurst(palette[Math.floor(Math.random() * palette.length)]);
          }
          if (target === '4') {
            setStatus('Scene 4: Final aura challenge.');
            const answer = palette[Math.floor(Math.random() * palette.length)];
            const options = [
              answer,
              ...palette.filter((p) => p !== answer).sort(() => Math.random() - 0.5).slice(0, 2)
            ].sort(() => Math.random() - 0.5);
            setTargetColor(answer);
            setChoices(options);
            setMiniGameResult('');
          }
        });
      },
      { threshold: 0.6 }
    );

    [scene2Ref.current, scene3Ref.current, scene4Ref.current].forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [unlocked, name, personalColor]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });

    setUnlocked(true);
    setStatus(`Great ${name}, scroll down to begin Scene 2.`);
    setTimeout(() => {
      scene2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-gradient-to-br from-fuchsia-950 via-indigo-950 to-cyan-950 text-white">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div
        ref={scrollRef}
        className="relative z-10 h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth"
      >
        <section className="glass mx-auto flex min-h-screen w-full max-w-6xl snap-start items-center justify-center px-6 py-12 text-center">
          <div className="w-full max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Scroll Story Experience</p>
            <h1 className="mt-3 text-4xl font-bold md:text-6xl">Holi Multiverse Journey</h1>
            <p className="mt-4 text-slate-200">One page. Multiple scenes. Enter your name, then scroll to unlock each animation chapter.</p>

            <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-lg flex-col gap-4 sm:flex-row">
              <input
                className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-105">Start</button>
            </form>

            <p className="mt-6 text-cyan-200">{status}</p>
            <p className="mt-2 text-sm text-slate-300">
              Your generated hue: <span style={{ color: personalColor }} className="font-semibold">{personalColor}</span>
            </p>
          </div>
        </section>

        <section
          ref={scene2Ref}
          data-scene="2"
          className="mx-auto flex min-h-screen w-full max-w-6xl snap-start items-center justify-center px-6 py-12"
        >
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">Scene 2 — Powder Bloom</h2>
            <p className="mt-4 text-slate-200">As this section appears, your personalized 3D Holi blast is triggered.</p>
          </div>
        </section>

        <section
          ref={scene3Ref}
          data-scene="3"
          className="mx-auto flex min-h-screen w-full max-w-6xl snap-start items-center justify-center px-6 py-12"
        >
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">Scene 3 — Resonance Drift</h2>
            <p className="mt-4 text-slate-200">Keep scrolling through cinematic transitions inside one continuous hero page.</p>
          </div>
        </section>

        <section
          ref={scene4Ref}
          data-scene="4"
          className="mx-auto flex min-h-screen w-full max-w-6xl snap-start items-center justify-center px-6 py-12"
        >
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">Scene 4 — Aura Challenge</h2>
            <p className="mt-4 text-slate-200">Pick the target color to complete your Holi scroll story.</p>
            <div className="mx-auto mt-4 h-8 w-28 rounded-full border border-white/40" style={{ background: targetColor }} />
            <div className="mt-4 flex justify-center gap-3">
              {choices.map((color) => (
                <button
                  key={color}
                  onClick={() => setMiniGameResult(color === targetColor ? 'Perfect color match!' : 'Wrong shade, try scrolling again!')}
                  className="h-10 w-10 rounded-full border border-white/40 transition hover:scale-110"
                  style={{ background: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            {miniGameResult && <p className="mt-4 text-emerald-300">{miniGameResult}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
