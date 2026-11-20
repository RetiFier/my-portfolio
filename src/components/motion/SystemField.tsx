import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Hero visual: a live 3D wireframe of a typical product system, drawn with
 * Canvas 2D and a small perspective camera (no WebGL, no extra dependency).
 * Requests leave the clients, arc through the API (a glass case with a
 * rotating core) and land in the data layer. Packets are short dashes with
 * floor shadows; each arrival sends a square ping across the floor.
 *
 * Drag to orbit, hover a node to trace its routes. The camera drifts on its
 * own and follows a fine pointer slightly. The readout shows the real frame
 * rate and camera angle of this canvas, nothing invented.
 * Client-only, DPR capped at 1.5, paused off screen or in a hidden tab,
 * and one fixed camera angle for reduced motion (dragging still works).
 */

const SOURCES = ["Web", "Mobile", "Webhooks"];
const SINKS = ["PostgreSQL", "MongoDB", "Redis"];

type V3 = { x: number; y: number; z: number };
type S2 = { x: number; y: number; d: number };
type Kind = "src" | "sink" | "core";
type Node3 = { id: string; label: string; x: number; z: number; hw: number; hd: number; h: number; kind: Kind };
type Fiber = { c: [V3, V3, V3, V3]; pts: V3[]; floor: V3[] };
type Packet = { src: number; sink: number; leg: 0 | 1; t: number; speed: number; hot: boolean; fiber: number };
type Ping = { node: number; age: number };
type Rect = { x0: number; y0: number; x1: number; y1: number };

/* ---------------------------- world geometry ---------------------------- */

const ROWS = [-0.66, 0, 0.66];
const FIBERS = 6;
const SAMPLES = 24;
const DIST = 3.6;
const STATIC_YAW = -0.36;
const BASE_YAW = -0.18;
const BASE_PITCH = 0.6;
const YAW_LIMIT = 0.6;
const PITCH_MIN = 0.53;
const PITCH_MAX = 0.67;
const BOX = { hw: 0.17, hd: 0.1, h: 0.1 };
const CORE = { hw: 0.19, hd: 0.19, h: 0.64 };

const v3 = (x: number, y: number, z: number): V3 => ({ x, y, z });

const bez3 = (c: Fiber["c"], t: number): V3 => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const k = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * c[0].x + b * c[1].x + k * c[2].x + d * c[3].x,
    y: a * c[0].y + b * c[1].y + k * c[2].y + d * c[3].y,
    z: a * c[0].z + b * c[1].z + k * c[2].z + d * c[3].z,
  };
};

const jitter = (seed: number) => {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s) - 0.5;
};

const NODES: Node3[] = [
  ...SOURCES.map((label, i) => ({ id: `src-${i}`, label, x: -1, z: ROWS[i], ...BOX, kind: "src" as const })),
  ...SINKS.map((label, i) => ({ id: `sink-${i}`, label, x: 1, z: ROWS[i], ...BOX, kind: "sink" as const })),
  { id: "core", label: "API", x: 0, z: 0, ...CORE, kind: "core" },
];
const CORE_INDEX = NODES.length - 1;

const makeFiber = (c: Fiber["c"]): Fiber => {
  const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => bez3(c, i / SAMPLES));
  return { c, pts, floor: pts.map((p) => v3(p.x, 0, p.z)) };
};

const spread = (f: number) => f - (FIBERS - 1) / 2;

// Bundled 3D arcs: perspective is not affine, so each fiber is sampled into
// a polyline in world space and projected point by point every frame.
const IN_FIBERS: Fiber[][] = SOURCES.map((_, i) =>
  Array.from({ length: FIBERS }, (_, f) => {
    const from = v3(-1 + BOX.hw, BOX.h * 0.55, ROWS[i] + spread(f) * 0.014);
    const to = v3(-CORE.hw, 0.26 + spread(f) * 0.02, spread(f) * 0.014);
    const dx = to.x - from.x;
    return makeFiber([
      from,
      v3(from.x + dx * 0.42, from.y + 0.24 + jitter(i * 31 + f * 7) * 0.12, from.z + jitter(i * 17 + f * 13) * 0.14),
      v3(to.x - dx * 0.38, to.y + 0.16 + jitter(i * 11 + f * 3) * 0.1, to.z + jitter(i * 29 + f * 5) * 0.12),
      to,
    ]);
  }),
);

