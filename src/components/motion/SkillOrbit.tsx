import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Capabilities visual: one capability area as a small 3D system, drawn with
 * Canvas 2D and the same perspective camera as the hero figure (no WebGL).
 * The area sits in the middle as a glass case with a turning core; each
 * technology from the YAML `items` is a node on a ring around it, linked by
 * an arc that carries packets in both directions.
 *
 * The ring turns slowly on its own; drag to orbit (sideways) and tilt
 * (up and down), hover a node to trace its link. Switching areas keeps the
 * camera and lets the new nodes grow out of the hub. The readout shows the
 * real camera angle and frame rate. Client-only, DPR capped at 1.5, paused
 * off screen or in a hidden tab; reduced motion gets one still frame
 * (dragging still works).
 */

type V3 = { x: number; y: number; z: number };
type S2 = { x: number; y: number; d: number };
type Rect = { x0: number; y0: number; x1: number; y1: number };
type Packet = { link: number; t: number; speed: number; out: boolean };

const DIST = 4.2;
const RADIUS = 1.08;
const NODE = 0.055;
const HUB = { hw: 0.2, h: 0.46 };
const BASE_PITCH = 0.5;
const PITCH_MIN = 0.3;
const PITCH_MAX = 0.82;
const STATIC_YAW = -0.42;
const SPIN = 0.09; // rad per second
const SAMPLES = 20;
const LABEL_LIFT = 12;

const v3 = (x: number, y: number, z: number): V3 => ({ x, y, z });
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const deg = (rad: number) => Math.round((rad * 180) / Math.PI);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

/** Node layout: evenly spaced on the ring, alternating height for depth. */
const nodePos = (i: number, n: number, grow = 1): V3 => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  const r = RADIUS * grow;
  return v3(Math.cos(a) * r, (0.16 + (i % 2) * 0.24) * grow + NODE, Math.sin(a) * r);
};

/** Arc from the top of the hub to a node, lifted in the middle. */
const arc = (to: V3): V3[] => {
  const from = v3(0, HUB.h * 0.85, 0);
  const mid = v3(to.x * 0.5, Math.max(from.y, to.y) + 0.32, to.z * 0.5);
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = i / SAMPLES;
    const u = 1 - t;
    return v3(
      u * u * from.x + 2 * u * t * mid.x + t * t * to.x,
      u * u * from.y + 2 * u * t * mid.y + t * t * to.y,
      u * u * from.z + 2 * u * t * mid.z + t * t * to.z,
    );
  });
};

const boxCorners = (c: V3, hw: number, h: number, base = c.y - hw): V3[] =>
  Array.from({ length: 8 }, (_, i) => v3(c.x + (i & 1 ? hw : -hw), i & 2 ? base + h : base, c.z + (i & 4 ? hw : -hw)));

const EDGES: Array<[number, number]> = [];
for (let i = 0; i < 8; i++) for (let b = 1; b < 8; b <<= 1) if (!(i & b)) EDGES.push([i, i | b]);

