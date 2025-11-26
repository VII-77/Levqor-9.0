"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { BrainState } from "./types";
import { BRAIN_STATE_CONFIGS } from "./types";
import { useSoundIntensity } from "./useSoundIntensity";

interface LevqorBrainCanvasProps {
  brainState: BrainState;
  className?: string;
  soundIntensity?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function checkReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_state;
  uniform float u_sound;
  uniform float u_reducedMotion;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float soundMod = 1.0 + u_sound * 0.5;
    float t = u_time * 1.5 * soundMod;
    
    // For reduced motion: use static values
    float motionScale = 1.0 - u_reducedMotion;
    
    // Base waves - scaled by motion preference
    float wave1 = sin(uv.x * 6.0 + t * 2.0 * motionScale) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 5.0 - t * 1.5 * motionScale) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 8.0 + t * 2.5 * motionScale) * 0.5 + 0.5;
    float wave4 = sin((uv.x - uv.y) * 4.0 + t * 1.2 * motionScale) * 0.5 + 0.5;
    float wave5 = sin(uv.x * 12.0 - t * 3.0 * motionScale) * 0.3 + 0.5;
    float baseBlend = (wave1 + wave2 + wave3 + wave4 + wave5) / 5.0;
    
    // Flowing organic noise - reduced for accessibility
    float flowNoise = smoothNoise(uv * 4.0 + vec2(t * 0.5, t * 0.4) * motionScale) * 0.4 * motionScale;
    float flowNoise2 = smoothNoise(uv * 8.0 - vec2(t * 0.3, t * 0.6) * motionScale) * 0.25 * motionScale;
    
    // State-specific effects
    float effectStrength = 0.0;
    float pulseEffect = 0.0;
    float noiseEffect = 0.0;
    float gridEffect = 0.0;
    float flashOverlay = 0.0;
    vec3 flashColor = vec3(0.0);
    
    // ORGANIC (u_state ~0): Breathing with visible flow
    if (u_state < 0.125) {
      float breathe = sin(t * 0.8 * motionScale) * 0.5 + 0.5;
      float pulse = sin(t * 2.5 * motionScale + uv.x * 12.0) * 0.25 * motionScale;
      float flow = sin(uv.y * 10.0 + t * 1.5 * motionScale) * 0.2 * motionScale;
      float ripple = sin(length(uv - 0.5) * 20.0 - t * 3.0 * motionScale) * 0.15 * motionScale;
      effectStrength = 0.65 + breathe * 0.25 * motionScale;
      pulseEffect = pulse + flow + ripple;
      noiseEffect = flowNoise + flowNoise2;
    }
    // NEURAL (u_state ~0.25): Pulse lines, node flickers
    else if (u_state < 0.375) {
      float pulse = sin(t * 4.0 * motionScale + uv.y * 30.0) * 0.5 + 0.5;
      float grid = step(0.88, fract(uv.x * 15.0 + t * 1.0 * motionScale)) + step(0.88, fract(uv.y * 15.0 - t * 0.8 * motionScale));
      float spark = noise(uv * 100.0 + t * 8.0 * motionScale) * step(0.92, noise(uv * 50.0 + t * 5.0 * motionScale)) * motionScale;
      pulseEffect = pulse * 0.3 * motionScale;
      gridEffect = grid * 0.2 * motionScale + spark * 0.3;
      effectStrength = 0.7;
      noiseEffect = flowNoise * 0.6;
    }
    // QUANTUM (u_state ~0.5): Shimmer, noise distortion
    else if (u_state < 0.625) {
      float shimmer = noise(uv * 80.0 + t * 8.0 * motionScale) * 0.35 * motionScale;
      float interference = sin(uv.x * 60.0 + t * 10.0 * motionScale) * sin(uv.y * 60.0 - t * 7.0 * motionScale) * 0.25 * motionScale;
      float glitch = step(0.97, noise(vec2(floor(uv.y * 30.0), t * 2.0 * motionScale))) * 0.4 * motionScale;
      noiseEffect = shimmer + interference + flowNoise + glitch;
      effectStrength = 0.8;
    }
    // SUCCESS (u_state ~0.75): Green tint - NO FLASH for reduced motion
    else if (u_state < 0.875) {
      float successPulse = sin(t * 6.0 * motionScale) * 0.5 + 0.5;
      float ring = sin(length(uv - 0.5) * 25.0 - t * 5.0 * motionScale) * 0.2 * motionScale;
      // Static tint for reduced motion, animated pulse otherwise
      flashOverlay = u_reducedMotion > 0.5 ? 0.15 : 0.35 * successPulse;
      flashColor = vec3(0.13, 0.85, 0.40);
      effectStrength = 0.7;
      noiseEffect = flowNoise * 0.4 + ring;
    }
    // ERROR (u_state ~1.0): Red warning - NO FLASH for reduced motion
    else {
      float errorFlash = abs(sin(t * 10.0 * motionScale));
      float shake = sin(uv.x * 100.0 + t * 30.0 * motionScale) * 0.05 * motionScale;
      // Static tint for reduced motion, animated flash otherwise
      flashOverlay = u_reducedMotion > 0.5 ? 0.2 : 0.4 * errorFlash;
      flashColor = vec3(0.98, 0.25, 0.25);
      effectStrength = 0.7;
      noiseEffect = flowNoise * 0.4 + shake;
    }
    
    // Apply base blend with effect strength
    float blend = baseBlend * effectStrength + (1.0 - effectStrength) * 0.4;
    blend += pulseEffect + noiseEffect + gridEffect;
    blend = clamp(blend, 0.0, 1.0);
    
    // Color mixing with dynamic range
    vec3 color = mix(u_color1, u_color2, blend);
    color = mix(color, u_color3, wave3 * 0.5 + wave4 * 0.25 + wave5 * 0.15 + u_sound * 0.2);
    
    // Apply flash overlay for success/error (already reduced for accessibility)
    color = mix(color, flashColor, flashOverlay);
    
    // Gradient with brightness variation (reduced for accessibility)
    float gradient = 1.0 - uv.y * 0.2;
    float brightnessWave = 1.0 + sin(t * 1.0 * motionScale + uv.x * 4.0) * 0.15 * motionScale;
    float brightnessWave2 = 1.0 + sin(t * 0.7 * motionScale - uv.y * 3.0) * 0.1 * motionScale;
    color *= gradient * brightnessWave * brightnessWave2;
    color = color * (1.0 + u_sound * 0.2);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function WebGLRenderer({
  canvasRef,
  brainState,
  reducedMotion,
  soundIntensity = 0,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  brainState: BrainState;
  reducedMotion: boolean;
  soundIntensity?: number;
}) {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const soundIntensityRef = useRef<number>(soundIntensity);

  useEffect(() => {
    soundIntensityRef.current = soundIntensity;
  }, [soundIntensity]);

  const createShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    []
  );

  const createProgram = useCallback(
    (gl: WebGLRenderingContext): WebGLProgram | null => {
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) return null;

      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("Program link error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }

      return program;
    },
    [createShader]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return;

    glRef.current = gl;
    const program = createProgram(gl);
    if (!program) return;

    programRef.current = program;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    startTimeRef.current = Date.now();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (program) gl.deleteProgram(program);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
    };
  }, [canvasRef, createProgram]);

  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    const config = BRAIN_STATE_CONFIGS[brainState];
    const color1 = hexToRgb(config.colors.primary);
    const color2 = hexToRgb(config.colors.secondary);
    const color3 = hexToRgb(config.colors.accent);

    const stateMap: Record<BrainState, number> = {
      organic: 0,
      neural: 1,
      quantum: 2,
      success: 3,
      error: 4,
    };
    const stateValue = stateMap[brainState] ?? 0;

    let frameCount = 0;
    let lastPerfCheck = performance.now();
    
    const render = () => {
      if (!canvas || !gl || !program) return;
      
      const frameStart = performance.now();

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width * dpr;
      const height = rect.height * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.useProgram(program);

      const timeLocation = gl.getUniformLocation(program, "u_time");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const color1Location = gl.getUniformLocation(program, "u_color1");
      const color2Location = gl.getUniformLocation(program, "u_color2");
      const color3Location = gl.getUniformLocation(program, "u_color3");
      const stateLocation = gl.getUniformLocation(program, "u_state");
      const soundLocation = gl.getUniformLocation(program, "u_sound");
      const reducedMotionLocation = gl.getUniformLocation(program, "u_reducedMotion");

      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      gl.uniform1f(timeLocation, elapsed);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform3f(color1Location, color1[0], color1[1], color1[2]);
      gl.uniform3f(color2Location, color2[0], color2[1], color2[2]);
      gl.uniform3f(color3Location, color3[0], color3[1], color3[2]);
      gl.uniform1f(stateLocation, stateValue / 4);
      gl.uniform1f(soundLocation, soundIntensityRef.current);
      gl.uniform1f(reducedMotionLocation, reducedMotion ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      frameCount++;
      const now = performance.now();
      if (now - lastPerfCheck > 5000) {
        const avgFrameTime = (now - lastPerfCheck) / frameCount;
        if (avgFrameTime > 50) {
          console.warn(`[Perf] LevqorBrainCanvas slow: ${avgFrameTime.toFixed(1)}ms/frame avg`);
        }
        frameCount = 0;
        lastPerfCheck = now;
      }

      if (!reducedMotion) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, brainState, reducedMotion, soundIntensity]);

  return null;
}