const OUT_FIBERS: Fiber[][] = SINKS.map((_, i) =>
  Array.from({ length: FIBERS }, (_, f) => {
    const from = v3(CORE.hw, 0.26 + spread(f) * 0.02, spread(f) * 0.014);
    const to = v3(1 - BOX.hw, BOX.h * 0.55, ROWS[i] + spread(f) * 0.014);
    const dx = to.x - from.x;
    return makeFiber([
      from,
      v3(from.x + dx * 0.38, from.y + 0.16 + jitter(i * 41 + f * 5) * 0.1, from.z + jitter(i * 23 + f * 11) * 0.12),
      v3(to.x - dx * 0.42, to.y + 0.24 + jitter(i * 19 + f * 9) * 0.12, to.z + jitter(i * 37 + f * 2) * 0.14),
      to,
    ]);
  }),
);

const corners = (n: Node3): V3[] =>
  Array.from({ length: 8 }, (_, i) =>
    v3(n.x + (i & 1 ? n.hw : -n.hw), i & 2 ? n.h : 0, n.z + (i & 4 ? n.hd : -n.hd)),
  );

// Faces as corner indices with their outward normal (bottom face omitted).
const FACES: Array<{ idx: [number, number, number, number]; n: V3; top?: boolean }> = [
  { idx: [0, 2, 6, 4], n: v3(-1, 0, 0) },
  { idx: [1, 3, 7, 5], n: v3(1, 0, 0) },
  { idx: [0, 1, 3, 2], n: v3(0, 0, -1) },
  { idx: [4, 5, 7, 6], n: v3(0, 0, 1) },
  { idx: [2, 3, 7, 6], n: v3(0, 1, 0), top: true },
];
const EDGES: Array<[number, number]> = [];
for (let i = 0; i < 8; i++) for (let b = 1; b < 8; b <<= 1) if (!(i & b)) EDGES.push([i, i | b]);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const deg = (rad: number) => Math.round((rad * 180) / Math.PI);

/* ------------------------------ component ------------------------------- */

