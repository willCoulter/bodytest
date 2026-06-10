'use client';

import React, { forwardRef, useState } from 'react';
import { bodyFront } from '../data/bodyFront';
import type { FreehandSelection, RadiusSelection, Mode } from '../types';
import { AnnotationOverlay } from './AnnotationOverlay';

const TEAL = '#2AB5A3';

// The head and hair paths from bodyFront — used as the silhouette base.
// These are already in body-diagram coordinate space, so the viewBox below
// is simply a tight crop of the same artwork.
const headZone = bodyFront.find((z) => z.slug === 'head')!;
const hairZone = bodyFront.find((z) => z.slug === 'hair')!;

// Tight crop around the head+hair region in body-space coordinates.
// face skin (head path): left temple x≈309, right x≈419, at y≈168
// hairline top: crown x≈364 y≈124, sides x≈342/402 y≈127; chin y≈241
const VIEW_BOX = '292 100 154 158';

// Sub-zone paths aligned to the actual head silhouette from bodyFront.
// Face spans: x≈309–419, y≈124–241; centre-x≈364
const HEAD_ZONES: { slug: string; d: string }[] = [
  {
    slug: 'head_forehead',
    d: 'M 342 127 Q 364 124 402 127 L 419 168 L 309 168 Z',
  },
  {
    slug: 'head_left_brow',
    d: 'M 309 168 L 364 168 L 363 181 L 313 181 Z',
  },
  {
    slug: 'head_right_brow',
    d: 'M 364 168 L 419 168 L 415 181 L 365 181 Z',
  },
  {
    slug: 'head_left_undereye',
    d: 'M 313 181 L 354 181 L 352 198 L 315 197 Z',
  },
  {
    slug: 'head_right_undereye',
    d: 'M 374 181 L 415 181 L 418 197 L 376 198 Z',
  },
  {
    slug: 'head_nose',
    d: 'M 354 181 L 374 181 L 378 219 L 350 219 Z',
  },
  {
    slug: 'head_left_cheek',
    d: 'M 315 197 L 352 198 L 348 219 L 337 229 L 319 224 Z',
  },
  {
    slug: 'head_right_cheek',
    d: 'M 376 198 L 418 197 L 413 224 L 401 229 L 380 219 Z',
  },
  {
    slug: 'head_upper_lip',
    d: 'M 350 219 Q 364 213 378 219 L 376 228 Q 364 233 352 228 Z',
  },
  {
    slug: 'head_lower_lip',
    d: 'M 352 228 Q 364 233 376 228 L 374 237 Q 364 241 354 237 Z',
  },
  {
    slug: 'head_chin',
    d: 'M 337 229 Q 364 223 401 229 L 395 242 Q 364 245 333 242 Z',
  },
  {
    slug: 'head_left_jaw',
    d: 'M 315 197 L 319 224 L 337 229 L 333 242 L 317 234 L 313 212 Z',
  },
  {
    slug: 'head_right_jaw',
    d: 'M 418 197 L 419 212 L 411 234 L 401 242 L 395 242 L 401 229 L 413 224 Z',
  },
];

type Props = {
  mode: Mode;
  selectedZones: string[];
  onZoneClick: (slug: string) => void;
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

export const HeadDiagram = forwardRef<SVGSVGElement, Props>(function HeadDiagram(
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

  function getZoneFill(slug: string): string {
    const isSelected = selectedZones.includes(slug);
    const isHovered = hoveredZone === slug && mode === 'zone';
    if (isSelected) return `${TEAL}80`;
    if (isHovered) return `${TEAL}26`;
    return 'transparent';
  }

  function getZoneStroke(slug: string): { color: string; width: number; opacity: number } {
    const isSelected = selectedZones.includes(slug);
    const isHovered = hoveredZone === slug && mode === 'zone';
    if (isSelected) return { color: TEAL, width: 0.8, opacity: 1 };
    if (isHovered) return { color: TEAL, width: 0.6, opacity: 0.8 };
    return { color: '#3f3f3f', width: 0.3, opacity: 0.45 };
  }

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <svg
        ref={ref}
        viewBox={VIEW_BOX}
        preserveAspectRatio="xMidYMid meet"
        style={{ height, width: '100%', display: 'block', touchAction: 'none' }}
        onPointerDown={canInteract ? onPointerDown : undefined}
        onPointerMove={canInteract ? onPointerMove : undefined}
        onPointerUp={canInteract ? onPointerUp : undefined}
      >
        {/* ── Silhouette: actual head + hair paths from bodyFront ── */}
        <g style={{ pointerEvents: 'none' }}>
          {hairZone.path.common?.map((d, i) => (
            <path key={`hair-${i}`} d={d} fill="#c8c8c8" stroke="none" />
          ))}
          {headZone.path.common?.map((d, i) => (
            <path key={`head-${i}`} d={d} fill={headZone.color} stroke="none" />
          ))}
        </g>

        {/* ── Face sub-zone paths ── */}
        {HEAD_ZONES.map(({ slug, d }) => {
          const fill = getZoneFill(slug);
          const stroke = getZoneStroke(slug);
          return (
            <path
              key={slug}
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
              onPointerEnter={() => canInteract && mode === 'zone' && setHoveredZone(slug)}
              onPointerLeave={() => setHoveredZone(null)}
              onClick={() => canInteract && mode === 'zone' && onZoneClick(slug)}
            />
          );
        })}

        {/* ── Capture overlay for draw/radius modes ── */}
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

      <AnnotationOverlay
        viewBox={VIEW_BOX}
        freehandSelections={freehandSelections}
        radiusSelections={radiusSelections}
        activeDrawPoints={activeDrawPoints}
        activeRadius={activeRadius}
      />
    </div>
  );
});
