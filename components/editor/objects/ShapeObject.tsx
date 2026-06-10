'use client';

import React from 'react';
import type { ShapeObjectData } from '@/types';

interface ShapeObjectProps {
  data: ShapeObjectData;
  width: number;
  height: number;
}

export default function ShapeObject({ data, width, height }: ShapeObjectProps) {
  const { shape, fill, stroke, strokeWidth, borderRadius } = data;
  const sw = strokeWidth || 0;
  const half = sw / 2;

  if (shape === 'circle') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={Math.max(0, width / 2 - half)}
          ry={Math.max(0, height / 2 - half)}
          fill={fill || '#3B82F6'}
          stroke={stroke || 'transparent'}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  if (shape === 'triangle') {
    const pts = `${width / 2},${half} ${width - half},${height - half} ${half},${height - half}`;
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <polygon
          points={pts}
          fill={fill || '#3B82F6'}
          stroke={stroke || 'transparent'}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  if (shape === 'star') {
    const cx = width / 2;
    const cy = height / 2;
    const outerR = Math.min(width, height) / 2 - half;
    const innerR = outerR * 0.4;
    const points = 5;
    let pts = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts += `${x},${y} `;
    }
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <polygon
          points={pts.trim()}
          fill={fill || '#C9A227'}
          stroke={stroke || 'transparent'}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  // Default: rect
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect
        x={half}
        y={half}
        width={Math.max(0, width - sw)}
        height={Math.max(0, height - sw)}
        rx={borderRadius || 0}
        ry={borderRadius || 0}
        fill={fill || '#3B82F6'}
        stroke={stroke || 'transparent'}
        strokeWidth={sw}
      />
    </svg>
  );
}
