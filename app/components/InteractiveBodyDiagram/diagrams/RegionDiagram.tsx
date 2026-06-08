'use client';

import React, { forwardRef, useState } from 'react';
import { bodyFront } from '../data/bodyFront';
import { bodyBack } from '../data/bodyBack';
import type { RegionZone } from '../data/regionConfig';
import type { FreehandSelection, RadiusSelection, Mode } from '../types';

const TEAL = '#2AB5A3';
const AMBER = '#F59E0B';
const AMBER_STROKE = '#D97706';
const INDIGO = '#818CF8';
const INDIGO_STROKE = '#6366F1';

type BodyEntry = { slug: string; path: { left?: string[]; right?: string[]; common?: string[] } };

type Props = {
  viewBox: string;
  zones: RegionZone[];
  bodyData?: BodyEntry[];
  mode: Mode;
  selectedZones: string[];
  onZoneClick: (selectionId: string) => void;
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

export const RegionDiagram = forwardRef<SVGSVGElement, Props>(function RegionDiagram(
  {
    viewBox,
    zones,
    bodyData = bodyFront,
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canInteract = !readOnly;

  function getFill(selectionId: string): string {
    const isSelected = selectedZones.includes(selectionId);
    const isHovered = hoveredId === selectionId && mode === 'zone';
    if (isSelected) return `${TEAL}80`;
    if (isHovered) return `${TEAL}26`;
    return 'transparent';
  }

  function getStroke(selectionId: string): { color: string; width: number; opacity: number } {
    const isSelected = selectedZones.includes(selectionId);
    const isHovered = hoveredId === selectionId && mode === 'zone';
    if (isSelected) return { color: TEAL, width: 2, opacity: 1 };
    if (isHovered) return { color: TEAL, width: 1, opacity: 0.8 };
    return { color: '#3f3f3f', width: 0.5, opacity: 0.5 };
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
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ height, width: '100%', display: 'block', touchAction: 'none' }}
      onPointerDown={canInteract ? onPointerDown : undefined}
      onPointerMove={canInteract ? onPointerMove : undefined}
      onPointerUp={canInteract ? onPointerUp : undefined}
    >
      {/* ── Zone paths from bodyFront ── */}
      {zones.map((zoneConfig) => {
        const bfZone = bodyData.find((z) => z.slug === zoneConfig.slug);
        if (!bfZone) return null;

        const paths: string[] = [];
        if (zoneConfig.renderSides.includes('common')) paths.push(...(bfZone.path.common ?? []));
        if (zoneConfig.renderSides.includes('left'))   paths.push(...(bfZone.path.left ?? []));
        if (zoneConfig.renderSides.includes('right'))  paths.push(...(bfZone.path.right ?? []));

        const fill   = getFill(zoneConfig.selectionId);
        const stroke = getStroke(zoneConfig.selectionId);

        return paths.map((d, idx) => (
          <path
            key={`${zoneConfig.selectionId}-${idx}`}
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
            onPointerEnter={() => canInteract && mode === 'zone' && setHoveredId(zoneConfig.selectionId)}
            onPointerLeave={() => setHoveredId(null)}
            onClick={() => canInteract && mode === 'zone' && onZoneClick(zoneConfig.selectionId)}
          />
        ));
      })}

      {/* ── Committed freehand shapes ── */}
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

      {/* ── Committed radius circles ── */}
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

      {/* ── Active freehand in progress ── */}
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
          <circle
            cx={activeDrawPoints[0][0]}
            cy={activeDrawPoints[0][1]}
            r={nearClose ? 8 : 4}
            fill={nearClose ? AMBER : 'none'}
            stroke={AMBER_STROKE}
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}

      {/* ── Active radius in progress ── */}
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

      {/* ── Capture overlay for draw/radius modes ── */}
      {canInteract && mode !== 'zone' && (
        <rect
          x="-99999"
          y="-99999"
          width="999999"
          height="999999"
          fill="transparent"
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'cell', pointerEvents: 'auto' }}
        />
      )}
    </svg>
  );
});
