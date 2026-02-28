'use client';

import { useEffect, useRef } from 'react';

interface HealthFactorGaugeProps {
  value: number;
  size?: number;
}

export function HealthFactorGauge({ value, size = 200 }: HealthFactorGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 30;
    ctx.stroke();

    // Determine color based on value
    let color = '#4ade80'; // green
    if (value >= 1.25 && value < 1.5) color = '#facc15'; // yellow
    if (value >= 1.5) color = '#f87171'; // red

    // Progress arc
    const startAngle = Math.PI * 1.2;
    const endAngle = startAngle + (Math.PI * 1.6 * Math.min(value / 2, 1));

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 20, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.25}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toFixed(2), centerX, centerY - 10);

    ctx.fillStyle = '#9ca3af';
    ctx.font = `${size * 0.12}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillText('Health Factor', centerX, centerY + 25);
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="w-full max-w-xs mx-auto"
    />
  );
}