export const SkillOrbit: React.FC<{ title: string; items: string[]; index: number; total: number }> = ({
  title,
  items,
  index,
  total,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const data = useRef({ title, items, changedAt: -1 });
  const redraw = useRef<() => void>(() => undefined);
  const [fps, setFps] = useState<number | null>(null);
  const [angle, setAngle] = useState({ yaw: deg(STATIC_YAW), pitch: deg(BASE_PITCH) });
  const [hover, setHover] = useState<string | null>(null);

  // New area: keep the camera, regrow the nodes from the hub.
  useEffect(() => {
    data.current = { title, items, changedAt: performance.now() };
    redraw.current();
  }, [title, items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const rgb = (name: string, fb: string) => (css.getPropertyValue(name).trim() || fb).split(/\s+/).join(", ");
    const INK = rgb("--c-ink", "242 242 240");
    const ACCENT = rgb("--c-accent", "255 92 0");
    const CANVAS = rgb("--c-canvas", "10 10 10");
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const mono = "500 12px 'Geist Mono', ui-monospace, monospace";
    const monoSmall = "500 11px 'Geist Mono', ui-monospace, monospace";
    const display = "700 15px Archivo, 'Arial Narrow', sans-serif";

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let frames = 0;
    let fpsClock = 0;
    let labelHalf = 50;
    let packets: Packet[] = [];
    let hits: Array<{ name: string; r: Rect }> = [];
    let hovered: string | null = null;
    let lastCount = -1;

    let yaw = STATIC_YAW;
    let pitch = BASE_PITCH;
    let core = 0;
    let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
    const cam = { cy: 1, sy: 0, cp: 1, sp: 0, s: 100, ox: 0, oy: 0 };

    const setCam = (yw: number, pt: number, s = cam.s, ox = cam.ox, oy = cam.oy) => {
      cam.cy = Math.cos(yw);
      cam.sy = Math.sin(yw);
      cam.cp = Math.cos(pt);
      cam.sp = Math.sin(pt);
      cam.s = s;
      cam.ox = ox;
      cam.oy = oy;
    };

    const project = (v: V3): S2 => {
      const x1 = v.x * cam.cy - v.z * cam.sy;
      const z1 = v.x * cam.sy + v.z * cam.cy;
      const yc = v.y * cam.cp - z1 * cam.sp;
      const zc = v.y * cam.sp + z1 * cam.cp;
      const depth = DIST - zc;
      const k = (cam.s * DIST) / depth;
      return { x: cam.ox + x1 * k, y: cam.oy - yc * k, d: depth };
    };

    /** Scale and origin so the ring, hub and labels fit at every reachable angle. */
    const fit = () => {
      const list = data.current.items;
      ctx.font = mono;
      labelHalf = Math.max(40, ...list.map((s) => ctx.measureText(s).width)) / 2 + 10;
      const n = Math.max(1, list.length);
      const pts: V3[] = [];
      for (let i = 0; i < n; i++) pts.push(...boxCorners(nodePos(i, n), NODE, NODE * 2));
      pts.push(...boxCorners(v3(0, HUB.hw, 0), HUB.hw, HUB.h, 0));
      // any yaw is reachable, so sample the full turn
      let ax = 0;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
        for (const pt of [PITCH_MIN, BASE_PITCH, PITCH_MAX]) {
          setCam(a, pt, 1, 0, 0);
          for (const v of pts) {
            const p = project(v);
            ax = Math.max(ax, Math.abs(p.x));
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          }
        }
      }
      const s = Math.min((w / 2 - labelHalf - 4) / ax, (h - LABEL_LIFT - 34) / (maxY - minY));
      const oy = (h + LABEL_LIFT + 22) / 2 - ((minY + maxY) / 2) * s;
      setCam(yaw, pitch, s, w / 2, oy);
      lastCount = list.length;
    };

    const seed = () => {
      const n = data.current.items.length;
      packets = Array.from({ length: n * 2 }, (_, i) => ({
        link: i % n,
        t: Math.random(),
        speed: 0.28 + Math.random() * 0.3,
        out: i < n,
      }));
    };

    const line = (pts: S2[]) => {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    };

    const drawFloor = () => {
      const R = 1.55;
      const rings = 6;
      ctx.lineWidth = 1;
      for (let r = 1; r <= rings; r++) {
        const rr = (r / rings) * R;
        const pts = Array.from({ length: 65 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2;
          return project(v3(Math.cos(a) * rr, 0, Math.sin(a) * rr));
        });
        const strong = Math.abs(rr - RADIUS) < 0.15;
        ctx.strokeStyle = `rgba(${INK}, ${strong ? 0.16 : 0.07 * (1 - r / (rings + 1)) + 0.02})`;
        ctx.beginPath();
        line(pts);
        ctx.stroke();
      }
      // spokes
      ctx.strokeStyle = `rgba(${INK}, 0.05)`;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const p0 = project(v3(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3));
        const p1 = project(v3(Math.cos(a) * R, 0, Math.sin(a) * R));
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
      }
      ctx.stroke();
    };

    const drawEdges = (c: S2[], stroke: string, width = 1) => {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (const [a, b] of EDGES) {
        ctx.moveTo(c[a].x, c[a].y);
        ctx.lineTo(c[b].x, c[b].y);
      }
      ctx.stroke();
    };

    const fillTop = (c: S2[], fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      line([c[2], c[3], c[7], c[6]]);
      ctx.closePath();
      ctx.fill();
    };

    const drawHub = (now: number) => {
      const c = boxCorners(v3(0, 0, 0), HUB.hw, HUB.h, 0).map(project);
      // glass case
      ctx.fillStyle = `rgba(${INK}, 0.04)`;
      ctx.beginPath();
      line([c[0], c[1], c[3], c[2]]);
      ctx.fill();
      fillTop(c, `rgba(${INK}, 0.07)`);
      drawEdges(c, `rgba(${INK}, 0.55)`);
      // turning core
      const s = 0.09;
      const cy = HUB.h * 0.5;
      const ca = Math.cos(core);
      const sa = Math.sin(core);
      const inner = Array.from({ length: 8 }, (_, i) => {
        const x = i & 1 ? s : -s;
        const z = i & 4 ? s : -s;
        return project(v3(x * ca - z * sa, cy + (i & 2 ? s : -s), x * sa + z * ca));
      });
      drawEdges(inner, `rgba(${ACCENT}, 0.9)`, 1.25);
      // floor ping under the hub
      const pulse = reduce ? 0 : (now / 1800) % 1;
      if (pulse > 0) {
        const r = HUB.hw + 0.05 + pulse * 0.5;
        const q = [v3(-r, 0, -r), v3(r, 0, -r), v3(r, 0, r), v3(-r, 0, r)].map(project);
        ctx.strokeStyle = `rgba(${ACCENT}, ${0.35 * (1 - pulse)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        line(q);
        ctx.closePath();
        ctx.stroke();
      }
    };

    const drawHubLabel = () => {
      const { title: t, items: list } = data.current;
      const top = project(v3(0, HUB.h, 0));
      ctx.font = display;
      const titleText = t.toUpperCase();
      const tw = ctx.measureText(titleText).width;
      ctx.font = monoSmall;
      const meta = `${String(list.length).padStart(2, "0")} NODES`;
      const mw = ctx.measureText(meta).width;
      const bw = Math.max(tw, mw) + 20;
      const bh = 42;
      const x = clamp(top.x - bw / 2, 2, w - bw - 2);
      const y = Math.max(2, top.y - bh - LABEL_LIFT);
      ctx.fillStyle = `rgb(${INK})`;
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = `rgba(${CANVAS}, 0.7)`;
      ctx.font = monoSmall;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.fillText(meta, x + bw / 2, y + 7);
      ctx.fillStyle = `rgb(${CANVAS})`;
      ctx.font = display;
      ctx.fillText(titleText, x + bw / 2, y + 21);
      ctx.strokeStyle = `rgba(${INK}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(top.x, y + bh);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
    };

    const draw = (now: number) => {
      const { items: list, changedAt } = data.current;
      if (list.length !== lastCount) {
        fit();
        seed();
      }
      setCam(yaw, pitch);
      ctx.clearRect(0, 0, w, h);
      const n = list.length;
      const grow = reduce || changedAt < 0 ? 1 : ease((now - changedAt) / 900);

      drawFloor();

      const nodes = list.map((name, i) => {
        const pos = nodePos(i, n, Math.max(0.001, grow));
        return { name, i, pos, arcPts: arc(pos), depth: project(pos).d };
      });

      // links (behind everything)
      for (const nd of nodes) {
        const lit = nd.name === hovered;
        const pts = nd.arcPts.map(project);
        ctx.strokeStyle = lit ? `rgba(${ACCENT}, 0.9)` : `rgba(${INK}, ${0.12 + 0.12 * grow})`;
        ctx.lineWidth = lit ? 1.5 : 1;
        ctx.beginPath();
        line(pts);
        ctx.stroke();
        // floor shadow of the link
        ctx.strokeStyle = `rgba(${INK}, 0.05)`;
        ctx.beginPath();
        line(nd.arcPts.map((p) => project(v3(p.x, 0, p.z))));
        ctx.stroke();
      }

      // packets
      if (!reduce && grow > 0.6) {
        for (const p of packets) {
          const nd = nodes[p.link];
          if (!nd) continue;
          const t = p.out ? p.t : 1 - p.t;
          const tail = p.out ? t - 0.09 : t + 0.09;
          const at = (u: number) => {
            const f = clamp(u, 0, 1) * SAMPLES;
            const k = Math.min(SAMPLES - 1, Math.floor(f));
            const a = nd.arcPts[k];
            const b = nd.arcPts[k + 1];
            const r = f - k;
            return project(v3(a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r, a.z + (b.z - a.z) * r));
          };
          const a = at(tail);
          const b = at(t);
          ctx.strokeStyle = `rgba(${ACCENT}, ${nd.name === hovered || !hovered ? 0.95 : 0.35})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // nodes, hub and labels, far to near
      const hubDepth = project(v3(0, HUB.h / 2, 0)).d;
      type Item = { depth: number; draw: () => void };
      const queue: Item[] = nodes.map((nd) => ({
        depth: nd.depth,
        draw: () => {
          const lit = nd.name === hovered;
          const c = boxCorners(nd.pos, NODE, NODE * 2).map(project);
          // depth cue: nearer nodes are brighter
          const near = clamp((DIST + RADIUS - nd.depth) / (2 * RADIUS), 0, 1);
          const alpha = (0.45 + 0.55 * near) * grow;
          fillTop(c, `rgba(${lit ? ACCENT : INK}, ${0.18 * alpha})`);
          drawEdges(c, `rgba(${lit ? ACCENT : INK}, ${0.85 * alpha})`);
          // label
          const top = project(v3(nd.pos.x, nd.pos.y + NODE, nd.pos.z));
          ctx.font = mono;
          const tw = ctx.measureText(nd.name).width;
          const bw = tw + 16;
          const bh = 22;
          const x = clamp(top.x - bw / 2, 1, w - bw - 1);
          const y = top.y - bh - LABEL_LIFT;
          ctx.globalAlpha = clamp(alpha + 0.1, 0, 1);
          ctx.fillStyle = `rgb(${lit ? INK : CANVAS})`;
          ctx.fillRect(x, y, bw, bh);
          ctx.strokeStyle = lit ? `rgb(${INK})` : `rgba(${INK}, 0.28)`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
          ctx.fillStyle = `rgb(${lit ? CANVAS : INK})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(nd.name, x + bw / 2, y + bh / 2 + 0.5);
          ctx.strokeStyle = `rgba(${INK}, ${0.3 * alpha})`;
          ctx.beginPath();
          ctx.moveTo(top.x, y + bh);
          ctx.lineTo(top.x, top.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
          hits.push({ name: nd.name, r: { x0: x, y0: y, x1: x + bw, y1: top.y + 6 } });
        },
      }));
      // The area label belongs to the hub, so nearer nodes still draw over it.
      queue.push({
        depth: hubDepth,
        draw: () => {
          drawHub(now);
          drawHubLabel();
        },
      });
      queue.sort((a, b) => b.depth - a.depth);
      hits = [];
      for (const q of queue) q.draw();
    };

    const step = (time: number) => {
      if (!running) return;
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
      last = time;
      if (!drag) yaw += SPIN * dt * (hovered ? 0.25 : 1);
      core += dt * 0.9;
      for (const p of packets) {
        p.t += p.speed * dt;
        if (p.t >= 1) {
          p.t = 0;
          p.speed = 0.28 + Math.random() * 0.3;
        }
      }
      draw(time);
      frames++;
      if (time - fpsClock > 600) {
        setFps(Math.round((frames * 1000) / (time - fpsClock)));
        setAngle({ yaw: deg(Math.atan2(Math.sin(yaw), Math.cos(yaw))), pitch: deg(pitch) });
        frames = 0;
        fpsClock = time;
      }
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      last = 0;
      fpsClock = performance.now();
      frames = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const still = () => {
      if (running) return;
      draw(performance.now());
      setAngle({ yaw: deg(Math.atan2(Math.sin(yaw), Math.cos(yaw))), pitch: deg(pitch) });
    };
    redraw.current = () => {
      if (!running) {
        // reduced motion or paused: show the new area at once
        data.current.changedAt = -1;
        still();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fit();
      if (!packets.length) seed();
      draw(performance.now());
    };

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const hit = (x: number, y: number) =>
      [...hits].reverse().find((t) => x >= t.r.x0 && x <= t.r.x1 && y >= t.r.y0 && y <= t.r.y1)?.name ?? null;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, yaw, pitch };
      canvas.setPointerCapture?.(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (drag) {
        yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
        pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.004, PITCH_MIN, PITCH_MAX);
        still();
        return;
      }
      const { x, y } = local(e);
      const name = hit(x, y);
      if (name !== hovered) {
        hovered = name;
        setHover(name);
        canvas.style.cursor = name ? "crosshair" : "grab";
        if (!running) draw(performance.now());
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      drag = null;
      canvas.releasePointerCapture?.(e.pointerId);
      canvas.style.cursor = hovered ? "crosshair" : "grab";
    };
    const onLeave = () => {
      if (drag) return;
      hovered = null;
      setHover(null);
      if (!running) draw(performance.now());
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    canvas.style.cursor = "grab";
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    document.fonts?.ready
      .then(() => {
        fit();
        draw(performance.now());
      })
      .catch(() => undefined);
    start();

    return () => {
      stop();
      redraw.current = () => undefined;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  const signed = (n: number) => `${n < 0 ? "−" : "+"}${String(Math.abs(n)).padStart(2, "0")}°`;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <figure className="relative">
      <figcaption className="sr-only">
        {title}: {items.join(", ")}
      </figcaption>
      <div className="mb-3 flex items-center justify-between font-mono text-label uppercase tracking-[0.05em] text-muted" aria-hidden="true">
        <span>
          fig.04 / capability map <span className="text-faint">·</span> {pad(index + 1)}/{pad(total)}
        </span>
        <span>{hover ? <span className="text-accent">trace: {hover}</span> : "drag to orbit"}</span>
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="block aspect-[16/11] w-full touch-pan-y select-none" />
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3 font-mono text-label uppercase tracking-[0.05em] text-muted" aria-hidden="true">
        <span className="tabular-nums">
          yaw {signed(angle.yaw)} / pitch {signed(angle.pitch)}
        </span>
        <span className="tabular-nums">
          {reduce ? "static / reduced motion" : fps ? `canvas2d / ${pad(fps)} fps` : "canvas2d"}
        </span>
      </div>
    </figure>
  );
};
