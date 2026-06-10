'use client';

import React, { forwardRef, useState } from 'react';
import { bodyFront } from '../data/bodyFront';
import { bodyBack } from '../data/bodyBack';
import type { RegionZone } from '../data/regionConfig';
import type { FreehandSelection, RadiusSelection, Mode } from '../types';
import { AnnotationOverlay } from './AnnotationOverlay';

const TEAL = '#2AB5A3';

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

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
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

      <AnnotationOverlay
        viewBox={viewBox}
        freehandSelections={freehandSelections}
        radiusSelections={radiusSelections}
        activeDrawPoints={activeDrawPoints}
        activeRadius={activeRadius}
      />
    </div>
  );
});