export const SystemField: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [fps, setFps] = useState<number | null>(null);
  const [angle, setAngle] = useState({ yaw: deg(BASE_YAW), pitch: deg(BASE_PITCH) });
  const [hover, setHover] = useState<string | null>(null);

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
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let packets: Packet[] = [];
    let pings: Ping[] = [];
    let hovered: string | null = null;
    let hits: Array<{ id: string; r: Rect }> = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let frames = 0;
    let fpsClock = 0;
    let labelHalf = 40;
    let pulse = 0;

    // camera
    let yaw = reduce ? STATIC_YAW : BASE_YAW;
    let pitch = BASE_PITCH;
    let phase = 0; // auto-orbit clock, frozen while dragging
    let dragYaw = 0;
    let idle = 0;
    let px = 0;
    let py = 0;
    let drag: { x: number; start: number } | null = null;
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

    // Camera position in world space, for back-face tests.
    const camPos = (): V3 => v3(DIST * cam.cp * cam.sy, DIST * cam.sp, DIST * cam.cp * cam.cy);

    /** Scale and origin so every box and label fits at any reachable camera angle. */
    const fit = () => {
      ctx.font = mono;
      labelHalf = Math.max(...NODES.map((n) => ctx.measureText(n.label.toUpperCase()).width)) / 2 + 6;
      let ax = 0;
      let lx = 0;
      let minY = Infinity;
      let maxY = -Infinity;
      let lMinY = Infinity;
      // vertical extent around the resting angle, used for centring only
      let cMin = Infinity;
      let cMax = -Infinity;
      const pts = NODES.flatMap(corners);
      const anchors = NODES.map((n) => v3(n.x, n.h, n.z));
      const rest = reduce ? STATIC_YAW : BASE_YAW;
      for (const yw of [-YAW_LIMIT, -YAW_LIMIT / 2, 0, YAW_LIMIT / 2, YAW_LIMIT, rest]) {
        for (const pt of [PITCH_MIN, BASE_PITCH, PITCH_MAX]) {
          setCam(yw, pt, 1, 0, 0);
          const centring = Math.abs(yw - rest) < 1e-6 && pt === BASE_PITCH;
          for (const v of pts) {
            const p = project(v);
            ax = Math.max(ax, Math.abs(p.x));
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
            if (centring) {
              cMin = Math.min(cMin, p.y);
              cMax = Math.max(cMax, p.y);
            }
          }
          for (const v of anchors) {
            const p = project(v);
            lx = Math.max(lx, Math.abs(p.x));
            lMinY = Math.min(lMinY, p.y);
            if (centring) cMin = Math.min(cMin, p.y - 0.0001);
          }
        }
      }
      const labelLift = 26;
      const s = Math.min(
        (w / 2 - 4) / ax,
        (w / 2 - labelHalf - 2) / lx,
        (h - 14) / (maxY - minY),
        (h - labelLift - 12) / (maxY - lMinY),
      );
      // Centre the resting view; the scale above keeps every other angle inside.
      const top = cMin * s - labelLift;
      const bottom = cMax * s;
      let oy = (h - (bottom - top)) / 2 - top;
      oy = clamp(oy, labelLift + 2 - lMinY * s, h - 8 - maxY * s);
      setCam(yaw, pitch, s, w / 2, oy);
    };

    const spawn = (t = 0): Packet => ({
      src: Math.floor(Math.random() * SOURCES.length),
      sink: Math.floor(Math.random() * SINKS.length),
      leg: Math.random() < 0.5 ? 0 : 1,
      t,
      speed: 0.2 + Math.random() * 0.22,
      hot: Math.random() < 0.14,
      fiber: Math.floor(Math.random() * FIBERS),
    });

    const seed = () => {
      const count = Math.round(clamp(w / 10, 24, 60));
      packets = Array.from({ length: count }, () => spawn(Math.random()));
    };

    const fiberFor = (p: Packet) => (p.leg === 0 ? IN_FIBERS[p.src][p.fiber] : OUT_FIBERS[p.sink][p.fiber]);
    const touches = (p: Packet, id: string | null) =>
      id !== null && (id === `src-${p.src}` || id === `sink-${p.sink}` || id === "core");

    const path = (pts: S2[]) => {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    };

    const floorQuad = (n: Node3, grow: number) => {
      const q = [
        v3(n.x - n.hw - grow, 0, n.z - n.hd - grow),
        v3(n.x + n.hw + grow, 0, n.z - n.hd - grow),
        v3(n.x + n.hw + grow, 0, n.z + n.hd + grow),
        v3(n.x - n.hw - grow, 0, n.z + n.hd + grow),
      ].map(project);
      ctx.beginPath();
      path(q);
      ctx.closePath();
    };

    const drawGrid = () => {
      ctx.lineWidth = 1;
      const X = 1.5;
      const Z = 1.15;
      const seg = 12;
      const LEVELS = 8;
      // Segments fade with distance from the centre; alphas are bucketed so
      // the whole floor is a handful of stroke calls.
      const buckets: Array<Array<[S2, S2]>> = Array.from({ length: LEVELS }, () => []);
      const line = (a: V3, b: V3) => {
        for (let i = 0; i < seg; i++) {
          const t0 = i / seg;
          const t1 = (i + 1) / seg;
          const p0 = v3(a.x + (b.x - a.x) * t0, 0, a.z + (b.z - a.z) * t0);
          const p1 = v3(a.x + (b.x - a.x) * t1, 0, a.z + (b.z - a.z) * t1);
          const r = Math.hypot((p0.x + p1.x) / 2 / X, (p0.z + p1.z) / 2 / Z);
          const level = Math.floor(Math.pow(Math.max(0, 1 - r), 1.4) * LEVELS);
          if (level <= 0) continue;
          buckets[Math.min(LEVELS - 1, level)].push([project(p0), project(p1)]);
        }
      };
      for (let x = -X; x <= X + 1e-6; x += 0.25) line(v3(x, 0, -Z), v3(x, 0, Z));
      for (let z = -1; z <= 1 + 1e-6; z += 0.25) line(v3(-X, 0, z), v3(X, 0, z));
      buckets.forEach((segs, level) => {
        if (!segs.length) return;
        ctx.strokeStyle = `rgba(${INK}, ${(0.14 * (level + 0.5)) / LEVELS})`;
        ctx.beginPath();
        for (const [a, b] of segs) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      });
    };

    const drawBox = (n: Node3, lit: boolean, eye: V3) => {
      const c = corners(n).map(project);
      const col = lit ? ACCENT : INK;
      // ghost edges show through the translucent faces
      ctx.strokeStyle = `rgba(${INK}, 0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [a, b] of EDGES) {
        ctx.moveTo(c[a].x, c[a].y);
        ctx.lineTo(c[b].x, c[b].y);
      }
      ctx.stroke();
      for (const f of FACES) {
        const cx = n.x + f.n.x * n.hw;
        const cyy = f.top ? n.h : n.h / 2;
        const cz = n.z + f.n.z * n.hd;
        const dot = f.n.x * (eye.x - cx) + f.n.y * (eye.y - cyy) + f.n.z * (eye.z - cz);
        if (dot <= 0) continue;
        ctx.beginPath();
        path(f.idx.map((i) => c[i]));
        ctx.closePath();
        ctx.fillStyle = `rgba(${CANVAS}, 0.8)`;
        ctx.fill();
        ctx.fillStyle = `rgba(${col}, ${f.top ? (lit ? 0.16 : 0.07) : lit ? 0.07 : 0.025})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${col}, ${lit ? 0.95 : 0.55})`;
        ctx.stroke();
      }
    };

    const drawCore = (n: Node3, lit: boolean, time: number, eye: V3) => {
      const c = corners(n).map(project);
      const col = lit ? ACCENT : INK;
      // back edges of the glass case first
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${INK}, 0.12)`;
      ctx.beginPath();
      for (const [a, b] of EDGES) {
        ctx.moveTo(c[a].x, c[a].y);
        ctx.lineTo(c[b].x, c[b].y);
      }
      ctx.stroke();

      // scan plane sweeping the case
      const sy = n.h * (reduce ? 0.78 : 0.5 + 0.42 * Math.sin(time * 0.0011));
      const inset = 0.92;
      const plane = [
        v3(-n.hw * inset, sy, -n.hd * inset),
        v3(n.hw * inset, sy, -n.hd * inset),
        v3(n.hw * inset, sy, n.hd * inset),
        v3(-n.hw * inset, sy, n.hd * inset),
      ].map(project);
      ctx.beginPath();
      path(plane);
      ctx.closePath();
      ctx.fillStyle = `rgba(${ACCENT}, 0.05)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ACCENT}, 0.55)`;
      ctx.stroke();

      // nested cubes rotating on two axes
      const cubeY = n.h * 0.5;
      const drawCube = (half: number, a: number, b: number, alpha: number) => {
        const verts = Array.from({ length: 8 }, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
        const p = verts.map(([vx, vy, vz]) => {
          const x1 = vx * Math.cos(a) - vz * Math.sin(a);
          const z1 = vx * Math.sin(a) + vz * Math.cos(a);
          const y1 = vy * Math.cos(b) - z1 * Math.sin(b);
          const z2 = vy * Math.sin(b) + z1 * Math.cos(b);
          return project(v3(x1 * half, cubeY + y1 * half, z2 * half));
        });
        ctx.strokeStyle = `rgba(${lit ? ACCENT : INK}, ${alpha})`;
        ctx.beginPath();
        for (const [i, j] of EDGES) {
          ctx.moveTo(p[i].x, p[i].y);
          ctx.lineTo(p[j].x, p[j].y);
        }
        ctx.stroke();
      };
      const ta = reduce ? 0.62 : time * 0.00042;
      const tb = reduce ? 0.48 : time * 0.00027;
      drawCube(0.115, ta, tb, Math.min(1, 0.72 + pulse * 0.28));
      drawCube(0.055, -ta * 1.6, tb * 0.7 + 0.4, 0.45);

      // front faces of the case
      ctx.strokeStyle = `rgba(${col}, ${lit ? 0.9 : 0.45})`;
      for (const f of FACES) {
        const cx = n.x + f.n.x * n.hw;
        const cyy = f.top ? n.h : n.h / 2;
        const cz = n.z + f.n.z * n.hd;
        if (f.n.x * (eye.x - cx) + f.n.y * (eye.y - cyy) + f.n.z * (eye.z - cz) <= 0) continue;
        ctx.beginPath();
        path(f.idx.map((i) => c[i]));
        ctx.closePath();
        if (f.top) {
          ctx.fillStyle = `rgba(${col}, ${lit ? 0.1 : 0.04})`;
          ctx.fill();
        }
        ctx.stroke();
      }
    };

    const drawLabel = (n: Node3, lit: boolean) => {
      const a = project(v3(n.x, n.h, n.z));
      const x = clamp(a.x, labelHalf, w - labelHalf);
      const y = a.y - 16;
      ctx.font = mono;
      const text = n.label.toUpperCase();
      const tw = ctx.measureText(text).width;
      ctx.strokeStyle = `rgba(${lit ? ACCENT : INK}, ${lit ? 0.9 : 0.35})`;
      ctx.beginPath();
      ctx.moveTo(a.x + 0.5, a.y - 1);
      ctx.lineTo(a.x + 0.5, y + 8);
      ctx.stroke();
      ctx.fillStyle = `rgba(${lit ? ACCENT : CANVAS}, ${lit ? 1 : 0.86})`;
      ctx.fillRect(x - tw / 2 - 5, y - 8, tw + 10, 16);
      if (!lit) {
        ctx.strokeStyle = `rgba(${INK}, 0.22)`;
        ctx.strokeRect(x - tw / 2 - 4.5, y - 7.5, tw + 9, 15);
      }
      ctx.fillStyle = lit ? `rgb(${CANVAS})` : `rgba(${INK}, 0.92)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 0.5);
      return { x0: x - tw / 2 - 5, y0: y - 8, x1: x + tw / 2 + 5, y1: y + 8 };
    };

    const draw = (time: number) => {
      setCam(yaw, pitch);
      const eye = camPos();
      ctx.clearRect(0, 0, w, h);
      drawGrid();

      // floor footprints and arrival pings
      ctx.lineWidth = 1;
      NODES.forEach((n) => {
        floorQuad(n, 0.035);
        ctx.strokeStyle = `rgba(${hovered === n.id ? ACCENT : INK}, ${hovered === n.id ? 0.5 : 0.1})`;
        ctx.stroke();
      });
      for (const p of pings) {
        floorQuad(NODES[p.node], 0.04 + p.age * 0.26);
        ctx.strokeStyle = `rgba(${ACCENT}, ${0.55 * (1 - p.age)})`;
        ctx.stroke();
      }

      // route shadows on the floor (one per bundle), then the bundles
      const bundles: Array<{ fibers: Fiber[]; id: string }> = [
        ...IN_FIBERS.map((fibers, i) => ({ fibers, id: `src-${i}` })),
        ...OUT_FIBERS.map((fibers, i) => ({ fibers, id: `sink-${i}` })),
      ];
      ctx.strokeStyle = `rgba(${INK}, 0.06)`;
      ctx.beginPath();
      bundles.forEach(({ fibers }) => path(fibers[2].floor.map(project)));
      ctx.stroke();
      bundles.forEach(({ fibers, id }) => {
        const lit = hovered === id || hovered === "core";
        ctx.strokeStyle = lit ? `rgba(${ACCENT}, 0.36)` : `rgba(${INK}, 0.09)`;
        ctx.beginPath();
        fibers.forEach((f) => path(f.pts.map(project)));
        ctx.stroke();
      });

      // packets: floor shadows, then dashes (plain and accent batched)
      const plain: Array<[S2, S2]> = [];
      const hot: Array<[S2, S2]> = [];
      const shadow: Array<[S2, S2]> = [];
      for (const p of packets) {
        const f = fiberFor(p);
        const head = bez3(f.c, p.t);
        const tail = bez3(f.c, Math.max(0, p.t - 0.045));
        const sh = project(head);
        const st = project(tail);
        shadow.push([project(v3(tail.x, 0, tail.z)), project(v3(head.x, 0, head.z))]);
        (p.hot || touches(p, hovered) ? hot : plain).push([st, sh]);
      }
      const strokeSegs = (segs: Array<[S2, S2]>, style: string, width: number) => {
        if (!segs.length) return;
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.beginPath();
        for (const [a, b] of segs) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      };
      ctx.lineCap = "square";
      strokeSegs(shadow, `rgba(${INK}, 0.12)`, 1);
      strokeSegs(plain, `rgba(${INK}, 0.7)`, 1.5);
      strokeSegs(hot, `rgba(${ACCENT}, 0.95)`, 1.6);
      ctx.lineCap = "butt";
      ctx.lineWidth = 1;

      // nodes back to front, labels last
      const order = NODES.map((n, i) => ({ i, d: project(v3(n.x, n.h / 2, n.z)).d })).sort((a, b) => b.d - a.d);
      for (const { i } of order) {
        const n = NODES[i];
        if (n.kind === "core") drawCore(n, hovered === "core", time, eye);
        else drawBox(n, hovered === n.id, eye);
      }
      hits = [];
      for (const { i } of order) {
        const n = NODES[i];
        const lr = drawLabel(n, hovered === n.id);
        const pts = corners(n).map(project);
        hits.push({
          id: n.id,
          r: {
            x0: Math.min(lr.x0, ...pts.map((p) => p.x)) - 4,
            y0: Math.min(lr.y0, ...pts.map((p) => p.y)) - 4,
            x1: Math.max(lr.x1, ...pts.map((p) => p.x)) + 4,
            y1: Math.max(...pts.map((p) => p.y)) + 4,
          },
        });
      }
    };

    const targetYaw = () => {
      if (reduce) return clamp(STATIC_YAW + dragYaw, -YAW_LIMIT, YAW_LIMIT);
      return clamp(BASE_YAW + Math.sin(phase * 0.11) * 0.22 + dragYaw + px * 0.16, -YAW_LIMIT, YAW_LIMIT);
    };
    const targetPitch = () => (reduce ? BASE_PITCH : clamp(BASE_PITCH + py * 0.1, PITCH_MIN, PITCH_MAX));

    const step = (time: number) => {
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0.016;
      last = time;
      if (!drag) {
        phase += dt;
        idle += dt;
        if (idle > 1.6) dragYaw *= Math.exp(-dt * 0.5);
      }
      const ease = 1 - Math.exp(-dt * (drag ? 14 : 4));
      yaw += (targetYaw() - yaw) * ease;
      pitch += (targetPitch() - pitch) * ease;
      pulse = Math.max(0, pulse - dt * 2.5);

      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        p.t += p.speed * dt;
        if (p.t >= 1) {
          if (p.leg === 0) {
            p.leg = 1;
            p.t = 0;
            p.fiber = Math.floor(Math.random() * FIBERS);
            pulse = 1;
          } else {
            if (pings.length < 10 && Math.random() < 0.5) pings.push({ node: SOURCES.length + p.sink, age: 0 });
            packets[i] = { ...spawn(0), leg: 0 };
          }
        }
      }
      pings = pings.filter((p) => (p.age += dt * 1.3) < 1);

      draw(time);
      frames++;
      if (time - fpsClock > 600) {
        setFps(Math.round((frames * 1000) / (time - fpsClock)));
        setAngle({ yaw: deg(yaw), pitch: deg(pitch) });
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

    /** Redraw outside the loop (reduced motion, or paused off screen). */
    const still = () => {
      if (running) return;
      yaw = targetYaw();
      pitch = targetPitch();
      draw(performance.now());
      setAngle({ yaw: deg(yaw), pitch: deg(pitch) });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const widthChanged = Math.abs(rect.width - w) > 1;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fit();
      if (widthChanged || !packets.length) seed();
      draw(performance.now());
      setAngle({ yaw: deg(yaw), pitch: deg(pitch) });
    };

    const hit = (x: number, y: number): string | null => {
      // boxes take priority over the larger case behind them
      const inside = (r: Rect) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
      const box = [...hits].reverse().find((t) => t.id !== "core" && inside(t.r));
      if (box) return box.id;
      const core = hits.find((t) => t.id === "core");
      return core && inside(core.r) ? "core" : null;
    };

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, start: dragYaw };
      idle = 0;
      canvas.setPointerCapture?.(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const { x, y } = local(e);
      if (drag) {
        const rest = reduce ? STATIC_YAW : BASE_YAW + Math.sin(phase * 0.11) * 0.22 + px * 0.16;
        dragYaw = clamp(drag.start + (e.clientX - drag.x) * 0.006, -YAW_LIMIT - rest, YAW_LIMIT - rest);
        idle = 0;
        still();
        return;
      }
      if (e.pointerType === "mouse" && finePointer && !reduce) {
        px = clamp(x / w - 0.5, -0.5, 0.5);
        py = clamp(y / h - 0.5, -0.5, 0.5);
      }
      const id = hit(x, y);
      if (id !== hovered) {
        hovered = id;
        setHover(id);
        canvas.style.cursor = id ? "crosshair" : "grab";
        if (!running) draw(performance.now());
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      drag = null;
      idle = 0;
      canvas.releasePointerCapture?.(e.pointerId);
      canvas.style.cursor = hovered ? "crosshair" : "grab";
    };
    const onLeave = () => {
      if (drag) return;
      hovered = null;
      px = 0;
      py = 0;
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
    // Re-measure once web fonts are ready so canvas labels use Geist Mono.
    document.fonts?.ready
      .then(() => {
        fit();
        draw(performance.now());
      })
      .catch(() => undefined);
    start();

    return () => {
      stop();
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

  const traced = hover ? NODES.find((n) => n.id === hover)?.label ?? null : null;
  const signed = (n: number) => `${n < 0 ? "−" : "+"}${String(Math.abs(n)).padStart(2, "0")}°`;

  return (
    <figure className={`relative ${className}`}>
      <figcaption className="sr-only">
        Three-dimensional diagram of a product system: web, mobile and webhook clients send requests through an API to
        PostgreSQL, MongoDB and Redis.
      </figcaption>
      <div className="mb-3 flex items-center justify-between font-mono text-label uppercase tracking-[0.05em] text-muted" aria-hidden="true">
        <span>fig.01 / request path</span>
        <span>{traced ? <span className="text-accent">trace: {traced}</span> : "drag to orbit"}</span>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="no-print block h-[250px] w-full touch-pan-y select-none sm:h-[360px] lg:h-[420px]"
      />
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3 font-mono text-label uppercase tracking-[0.05em] text-muted" aria-hidden="true">
        <span className="tabular-nums">
          yaw {signed(angle.yaw)} / pitch {signed(angle.pitch)}
        </span>
        <span className="tabular-nums">{reduce ? "static / reduced motion" : fps ? `canvas2d / ${String(fps).padStart(2, "0")} fps` : "canvas2d"}</span>
      </div>
    </figure>
  );
};
