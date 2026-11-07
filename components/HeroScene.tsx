/**
 * Atmospheric night scene used behind the hero headline until a real
 * food-truck photograph is added: warm festoon lights, a golden glow
 * and tropical palm silhouettes. Pure SVG — no external requests.
 */

type Pt = { x: number; y: number };

const W = 1440;
const H = 900;

function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
}

function quadTangent(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const x = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const y = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

const r = (n: number) => Math.round(n * 10) / 10;

/** A single palm frond: a curved rib with drooping leaflets on both sides. */
function frond(base: Pt, angleDeg: number, length: number, bend: number, leaflet: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const tip = { x: base.x + Math.cos(a) * length, y: base.y + Math.sin(a) * length + bend };
  const ctrl = { x: base.x + Math.cos(a) * length * 0.55, y: base.y + Math.sin(a) * length * 0.55 - bend * 0.35 };
  let d = `M${r(base.x)} ${r(base.y)} Q${r(ctrl.x)} ${r(ctrl.y)} ${r(tip.x)} ${r(tip.y)} `;

  for (let t = 0.1; t <= 0.97; t += 0.032) {
    const p = quad(base, ctrl, tip, t);
    const tan = quadTangent(base, ctrl, tip, t);
    const len = leaflet * Math.pow(Math.sin(Math.PI * Math.min(t + 0.08, 1)), 0.7) * (1 - 0.35 * t);
    for (const side of [-1, 1]) {
      const rot = (side * 58 * Math.PI) / 180;
      let dx = tan.x * Math.cos(rot) - tan.y * Math.sin(rot);
      let dy = tan.x * Math.sin(rot) + tan.y * Math.cos(rot) + 0.55; // gravity droop
      const n = Math.hypot(dx, dy);
      dx /= n;
      dy /= n;
      const end = { x: p.x + dx * len, y: p.y + dy * len };
      const w = len * 0.09;
      const mid = { x: p.x + dx * len * 0.5, y: p.y + dy * len * 0.5 };
      d += `M${r(p.x)} ${r(p.y)} Q${r(mid.x - dy * w)} ${r(mid.y + dx * w)} ${r(end.x)} ${r(end.y)} Q${r(mid.x + dy * w)} ${r(mid.y - dx * w)} ${r(p.x + tan.x * 3)} ${r(p.y + tan.y * 3)}Z `;
    }
  }
  return d;
}

function palm(crown: Pt, trunkBase: Pt, scale: number): { trunk: string; fronds: string } {
  const mid = { x: (crown.x + trunkBase.x) / 2 + 40 * scale, y: (crown.y + trunkBase.y) / 2 };
  const w0 = 14 * scale;
  const w1 = 7 * scale;
  const trunk = `M${r(trunkBase.x - w0)} ${r(trunkBase.y)} Q${r(mid.x - w0)} ${r(mid.y)} ${r(crown.x - w1)} ${r(crown.y)} L${r(crown.x + w1)} ${r(crown.y)} Q${r(mid.x + w0)} ${r(mid.y)} ${r(trunkBase.x + w0)} ${r(trunkBase.y)}Z`;
  const specs: [number, number, number][] = [
    [-170, 300, 70], [-145, 320, 40], [-120, 260, 10], [-95, 200, -10], [-62, 250, 10],
    [-35, 310, 40], [-8, 300, 75], [20, 230, 90], [160, 230, 90], [195, 260, 85],
  ];
  const fronds = specs.map(([ang, len, bend]) => frond(crown, ang, len * scale, bend * scale, 70 * scale)).join(" ");
  return { trunk, fronds };
}

const rightPalm = palm({ x: 1290, y: 210 }, { x: 1190, y: 920 }, 1.05);
const farPalm = palm({ x: 1080, y: 330 }, { x: 1040, y: 920 }, 0.62);
const leftPalm = palm({ x: 70, y: 150 }, { x: 150, y: 920 }, 0.95);

// Festoon lights draped across the top of the frame.
const strand = { p0: { x: -40, y: 120 }, p1: { x: 720, y: 330 }, p2: { x: 1480, y: 90 } };
const bulbs = Array.from({ length: 26 }, (_, i) => quad(strand.p0, strand.p1, strand.p2, (i + 0.5) / 26));
const strand2 = { p0: { x: 520, y: -20 }, p1: { x: 1050, y: 210 }, p2: { x: 1480, y: 250 } };
const bulbs2 = Array.from({ length: 14 }, (_, i) => quad(strand2.p0, strand2.p1, strand2.p2, (i + 0.5) / 14));

export function HeroScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-ink">
      {/* Night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 82% 78%, rgb(215 158 72 / 0.42), transparent 62%), radial-gradient(45% 40% at 70% 92%, rgb(240 190 100 / 0.35), transparent 70%), radial-gradient(90% 70% at 20% 0%, rgb(38 60 40 / 0.85), transparent 70%), linear-gradient(180deg, #08110a 0%, #101b12 45%, #1a2216 100%)",
        }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="bulbGlow">
            <stop offset="0%" stopColor="#FFE2A3" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#F2C46D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D7B66A" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="softer" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* Distant palm, softly out of focus */}
        <g fill="#0d1a0f" opacity="0.85" filter="url(#soft)">
          <path d={farPalm.trunk} />
          <path d={farPalm.fronds} />
        </g>

        {/* Festoon lights */}
        <g>
          <path d={`M${strand2.p0.x} ${strand2.p0.y} Q${strand2.p1.x} ${strand2.p1.y} ${strand2.p2.x} ${strand2.p2.y}`} stroke="#3a3423" strokeWidth="1.2" fill="none" opacity="0.6" />
          {bulbs2.map((b, i) => (
            <g key={`b2-${i}`} className="hero-bulb" style={{ animationDelay: `${(i * 0.73) % 5}s` }}>
              <circle cx={b.x} cy={b.y + 7} r="14" fill="url(#bulbGlow)" opacity="0.6" />
              <circle cx={b.x} cy={b.y + 7} r="2.4" fill="#FFE7B0" />
            </g>
          ))}
          <path d={`M${strand.p0.x} ${strand.p0.y} Q${strand.p1.x} ${strand.p1.y} ${strand.p2.x} ${strand.p2.y}`} stroke="#4a412b" strokeWidth="1.5" fill="none" opacity="0.7" />
          {bulbs.map((b, i) => (
            <g key={`b-${i}`} className="hero-bulb" style={{ animationDelay: `${(i * 0.61) % 6}s` }}>
              <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + 8} stroke="#4a412b" strokeWidth="1.2" />
              <circle cx={b.x} cy={b.y + 12} r="22" fill="url(#bulbGlow)" />
              <circle cx={b.x} cy={b.y + 12} r="3.4" fill="#FFEBC0" />
            </g>
          ))}
        </g>

        {/* Foreground palms */}
        <g fill="#050c07">
          <path d={rightPalm.trunk} />
          <path d={rightPalm.fronds} filter="url(#softer)" />
          <path d={leftPalm.trunk} />
          <path d={leftPalm.fronds} filter="url(#softer)" />
        </g>

        {/* Ground haze */}
        <rect x="0" y={H - 220} width={W} height="220" fill="url(#bulbGlow)" opacity="0.08" />
      </svg>

      {/* Floating bokeh */}
      <div className="absolute inset-0">
        {[
          [76, 70, 90, 0.18], [88, 58, 46, 0.22], [64, 82, 60, 0.14], [92, 84, 120, 0.12], [55, 62, 30, 0.2],
        ].map(([left, top, size, op], i) => (
          <span
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, background: `rgb(242 196 109 / ${op})` }}
          />
        ))}
      </div>
    </div>
  );
}
