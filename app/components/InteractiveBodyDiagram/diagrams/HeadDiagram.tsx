'use client';

import React, { forwardRef, useState } from 'react';
import { bodyFront } from '../data/bodyFront';
import type { FreehandSelection, RadiusSelection, Mode } from '../types';

const TEAL = '#2AB5A3';
const AMBER = '#F59E0B';
const AMBER_STROKE = '#D97706';
const INDIGO = '#818CF8';
const INDIGO_STROKE = '#6366F1';

// The head and hair paths from bodyFront — used as the silhouette base.
// These are already in body-diagram coordinate space, so the viewBox below
// is simply a tight crop of the same artwork.
const headZone = bodyFront.find((z) => z.slug === 'head')!;
const hairZone = bodyFront.find((z) => z.slug === 'hair')!;

// Tight crop around the head+hair region in body-space coordinates.
// head/hair span: x≈304–427, y≈107–242
const VIEW_BOX = '292 100 154 158';

// Sub-zone paths drawn in the same body-space coordinate system.
// The face occupies roughly x: 316–413, y: 135–242 within this viewBox.
//   centre-x ≈ 364, forehead top ≈ y138, chin bottom ≈ y242
const HEAD_ZONES: { slug: string; d: string }[] = [
  {
    // Full-width band from hair-line down to brow level
    slug: 'head_forehead',
    d: 'M 328 140 Q 364 127 400 140 L 395 163 Q 364 153 333 163 Z',
  },
  {
    // Left eyebrow strip
    slug: 'head_left_brow',
    d: 'M 333 163 Q 347 156 359 161 L 357 173 Q 342 170 334 173 Z',
  },
  {
    // Right eyebrow strip
    slug: 'head_right_brow',
    d: 'M 369 161 Q 381 156 395 163 L 393 173 Q 385 170 371 173 Z',
  },
  {
    // Left under-eye pocket, medial of left cheek
    slug: 'head_left_undereye',
    d: 'M 334 174 L 355 174 L 352 189 L 336 189 Z',
  },
  {
    // Right under-eye pocket
    slug: 'head_right_undereye',
    d: 'M 373 174 L 394 174 L 391 189 L 376 189 Z',
  },
  {
    // Central nose column — spans from brow level to just above upper lip
    slug: 'head_nose',
    d: 'M 352 163 L 376 163 L 381 195 L 373 216 L 355 216 L 347 195 Z',
  },
  {
    // Left cheek — lateral face from brow to jaw
    slug: 'head_left_cheek',
    d: 'M 317 163 L 349 163 L 344 216 L 331 228 L 315 222 L 307 196 Z',
  },
  {
    // Right cheek
    slug: 'head_right_cheek',
    d: 'M 411 163 L 379 163 L 384 216 L 397 228 L 413 222 L 421 196 Z',
  },
  {
    // Upper lip — cupid's bow band
    slug: 'head_upper_lip',
    d: 'M 346 219 Q 364 211 382 219 L 379 230 Q 364 237 349 230 Z',
  },
  {
    // Lower lip
    slug: 'head_lower_lip',
    d: 'M 349 230 Q 364 237 379 230 L 376 239 Q 364 245 352 239 Z',
  },
  {
    // Chin — central lower band, sits below the lips between the jaws
    slug: 'head_chin',
    d: 'M 331 228 Q 364 221 397 228 L 393 247 Q 364 253 335 247 Z',
  },
  {
    // Left jaw — lateral lower quadrant
    slug: 'head_left_jaw',
    d: 'M 307 196 L 315 222 L 331 228 L 335 247 L 318 253 L 302 230 Z',
  },
  {
    // Right jaw
    slug: 'head_right_jaw',
    d: 'M 421 196 L 413 222 L 397 228 L 393 247 L 410 253 L 426 230 Z',
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

  const drawPolylineStr = activeDrawPoints.map((p) => p.join(',')).join(' ');
  const closeThreshold = 5; // tighter threshold in the zoomed space
  const nearClose =
    activeDrawPoints.length > 2 &&
    Math.hypot(
      activeDrawPoints[0][0] - activeDrawPoints[activeDrawPoints.length - 1][0],
      activeDrawPoints[0][1] - activeDrawPoints[activeDrawPoints.length - 1][1]
    ) < closeThreshold;

  return (
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

      {/* ── Committed freehand shapes ── */}
      {freehandSelections.map((sel, i) => (
        <polygon
          key={`freehand-${i}`}
          points={sel.points.map((p) => p.join(',')).join(' ')}
          fill={`${AMBER}59`}
          stroke={AMBER_STROKE}
          strokeWidth={0.8}
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
          strokeWidth={0.8}
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
            strokeWidth={0.8}
            strokeDasharray={nearClose ? 'none' : '2 1'}
            style={{ pointerEvents: 'none' }}
          />
          <circle
            cx={activeDrawPoints[0][0]}
            cy={activeDrawPoints[0][1]}
            r={nearClose ? 3 : 2}
            fill={nearClose ? AMBER : 'none'}
            stroke={AMBER_STROKE}
            strokeWidth={0.8}
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
          strokeWidth={0.8}
          strokeDasharray="3 1.5"
          style={{ pointerEvents: 'none' }}
        />
      )}

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
  );
});
