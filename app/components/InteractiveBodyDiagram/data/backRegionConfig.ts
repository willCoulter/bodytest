import type { DrillLevel } from '../types';
import type { RegionZone } from './regionConfig';

export type BackRegionConfig = {
  id: DrillLevel;
  label: string;
  viewBox: string;
  zones: RegionZone[];
};

export const BACK_REGION_CONFIGS: BackRegionConfig[] = [
  {
    id: 'back_upper',
    label: 'Upper Back',
    // neck–trapezius–deltoids–upper_back–triceps, all in back coordinate space
    viewBox: '880 215 400 380',
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
    viewBox: '960 475 240 315',
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
    viewBox: '945 735 140 265',
    zones: [
      { slug: 'adductors', renderSides: ['left'], selectionId: 'adductors_left' },
      { slug: 'hamstring', renderSides: ['left'], selectionId: 'hamstring_left' },
    ],
  },
  {
    id: 'back_right_hamstring',
    label: 'Right Hamstring',
    viewBox: '1095 735 130 265',
    zones: [
      { slug: 'adductors', renderSides: ['right'], selectionId: 'adductors_right' },
      { slug: 'hamstring', renderSides: ['right'], selectionId: 'hamstring_right' },
    ],
  },
];

// ─── Back-body routing: which region does each back zone click navigate to? ──

type SideMap = { left?: DrillLevel; right?: DrillLevel; any?: DrillLevel };

const BACK_ZONE_REGION_MAP: Record<string, SideMap> = {
  neck:       { any: 'back_upper' },
  trapezius:  { any: 'back_upper' },
  deltoids:   { any: 'back_upper' },
  upper_back: { any: 'back_upper' },
  triceps:    { any: 'back_upper' },
  lower_back: { any: 'back_lower' },
  gluteal:    { any: 'back_lower' },
  hamstring:  { left: 'back_left_hamstring', right: 'back_right_hamstring' },
  adductors:  { left: 'back_left_hamstring', right: 'back_right_hamstring' },
  // calves, ankles, feet, forearm, hands, head, hair → no drill-down (direct select)
};

export function getBackRegionForZone(
  slug: string,
  side: 'left' | 'right' | 'common'
): DrillLevel | null {
  const entry = BACK_ZONE_REGION_MAP[slug];
  if (!entry) return null;
  if (entry.any) return entry.any;
  if (side === 'left' && entry.left) return entry.left;
  if (side === 'right' && entry.right) return entry.right;
  return entry.left ?? entry.right ?? null;
}
