"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { BrainState } from "./types";
import { BRAIN_STATE_CONFIGS } from "./types";

interface LevqorBrainCanvasProps {
  brainState: BrainState;
  className?: string;
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

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    float t = u_time * 0.5;
    
    float wave1 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 2.0 - t * 0.7) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 4.0 + t * 1.3) * 0.5 + 0.5;
    
    float blend = (wave1 + wave2 + wave3) / 3.0;
    
    float intensity = 0.3 + u_state * 0.2;
    float speed = 1.0 + u_state * 0.5;
    
    blend = blend * intensity + (1.0 - intensity) * 0.5;
    
    vec3 color = mix(u_color1, u_color2, blend);
    color = mix(color, u_color3, wave3 * 0.3);
    
    float gradient = 1.0 - uv.y * 0.3;
    color *= gradient;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function WebGLRenderer({
  canvasRef,
  brainState,
  reducedMotion,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  brainState: BrainState;
  reducedMotion: boolean;
}) {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

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

    const stateValue = brainState === "organic" ? 0 : brainState === "neural" ? 1 : 2;

    const render = () => {
      if (!canvas || !gl || !program) return;

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

      const elapsed = reducedMotion ? 0 : (Date.now() - startTimeRef.current) / 1000;

      gl.uniform1f(timeLocation, elapsed);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform3f(color1Location, color1[0], color1[1], color1[2]);
      gl.uniform3f(color2Location, color2[0], color2[1], color2[2]);
      gl.uniform3f(color3Location, color3[0], color3[1], color3[2]);
      gl.uniform1f(stateLocation, stateValue / 2);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reducedMotion) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, brainState, reducedMotion]);

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

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      const offset1 = reducedMotion ? 0 : (Math.sin(elapsed * 0.5) * 0.1 + 0.1);
      const offset2 = reducedMotion ? 0.5 : (Math.sin(elapsed * 0.3 + 1) * 0.1 + 0.5);
      const offset3 = reducedMotion ? 1 : (Math.sin(elapsed * 0.4 + 2) * 0.1 + 0.9);

      gradient.addColorStop(Math.max(0, offset1), config.colors.primary);
      gradient.addColorStop(Math.max(0, Math.min(1, offset2)), config.colors.secondary);
      gradient.addColorStop(Math.min(1, offset3), config.colors.accent);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

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

export default function LevqorBrainCanvas({ brainState, className = "" }: LevqorBrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => isBrainCanvasEnabled());

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
