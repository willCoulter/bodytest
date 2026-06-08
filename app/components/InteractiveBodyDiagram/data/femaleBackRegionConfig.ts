import type { DrillLevel } from '../types';
import type { RegionZone } from './regionConfig';

export type FemaleBackRegionConfig = {
  id: DrillLevel;
  label: string;
  viewBox: string;
  zones: RegionZone[];
};

export const FEMALE_BACK_REGION_CONFIGS: FemaleBackRegionConfig[] = [
  {
    id: 'back_upper',
    label: 'Upper Back',
    viewBox: '930 215 420 390',
    zones: [
      { slug: 'neck',       renderSides: ['left'],  selectionId: 'neck_left' },
      { slug: 'neck',       renderSides: ['right'], selectionId: 'neck_right' },
      { slug: 'trapezius',  renderSides: ['left'],  selectionId: 'trapezius_left' },
      { slug: 'trapezius',  renderSides: ['right'], selectionId: 'trapezius_right' },
      { slug: 'deltoids',   renderSides: ['left'],  selectionId: 'deltoids_left' },
      { slug: 'deltoids',   renderSides: ['right'], selectionId: 'deltoids_right' },
      { slug: 'upper_back', renderSides: ['left'],  selectionId: 'upper_back_left' },
      { slug: 'upper_back', renderSides: ['right'], selectionId: 'upper_back_right' },
      { slug: 'triceps',    renderSides: ['left'],  selectionId: 'triceps_left' },
      { slug: 'triceps',    renderSides: ['right'], selectionId: 'triceps_right' },
    ],
  },
  {
    id: 'back_lower',
    label: 'Lower Back & Glutes',
    viewBox: '975 470 320 360',
    zones: [
      { slug: 'lower_back', renderSides: ['left'],  selectionId: 'lower_back_left' },
      { slug: 'lower_back', renderSides: ['right'], selectionId: 'lower_back_right' },
      { slug: 'gluteal',    renderSides: ['left'],  selectionId: 'gluteal_left' },
      { slug: 'gluteal',    renderSides: ['right'], selectionId: 'gluteal_right' },
    ],
  },
  {
    id: 'back_left_hamstring',
    label: 'Left Hamstring',
    viewBox: '975 735 200 295',
    zones: [
      { slug: 'adductors', renderSides: ['left'], selectionId: 'adductors_left' },
      { slug: 'hamstring', renderSides: ['left'], selectionId: 'hamstring_left' },
    ],
  },
  {
    id: 'back_right_hamstring',
    label: 'Right Hamstring',
    viewBox: '1110 735 210 295',
    zones: [
      { slug: 'adductors', renderSides: ['right'], selectionId: 'adductors_right' },
      { slug: 'hamstring', renderSides: ['right'], selectionId: 'hamstring_right' },
    ],
  },
];

export function getFemaleBackRegionForZone(
  slug: string,
  side: 'left' | 'right' | 'common'
): DrillLevel | null {
  const map: Record<string, { left?: DrillLevel; right?: DrillLevel; any?: DrillLevel }> = {
    neck:       { any: 'back_upper' },
    trapezius:  { any: 'back_upper' },
    deltoids:   { any: 'back_upper' },
    upper_back: { any: 'back_upper' },
    triceps:    { any: 'back_upper' },
    lower_back: { any: 'back_lower' },
    gluteal:    { any: 'back_lower' },
    hamstring:  { left: 'back_left_hamstring', right: 'back_right_hamstring' },
    adductors:  { left: 'back_left_hamstring', right: 'back_right_hamstring' },
  };
  const entry = map[slug];
  if (!entry) return null;
  if (entry.any) return entry.any;
  if (side === 'left' && entry.left) return entry.left;
  if (side === 'right' && entry.right) return entry.right;
  return entry.left ?? entry.right ?? null;
}
