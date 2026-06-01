import { useEffect, useRef } from 'react';
import { VERT_SRC, FRAG_SRC } from './shaders';
import { createProgram } from './glUtils';

export function useAuroraGL(canvasRef, paramsRef, { reducedMotion }) {
  const stateRef = useRef({ raf: 0, start: performance.now(), fps: 0, noWebGL: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      stateRef.current.noWebGL = true;
      return;
    }

    const program = createProgram(gl, VERT_SRC, FRAG_SRC);
    if (!program) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = name => gl.getUniformLocation(program, name);
    const u = {
      res:      U('u_resolution'),
      time:     U('u_time'),
      mouse:    U('u_mouse'),
      speed:    U('u_speed'),
      scale:    U('u_scale'),
      warp:     U('u_warp'),
      oct:      U('u_octaves'),
      contrast: U('u_contrast'),
      bright:   U('u_brightness'),
      grain:    U('u_grain'),
      flow:     U('u_flow'),
      seed:     U('u_seed'),
      palA:     U('u_palA'),
      palB:     U('u_palB'),
      palC:     U('u_palC'),
      palD:     U('u_palD'),
    };

    let mouse = [0, 0];
    const onMove = e => {
      mouse = [e.clientX / innerWidth - 0.5, 0.5 - e.clientY / innerHeight];
    };
    if (!reducedMotion) addEventListener('pointermove', onMove);

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    addEventListener('resize', resize);

    stateRef.current.start = performance.now();
    let last = performance.now(), frames = 0, acc = 0;

    // Pause-freeze tracking (no effect re-run needed)
    let pausedAt = null;      // rAF timestamp when we paused
    let pausedDuration = 0;   // total ms spent paused

    function frame(now) {
      const p = paramsRef.current;

      if (p.paused) {
        if (pausedAt === null) pausedAt = now;
        // Keep looping so we can detect unpause, but don't advance time
      } else {
        if (pausedAt !== null) {
          pausedDuration += now - pausedAt;
          pausedAt = null;
        }
      }

      const elapsed = pausedAt !== null
        ? (pausedAt - stateRef.current.start - pausedDuration) / 1000
        : (now   - stateRef.current.start - pausedDuration) / 1000;

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, elapsed);
      gl.uniform2f(u.mouse, mouse[0], mouse[1]);
      gl.uniform1f(u.speed, p.speed);
      gl.uniform1f(u.scale, p.scale);
      gl.uniform1f(u.warp, p.warp);
      gl.uniform1f(u.oct, p.complexity);
      gl.uniform1f(u.contrast, p.contrast);
      gl.uniform1f(u.bright, p.brightness);
      gl.uniform1f(u.grain, p.grain);
      const a = (p.flowAngle * Math.PI) / 180;
      gl.uniform2f(u.flow, Math.cos(a), Math.sin(a));
      gl.uniform1f(u.seed, p.seed);

      // Saturation scales b-amplitude; hue rotates d-phase with per-channel offsets
      // so all three channels shift differently → visible color rotation
      const sat = p.saturation ?? 1;
      const hue = p.hueShift ?? 0;
      gl.uniform3fv(u.palA, p.palette.a);
      gl.uniform3fv(u.palB, p.palette.b.map(v => v * sat));
      gl.uniform3fv(u.palC, p.palette.c);
      gl.uniform3fv(u.palD, [
        p.palette.d[0] + hue,
        p.palette.d[1] + hue * 1.33,
        p.palette.d[2] + hue * 1.67,
      ]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      frames++;
      acc += now - last;
      last = now;
      if (acc >= 500) {
        stateRef.current.fps = Math.round((frames * 1000) / acc);
        frames = 0;
        acc = 0;
      }

      stateRef.current.raf = requestAnimationFrame(frame);
    }

    stateRef.current.raf = requestAnimationFrame(frame);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(stateRef.current.raf);
      } else {
        stateRef.current.raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, [reducedMotion]); // paused removed — handled inside the loop via paramsRef

  return stateRef;
}
