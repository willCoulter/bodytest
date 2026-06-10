'use client';

import React, { forwardRef, useState } from 'react';
import { bodyBack } from '../data/bodyBack';
import type { FreehandSelection, RadiusSelection, Mode } from '../types';
import { AnnotationOverlay } from './AnnotationOverlay';

const TEAL = '#2AB5A3';

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

// Resolve the selection ID that will be stored for a given slug + side combo.
// Back-view zones that share a slug with the front (e.g. calves, triceps) use
// the same IDs so a selection highlights in both views.
function resolveSelectionId(slug: string, side: 'left' | 'right' | 'common'): string {
  if (side === 'common') return slug;
  return `${slug}_${side}`;
}

export const BodyBackDiagram = forwardRef<SVGSVGElement, Props>(function BodyBackDiagram(
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canInteract = !readOnly;

  function getFill(selectionId: string, baseColor: string, isHead: boolean): string {
    const isSelected = selectedZones.includes(selectionId);
    const isHovered = hoveredId === selectionId && mode === 'zone';
    if (isSelected) return `${TEAL}80`;
    if (isHovered) return `${TEAL}26`;
    if (isHead) return baseColor;
    return 'transparent';
  }

  function getStroke(selectionId: string): { color: string; width: number; opacity: number } {
    const isSelected = selectedZones.includes(selectionId);
    const isHovered = hoveredId === selectionId && mode === 'zone';
    if (isSelected) return { color: TEAL, width: 2, opacity: 1 };
    if (isHovered) return { color: TEAL, width: 1, opacity: 0.8 };
    return { color: '#3f3f3f', width: 0.5, opacity: 0.5 };
  }

  function renderZonePaths(zone: (typeof bodyBack)[0]) {
    const isHead = zone.slug === 'head';
    const pathGroups: { side: 'left' | 'right' | 'common'; paths: string[] }[] = [];
    if (zone.path.common) pathGroups.push({ side: 'common', paths: zone.path.common });
    if (zone.path.left)   pathGroups.push({ side: 'left',   paths: zone.path.left });
    if (zone.path.right)  pathGroups.push({ side: 'right',  paths: zone.path.right });

    return pathGroups.map(({ side, paths }) => {
      const selId = resolveSelectionId(zone.slug, side);
      const fill   = getFill(selId, zone.color, isHead);
      const stroke = getStroke(selId);
      return paths.map((d, idx) => (
        <path
          key={`${selId}-${idx}`}
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
          onPointerEnter={() => canInteract && mode === 'zone' && setHoveredId(selId)}
          onPointerLeave={() => setHoveredId(null)}
          onClick={() => canInteract && mode === 'zone' && onZoneClick(zone.slug, side)}
        />
      ));
    });
  }

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <svg
        ref={ref}
        viewBox="755 85 660 1280"
        preserveAspectRatio="xMidYMid meet"
        style={{ height, width: '100%', display: 'block', touchAction: 'none' }}
        onPointerDown={canInteract ? onPointerDown : undefined}
        onPointerMove={canInteract ? onPointerMove : undefined}
        onPointerUp={canInteract ? onPointerUp : undefined}
      >
        <g>{bodyBack.map((zone) => renderZonePaths(zone))}</g>

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
        viewBox="755 85 660 1280"
        freehandSelections={freehandSelections}
        radiusSelections={radiusSelections}
        activeDrawPoints={activeDrawPoints}
        activeRadius={activeRadius}
      />
    </div>
  );
});
