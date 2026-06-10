'use client';

import React, { useState } from 'react';
import { skeletonFront } from '../data/skeletonFront';
import type { Mode } from '../types';

// Maps skeleton coordinate space (viewBox 0 0 435.687 841.89) into the body
// diagram coordinate space (viewBox 40 100 660 1280).
const SKELETON_TRANSFORM = 'translate(50, 99) scale(1.546)';

// Explicit paint order: higher number = rendered later = on top.
// Bones not listed render at their natural array index (offset by 100).
const PAINT_ORDER: Record<string, number> = {
  scapula: 1,           // behind ribs
  ribs: 2,              // in front of scapula
  cervical_vertebrae: 3, // behind skull
  skull: 4,             // in front of cervical vertebrae
};

function paintIndex(id: string, arrayIndex: number): number {
  return PAINT_ORDER[id] ?? arrayIndex + 100;
}

const BONE = '#c8a96e';
const BONE_SELECTED = '#2AB5A3';
const BONE_HOVER = '#a8d5cf';

type Props = {
  mode: Mode;
  selectedZones: string[];
  onBoneClick: (boneId: string, label: string) => void;
  readOnly: boolean;
};

export function SkeletonOverlay({ mode, selectedZones, onBoneClick, readOnly }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canInteract = !readOnly && mode === 'zone';

  function getFill(id: string) {
    if (selectedZones.includes(id)) return `${BONE_SELECTED}cc`;
    if (hoveredId === id && canInteract) return `${BONE_HOVER}cc`;
    return `${BONE}cc`;
  }

  function getStroke(id: string) {
    if (selectedZones.includes(id)) return { color: BONE_SELECTED, width: 0.8 };
    if (hoveredId === id && canInteract) return { color: '#229e8e', width: 0.5 };
    return { color: '#8b6914', width: 0.3 };
  }

  return (
    <g transform={SKELETON_TRANSFORM}>
      {[...skeletonFront]
        .map((bone, i) => ({ bone, order: paintIndex(bone.id, i) }))
        .sort((a, b) => a.order - b.order)
        .map(({ bone }) => {
        const fill = getFill(bone.id);
        const stroke = getStroke(bone.id);
        return (
          <g
            key={bone.id}
            style={{
              cursor: canInteract ? 'pointer' : 'default',
              pointerEvents: canInteract ? 'auto' : 'none',
            }}
            onPointerEnter={() => canInteract && setHoveredId(bone.id)}
            onPointerLeave={() => setHoveredId(null)}
            onClick={() => canInteract && onBoneClick(bone.id, bone.label)}
          >
            {bone.paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={fill}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                style={{ transition: 'fill 0.12s ease' }}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}
