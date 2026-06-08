import type { DrillLevel } from '../types';

// ─── Per-region zone rendering config ────────────────────────────────────────
// Each entry describes one *selectable* zone inside a drill-down view.
// renderSides: which path groups from bodyFront to include in the clickable shape.
// selectionId: the zoneId written into ZoneSelection output.

export type RegionZone = {
  bodyFrontSlug: string;
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
      { bodyFrontSlug: 'neck',      renderSides: ['common', 'left', 'right'], selectionId: 'neck' },
      { bodyFrontSlug: 'trapezius', renderSides: ['left'],                    selectionId: 'trapezius_left' },
      { bodyFrontSlug: 'trapezius', renderSides: ['right'],                   selectionId: 'trapezius_right' },
      { bodyFrontSlug: 'chest',     renderSides: ['left'],                    selectionId: 'chest_left' },
      { bodyFrontSlug: 'chest',     renderSides: ['right'],                   selectionId: 'chest_right' },
    ],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    viewBox: '242 414 252 316',
    zones: [
      { bodyFrontSlug: 'abs',      renderSides: ['left'],  selectionId: 'abs_left' },
      { bodyFrontSlug: 'abs',      renderSides: ['right'], selectionId: 'abs_right' },
      { bodyFrontSlug: 'obliques', renderSides: ['left'],  selectionId: 'obliques_left' },
      { bodyFrontSlug: 'obliques', renderSides: ['right'], selectionId: 'obliques_right' },
    ],
  },
  {
    id: 'left_arm',
    label: 'Left Arm',
    viewBox: '100 285 200 425',
    zones: [
      { bodyFrontSlug: 'deltoids', renderSides: ['left'], selectionId: 'deltoids_left' },
      { bodyFrontSlug: 'biceps',   renderSides: ['left'], selectionId: 'biceps_left' },
      { bodyFrontSlug: 'triceps',  renderSides: ['left'], selectionId: 'triceps_left' },
      { bodyFrontSlug: 'forearm',  renderSides: ['left'], selectionId: 'forearm_left' },
    ],
  },
  {
    id: 'right_arm',
    label: 'Right Arm',
    viewBox: '428 285 200 425',
    zones: [
      { bodyFrontSlug: 'deltoids', renderSides: ['right'], selectionId: 'deltoids_right' },
      { bodyFrontSlug: 'biceps',   renderSides: ['right'], selectionId: 'biceps_right' },
      { bodyFrontSlug: 'triceps',  renderSides: ['right'], selectionId: 'triceps_right' },
      { bodyFrontSlug: 'forearm',  renderSides: ['right'], selectionId: 'forearm_right' },
    ],
  },
  {
    id: 'left_hand',
    label: 'Left Hand',
    viewBox: '35 685 138 148',
    zones: [
      { bodyFrontSlug: 'hands', renderSides: ['left'], selectionId: 'hands_left' },
    ],
  },
  {
    id: 'right_hand',
    label: 'Right Hand',
    viewBox: '560 685 138 148',
    zones: [
      { bodyFrontSlug: 'hands', renderSides: ['right'], selectionId: 'hands_right' },
    ],
  },
  {
    id: 'lower_body',
    label: 'Lower Body',
    viewBox: '228 628 280 450',
    zones: [
      { bodyFrontSlug: 'adductors',  renderSides: ['left'],  selectionId: 'adductors_left' },
      { bodyFrontSlug: 'adductors',  renderSides: ['right'], selectionId: 'adductors_right' },
      { bodyFrontSlug: 'quadriceps', renderSides: ['left'],  selectionId: 'quadriceps_left' },
      { bodyFrontSlug: 'quadriceps', renderSides: ['right'], selectionId: 'quadriceps_right' },
      { bodyFrontSlug: 'knees',      renderSides: ['left'],  selectionId: 'knees_left' },
      { bodyFrontSlug: 'knees',      renderSides: ['right'], selectionId: 'knees_right' },
    ],
  },
  {
    id: 'left_leg',
    label: 'Left Leg',
    viewBox: '225 958 120 355',
    zones: [
      { bodyFrontSlug: 'tibialis', renderSides: ['left'], selectionId: 'tibialis_left' },
      { bodyFrontSlug: 'calves',   renderSides: ['left'], selectionId: 'calves_left' },
      { bodyFrontSlug: 'ankles',   renderSides: ['left'], selectionId: 'ankles_left' },
    ],
  },
  {
    id: 'right_leg',
    label: 'Right Leg',
    viewBox: '385 958 120 355',
    zones: [
      { bodyFrontSlug: 'tibialis', renderSides: ['right'], selectionId: 'tibialis_right' },
      { bodyFrontSlug: 'calves',   renderSides: ['right'], selectionId: 'calves_right' },
      { bodyFrontSlug: 'ankles',   renderSides: ['right'], selectionId: 'ankles_right' },
    ],
  },
  {
    id: 'feet',
    label: 'Feet',
    viewBox: '222 1268 295 100',
    zones: [
      { bodyFrontSlug: 'feet', renderSides: ['left'],  selectionId: 'feet_left' },
      { bodyFrontSlug: 'feet', renderSides: ['right'], selectionId: 'feet_right' },
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