function Canvas2DFallback({
  canvasRef,
  brainState,
  reducedMotion,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  brainState: BrainState;
  reducedMotion: boolean;
}) {
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = BRAIN_STATE_CONFIGS[brainState];

    const render = () => {
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width * dpr;
      const height = rect.height * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const elapsed = reducedMotion ? 0 : (Date.now() - startTimeRef.current) / 1000;

      const gradient = ctx.createLinearGradient(
        Math.sin(elapsed * 0.3) * width * 0.2,
        Math.cos(elapsed * 0.2) * height * 0.1,
        width + Math.sin(elapsed * 0.4) * width * 0.15,
        height + Math.cos(elapsed * 0.35) * height * 0.1
      );
      
      const offset1 = reducedMotion ? 0 : (Math.sin(elapsed * 0.8) * 0.15 + 0.1);
      const offset2 = reducedMotion ? 0.5 : (Math.sin(elapsed * 0.5 + 1) * 0.15 + 0.5);
      const offset3 = reducedMotion ? 1 : (Math.sin(elapsed * 0.6 + 2) * 0.15 + 0.85);

      gradient.addColorStop(Math.max(0, offset1), config.colors.primary);
      gradient.addColorStop(Math.max(0, Math.min(1, offset2)), config.colors.secondary);
      gradient.addColorStop(Math.min(1, offset3), config.colors.accent);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (brainState === "organic" && !reducedMotion) {
        const waveCount = 4;
        for (let i = 0; i < waveCount; i++) {
          const waveAlpha = 0.06 + Math.sin(elapsed * 0.8 + i) * 0.03;
          ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha})`;
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 5) {
            const y = height * 0.2 + (height * 0.6 / waveCount) * i + 
                      Math.sin(x / 80 + elapsed * 1.2 + i * 0.5) * 15 * dpr +
                      Math.sin(x / 40 + elapsed * 0.8) * 8 * dpr;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      if (brainState === "neural" && !reducedMotion) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5 * dpr;
        for (let i = 0; i < 6; i++) {
          const y = (height / 6) * i + Math.sin(elapsed * 2.5 + i) * 15 * dpr;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      if (brainState === "quantum" && !reducedMotion) {
        const shimmerIntensity = Math.sin(elapsed * 6) * 0.12 + 0.12;
        ctx.fillStyle = `rgba(255, 255, 255, ${shimmerIntensity})`;
        for (let i = 0; i < 25; i++) {
          const x = (Math.sin(elapsed * 1.2 + i * 0.5) * 0.5 + 0.5) * width;
          const y = (Math.cos(elapsed * 0.9 + i * 0.3) * 0.5 + 0.5) * height;
          ctx.beginPath();
          ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (brainState === "success" && !reducedMotion) {
        const pulse = Math.sin(elapsed * 5) * 0.12 + 0.12;
        ctx.fillStyle = `rgba(34, 197, 94, ${pulse})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (brainState === "error" && !reducedMotion) {
        const flash = Math.abs(Math.sin(elapsed * 7)) * 0.18;
        ctx.fillStyle = `rgba(239, 68, 68, ${flash})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (!reducedMotion) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    startTimeRef.current = Date.now();
    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, brainState, reducedMotion]);

  return null;
}

function isBrainCanvasEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const featureFlag = process.env.NEXT_PUBLIC_LEVQOR_BRAIN_CANVAS_ENABLED;
  return featureFlag !== "false";
}

export default function LevqorBrainCanvas({ brainState, className = "", soundIntensity: externalSoundIntensity }: LevqorBrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => isBrainCanvasEnabled());
  const hookSoundIntensity = useSoundIntensity();
  const soundIntensity = externalSoundIntensity ?? hookSoundIntensity;

  useEffect(() => {
    setIsEnabled(isBrainCanvasEnabled());
    setIsWebGLSupported(checkWebGLSupport());
    setReducedMotion(checkReducedMotion());

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!isEnabled) {
    const config = BRAIN_STATE_CONFIGS[brainState];
    return (
      <div
        className={`bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center ${className}`}
        role="img"
        aria-label={`Levqor Brain visualization placeholder - ${config.label} state`}
      >
        <div className="text-center text-neutral-500 p-4">
          <div className="text-2xl mb-2">🧠</div>
          <p className="text-sm font-medium">Levqor Brain</p>
          <p className="text-xs">{config.label} mode</p>
        </div>
      </div>
    );
  }

  if (isWebGLSupported === null) {
    return (
      <div
        className={`bg-gradient-to-br from-primary-100 to-secondary-100 animate-pulse ${className}`}
        role="img"
        aria-label="Loading Levqor Brain visualization"
      />
    );
  }

  const config = BRAIN_STATE_CONFIGS[brainState];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="img"
      aria-label={`Levqor Brain visualization in ${config.label} state: ${config.description}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      {isWebGLSupported ? (
        <WebGLRenderer
          canvasRef={canvasRef}
          brainState={brainState}
          reducedMotion={reducedMotion}
          soundIntensity={soundIntensity}
        />
      ) : (
        <Canvas2DFallback
          canvasRef={canvasRef}
          brainState={brainState}
          reducedMotion={reducedMotion}
        />
      )}
      {reducedMotion && (
        <div className="absolute bottom-2 right-2 text-xs text-white/50 bg-black/20 px-2 py-1 rounded">
          Motion reduced
        </div>
      )}
    </div>
  );
}
