import { useEffect, useRef } from 'react';

export function useAudioVisualizer(audioEl: HTMLAudioElement | null, canvasRef: HTMLCanvasElement | null) {
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!audioEl || !canvasRef) return;
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audioEl);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    analyser.connect(ctx.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef;
    const canvasCtx = canvas.getContext('2d');

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      if (!canvasCtx) return;
      const width = canvas.width;
      const height = canvas.height;
      canvasCtx.clearRect(0, 0, width, height);

      // draw wave with color based on RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] - 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length) / 128; // 0..1
      const hue = Math.floor(200 - rms * 200); // blue -> red

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = `hsla(${hue},90%,60%,0.85)`;
      canvasCtx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      canvasCtx.lineTo(width, height / 2);
      canvasCtx.stroke();

      // subtle glow
      canvasCtx.fillStyle = `hsla(${hue},90%,60%,${0.06 + rms * 0.25})`;
      canvasCtx.fillRect(0, 0, width, height);
    }

    // resize canvas to device pixels
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      try { analyser.disconnect(); src.disconnect(); ctx.close(); } catch (e) {}
    };
  }, [audioEl, canvasRef]);
}

export default useAudioVisualizer;
