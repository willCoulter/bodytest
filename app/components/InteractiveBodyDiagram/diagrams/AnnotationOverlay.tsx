'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import type { FreehandSelection, RadiusSelection } from '../types';

const AMBER = '#F59E0B';
const AMBER_STROKE = '#D97706';
const INDIGO = '#818CF8';
const INDIGO_STROKE = '#6366F1';

// rgba equivalents for semi-transparent fills
const AMBER_FILL = 'rgba(245,158,11,0.35)';
const INDIGO_FILL = 'rgba(129,140,248,0.30)';

type Props = {
  viewBox: string;
  freehandSelections: FreehandSelection[];
  radiusSelections: RadiusSelection[];
  activeDrawPoints: [number, number][];
  activeRadius: { center: [number, number]; radius: number } | null;
};

function parseViewBox(vb: string): [number, number, number, number] {
  const [x, y, w, h] = vb.trim().split(/\s+/).map(Number);
  return [x, y, w, h];
}

export function AnnotationOverlay({
  viewBox,
  freehandSelections,
  radiusSelections,
  activeDrawPoints,
  activeRadius,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [vbX, vbY, vbW, vbH] = parseViewBox(viewBox);

  const transform = size
    ? (() => {
        const scale = Math.min(size.w / vbW, size.h / vbH);
        const offsetX = (size.w - vbW * scale) / 2;
        const offsetY = (size.h - vbH * scale) / 2;
        return { scale, offsetX, offsetY };
      })()
    : null;

  function toPixel([svgX, svgY]: [number, number]): [number, number] {
    if (!transform) return [0, 0];
    return [
      (svgX - vbX) * transform.scale + transform.offsetX,
      (svgY - vbY) * transform.scale + transform.offsetY,
    ];
  }

  const nearClose =
    activeDrawPoints.length > 2 &&
    Math.hypot(
      activeDrawPoints[0][0] - activeDrawPoints[activeDrawPoints.length - 1][0],
      activeDrawPoints[0][1] - activeDrawPoints[activeDrawPoints.length - 1][1]
    ) < 12;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {size && (
        <Stage width={size.w} height={size.h} listening={false}>
          <Layer>
            {freehandSelections.map((sel, i) => (
              <Line
                key={`freehand-${i}`}
                points={sel.points.flatMap((p) => toPixel(p))}
                closed
                fill={AMBER_FILL}
                stroke={AMBER_STROKE}
                strokeWidth={1.5}
              />
            ))}

            {radiusSelections.map((sel, i) => {
              const [cx, cy] = toPixel(sel.center);
              return (
                <Circle
                  key={`radius-${i}`}
                  x={cx}
                  y={cy}
                  radius={sel.radius * (transform?.scale ?? 1)}
                  fill={INDIGO_FILL}
                  stroke={INDIGO_STROKE}
                  strokeWidth={1.5}
                />
              );
            })}

            {activeDrawPoints.length > 1 && (
              <>
                <Line
                  points={activeDrawPoints.flatMap((p) => toPixel(p))}
                  stroke={nearClose ? AMBER : AMBER_STROKE}
                  strokeWidth={1.5}
                  dash={nearClose ? [] : [4, 2]}
                />
                <Circle
                  x={toPixel(activeDrawPoints[0])[0]}
                  y={toPixel(activeDrawPoints[0])[1]}
                  radius={nearClose ? 8 : 4}
                  fill={nearClose ? AMBER : ''}
                  stroke={AMBER_STROKE}
                  strokeWidth={1.5}
                />
              </>
            )}

            {activeRadius && (
              <Circle
                x={toPixel(activeRadius.center)[0]}
                y={toPixel(activeRadius.center)[1]}
                radius={activeRadius.radius * (transform?.scale ?? 1)}
                fill={INDIGO_FILL}
                stroke={INDIGO_STROKE}
                strokeWidth={1.5}
                dash={[6, 3]}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
