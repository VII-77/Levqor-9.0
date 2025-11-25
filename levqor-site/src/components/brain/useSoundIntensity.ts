"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const featureFlag = process.env.NEXT_PUBLIC_LEVQOR_BRAIN_SOUND_ENABLED;
  return featureFlag === "true" || featureFlag === "1";
}

function checkReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSoundIntensity(): number {
  const [intensity, setIntensity] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const soundEnabled = isSoundEnabled();
    const reducedMotion = checkReducedMotion();
    setIsEnabled(soundEnabled && !reducedMotion);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsEnabled(isSoundEnabled() && !e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const computeRMS = useCallback((dataArray: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return Math.min(1, rms * 2);
  }, []);

  const startAnalysis = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyse = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      const rms = computeRMS(dataArrayRef.current);
      setIntensity(rms);
      
      animationRef.current = requestAnimationFrame(analyse);
    };
    
    analyse();
  }, [computeRMS]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIntensity(0);
    setHasPermission(false);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      cleanup();
      return;
    }

    let mounted = true;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        setHasPermission(true);

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        startAnalysis();
      } catch {
        if (mounted) {
          setHasPermission(false);
          setIntensity(0);
        }
      }
    };

    initAudio();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [isEnabled, cleanup, startAnalysis]);

  if (!isEnabled || !hasPermission) {
    return 0;
  }

  return intensity;
}

export default useSoundIntensity;
