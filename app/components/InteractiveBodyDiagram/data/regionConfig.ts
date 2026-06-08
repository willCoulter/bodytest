import type { DrillLevel } from '../types';

// ─── Per-region zone rendering config ────────────────────────────────────────
// Each entry describes one *selectable* zone inside a drill-down view.
// renderSides: which path groups from bodyFront to include in the clickable shape.
// selectionId: the zoneId written into ZoneSelection output.

export type RegionZone = {
  slug: string;
  renderSides: ('left' | 'right' | 'common')[];
  selectionId: string;
};

export type RegionConfig = {
  id: DrillLevel;
  label: string;
  // Tight crop of the body-diagram coordinate space
  viewBox: string;
  zones: RegionZone[];
};

export const REGION_CONFIGS: RegionConfig[] = [
  {
    id: 'upper_body',
    label: 'Upper Body',
    viewBox: '235 232 258 220',
    zones: [
      { slug: 'neck',      renderSides: ['common', 'left', 'right'], selectionId: 'neck' },
      { slug: 'trapezius', renderSides: ['left'],                    selectionId: 'trapezius_left' },
      { slug: 'trapezius', renderSides: ['right'],                   selectionId: 'trapezius_right' },
      { slug: 'chest',     renderSides: ['left'],                    selectionId: 'chest_left' },
      { slug: 'chest',     renderSides: ['right'],                   selectionId: 'chest_right' },
    ],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    viewBox: '242 414 252 316',
    zones: [
      { slug: 'abs',      renderSides: ['left'],  selectionId: 'abs_left' },
      { slug: 'abs',      renderSides: ['right'], selectionId: 'abs_right' },
      { slug: 'obliques', renderSides: ['left'],  selectionId: 'obliques_left' },
      { slug: 'obliques', renderSides: ['right'], selectionId: 'obliques_right' },
    ],
  },
  {
    id: 'left_arm',
    label: 'Left Arm',
    viewBox: '100 285 200 425',
    zones: [
      { slug: 'deltoids', renderSides: ['left'], selectionId: 'deltoids_left' },
      { slug: 'biceps',   renderSides: ['left'], selectionId: 'biceps_left' },
      { slug: 'triceps',  renderSides: ['left'], selectionId: 'triceps_left' },
      { slug: 'forearm',  renderSides: ['left'], selectionId: 'forearm_left' },
    ],
  },
  {
    id: 'right_arm',
    label: 'Right Arm',
    viewBox: '428 285 200 425',
    zones: [
      { slug: 'deltoids', renderSides: ['right'], selectionId: 'deltoids_right' },
      { slug: 'biceps',   renderSides: ['right'], selectionId: 'biceps_right' },
      { slug: 'triceps',  renderSides: ['right'], selectionId: 'triceps_right' },
      { slug: 'forearm',  renderSides: ['right'], selectionId: 'forearm_right' },
    ],
  },
  {
    id: 'left_hand',
    label: 'Left Hand',
    viewBox: '35 685 138 148',
    zones: [
      { slug: 'hands', renderSides: ['left'], selectionId: 'hands_left' },
    ],
  },
  {
    id: 'right_hand',
    label: 'Right Hand',
    viewBox: '560 685 138 148',
    zones: [
      { slug: 'hands', renderSides: ['right'], selectionId: 'hands_right' },
    ],
  },
  {
    id: 'lower_body',
    label: 'Lower Body',
    viewBox: '228 628 280 450',
    zones: [
      { slug: 'adductors',  renderSides: ['left'],  selectionId: 'adductors_left' },
      { slug: 'adductors',  renderSides: ['right'], selectionId: 'adductors_right' },
      { slug: 'quadriceps', renderSides: ['left'],  selectionId: 'quadriceps_left' },
      { slug: 'quadriceps', renderSides: ['right'], selectionId: 'quadriceps_right' },
      { slug: 'knees',      renderSides: ['left'],  selectionId: 'knees_left' },
      { slug: 'knees',      renderSides: ['right'], selectionId: 'knees_right' },
    ],
  },
  {
    id: 'left_leg',
    label: 'Left Leg',
    viewBox: '225 958 120 355',
    zones: [
      { slug: 'tibialis', renderSides: ['left'], selectionId: 'tibialis_left' },
      { slug: 'calves',   renderSides: ['left'], selectionId: 'calves_left' },
      { slug: 'ankles',   renderSides: ['left'], selectionId: 'ankles_left' },
    ],
  },
  {
    id: 'right_leg',
    label: 'Right Leg',
    viewBox: '385 958 120 355',
    zones: [
      { slug: 'tibialis', renderSides: ['right'], selectionId: 'tibialis_right' },
      { slug: 'calves',   renderSides: ['right'], selectionId: 'calves_right' },
      { slug: 'ankles',   renderSides: ['right'], selectionId: 'ankles_right' },
    ],
  },
  {
    id: 'feet',
    label: 'Feet',
    viewBox: '222 1268 295 100',
    zones: [
      { slug: 'feet', renderSides: ['left'],  selectionId: 'feet_left' },
      { slug: 'feet', renderSides: ['right'], selectionId: 'feet_right' },
    ],
  },
];

// ─── Body-view routing: which region does each zone click navigate to? ───────
// side=null means "any side goes to the same region"
type SideMap = { left?: DrillLevel; right?: DrillLevel; any?: DrillLevel };

const ZONE_REGION_MAP: Record<string, SideMap> = {
  head:      { any: 'head' },
  hair:      { any: 'head' },
  neck:      { any: 'upper_body' },
  trapezius: { any: 'upper_body' },
  chest:     { any: 'upper_body' },
  abs:       { any: 'abdomen' },
  obliques:  { any: 'abdomen' },
  deltoids:  { left: 'left_arm',  right: 'right_arm' },
  biceps:    { left: 'left_arm',  right: 'right_arm' },
  triceps:   { left: 'left_arm',  right: 'right_arm' },
  forearm:   { left: 'left_arm',  right: 'right_arm' },
  hands:     { left: 'left_hand', right: 'right_hand' },
  adductors: { any: 'lower_body' },
  quadriceps:{ any: 'lower_body' },
  knees:     { any: 'lower_body' },
  tibialis:  { left: 'left_leg',  right: 'right_leg' },
  calves:    { left: 'left_leg',  right: 'right_leg' },
  ankles:    { left: 'left_leg',  right: 'right_leg' },
  feet:      { any: 'feet' },
};

export function getRegionForZone(
  slug: string,
  side: 'left' | 'right' | 'common'
): DrillLevel | null {
  const entry = ZONE_REGION_MAP[slug];
  if (!entry) return null;
  if (entry.any) return entry.any;
  if (side === 'left' && entry.left) return entry.left;
  if (side === 'right' && entry.right) return entry.right;
  // fall back: if common path and the zone has an 'any' equivalent, use it
  return entry.left ?? entry.right ?? null;
}
