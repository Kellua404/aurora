function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  if (Array.isArray(a)) return a.map((v, i) => v + (b[i] - v) * t);
  return a + (b - a) * t;
}

const NUMERIC_KEYS = [
  'speed', 'flowAngle', 'scale', 'warp', 'complexity',
  'contrast', 'brightness', 'grain', 'hueShift', 'saturation', 'seed',
];

let currentTween = null;

export function morphTo(from, target, setMany, reducedMotion = false) {
  if (currentTween) {
    cancelAnimationFrame(currentTween);
    currentTween = null;
  }

  if (reducedMotion) {
    setMany(target);
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const raw = Math.min(elapsed / duration, 1);
    const t = easeInOutCubic(raw);

    const patch = {};
    for (const key of NUMERIC_KEYS) {
      if (target[key] !== undefined && from[key] !== undefined) {
        patch[key] = lerp(from[key], target[key], t);
      }
    }

    if (target.palette) {
      patch.palette = {
        a: lerp(from.palette.a, target.palette.a, t),
        b: lerp(from.palette.b, target.palette.b, t),
        c: lerp(from.palette.c, target.palette.c, t),
        d: lerp(from.palette.d, target.palette.d, t),
      };
    }

    if (target.presetName !== undefined) patch.presetName = target.presetName;
    if (target.seed !== undefined) patch.seed = lerp(from.seed, target.seed, t);

    setMany(patch);

    if (raw < 1) {
      currentTween = requestAnimationFrame(tick);
    } else {
      currentTween = null;
    }
  }

  currentTween = requestAnimationFrame(tick);
}
