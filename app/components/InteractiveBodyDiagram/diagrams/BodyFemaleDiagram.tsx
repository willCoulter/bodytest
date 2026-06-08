'use client';

import React, { forwardRef, useState } from 'react';
import { bodyFemaleFront } from '../data/bodyFemaleFront';
import type { FreehandSelection, RadiusSelection, Mode } from '../types';

const TEAL = '#2AB5A3';
const AMBER = '#F59E0B';
const AMBER_STROKE = '#D97706';
const INDIGO = '#818CF8';
const INDIGO_STROKE = '#6366F1';

type Props = {
  mode: Mode;
  selectedZones: string[];
  onZoneClick: (slug: string, side: 'left' | 'right' | 'common') => void;
  freehandSelections: FreehandSelection[];
  radiusSelections: RadiusSelection[];
  activeDrawPoints: [number, number][];
  activeRadius: { center: [number, number]; radius: number } | null;
  onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => void;
  height: number;
  readOnly: boolean;
};

export const BodyFemaleDiagram = forwardRef<SVGSVGElement, Props>(function BodyFemaleDiagram(
  {
    mode,
    selectedZones,
    onZoneClick,
    freehandSelections,
    radiusSelections,
    activeDrawPoints,
    activeRadius,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    height,
    readOnly,
  },
  ref
) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const canInteract = !readOnly;

  function getZoneFill(slug: string, baseColor: string): string {
    const isSelected = selectedZones.includes(slug);
    const isHovered = hoveredZone === slug && mode === 'zone';
    if (isSelected) return `${TEAL}80`;
    if (isHovered) return `${TEAL}26`;
    if (slug === 'head' || slug === 'hair') return baseColor;
    return 'transparent';
  }

  function getZoneStroke(slug: string): { color: string; width: number; opacity: number } {
    const isSelected = selectedZones.includes(slug);
    const isHovered = hoveredZone === slug && mode === 'zone';
    if (isSelected) return { color: TEAL, width: 2, opacity: 1 };
    if (isHovered) return { color: TEAL, width: 1, opacity: 0.8 };
    return { color: '#3f3f3f', width: 0.5, opacity: 0.5 };
  }

  function renderZonePaths(zone: (typeof bodyFemaleFront)[0]) {
    const fill = getZoneFill(zone.slug, zone.color);
    const stroke = getZoneStroke(zone.slug);
    const pathGroups: { side: 'left' | 'right' | 'common'; paths: string[] }[] = [];

    if (zone.path.common) pathGroups.push({ side: 'common', paths: zone.path.common });
    if (zone.path.left) pathGroups.push({ side: 'left', paths: zone.path.left });
    if (zone.path.right) pathGroups.push({ side: 'right', paths: zone.path.right });

    return pathGroups.map(({ side, paths }) =>
      paths.map((d, idx) => (
        <path
          key={`${zone.slug}-${side}-${idx}`}
          d={d}
          fill={fill}
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeOpacity={stroke.opacity}
          style={{
            cursor: canInteract && mode === 'zone' ? 'pointer' : 'default',
            pointerEvents: canInteract && mode === 'zone' ? 'auto' : 'none',
            transition: 'fill 0.12s ease, stroke 0.12s ease',
          }}
          onPointerEnter={() => canInteract && mode === 'zone' && setHoveredZone(zone.slug)}
          onPointerLeave={() => setHoveredZone(null)}
          onClick={() => {
            if (canInteract && mode === 'zone') {
              onZoneClick(zone.slug, side);
            }
          }}
        />
      ))
    );
  }

  const drawPolylineStr = activeDrawPoints.map((p) => p.join(',')).join(' ');
  const closeThreshold = 12;
  const nearClose =
    activeDrawPoints.length > 2 &&
    Math.hypot(
      activeDrawPoints[0][0] - activeDrawPoints[activeDrawPoints.length - 1][0],
      activeDrawPoints[0][1] - activeDrawPoints[activeDrawPoints.length - 1][1]
    ) < closeThreshold;

  return (
    <svg
      ref={ref}
      viewBox="20 0 660 1450"
      preserveAspectRatio="xMidYMid meet"
      style={{ height, width: '100%', display: 'block', touchAction: 'none' }}
      onPointerDown={canInteract ? onPointerDown : undefined}
      onPointerMove={canInteract ? onPointerMove : undefined}
      onPointerUp={canInteract ? onPointerUp : undefined}
    >
      <g>{bodyFemaleFront.map((zone) => renderZonePaths(zone))}</g>

      {freehandSelections.map((sel, i) => (
        <polygon
          key={`freehand-${i}`}
          points={sel.points.map((p) => p.join(',')).join(' ')}
          fill={`${AMBER}59`}
          stroke={AMBER_STROKE}
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {radiusSelections.map((sel, i) => (
        <circle
          key={`radius-${i}`}
          cx={sel.center[0]}
          cy={sel.center[1]}
          r={sel.radius}
          fill={`${INDIGO}4D`}
          stroke={INDIGO_STROKE}
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {activeDrawPoints.length > 1 && (
        <>
          <polyline
            points={drawPolylineStr}
            fill="none"
            stroke={nearClose ? AMBER : AMBER_STROKE}
            strokeWidth={1.5}
            strokeDasharray={nearClose ? 'none' : '4 2'}
            style={{ pointerEvents: 'none' }}
          />
          {activeDrawPoints.length > 0 && (
            <circle
              cx={activeDrawPoints[0][0]}
              cy={activeDrawPoints[0][1]}
              r={nearClose ? 8 : 4}
              fill={nearClose ? AMBER : 'none'}
              stroke={AMBER_STROKE}
              strokeWidth={1.5}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </>
      )}

      {activeRadius && (
        <circle
          cx={activeRadius.center[0]}
          cy={activeRadius.center[1]}
          r={activeRadius.radius}
          fill={`${INDIGO}4D`}
          stroke={INDIGO_STROKE}
          strokeWidth={1.5}
          strokeDasharray="6 3"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {canInteract && mode !== 'zone' && (
        <rect
          x="0"
          y="0"
          width="10000"
          height="10000"
          fill="transparent"
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'cell', pointerEvents: 'auto' }}
        />
      )}
    </svg>
  );
});
