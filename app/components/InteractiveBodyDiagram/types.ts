export type DrillLevel =
  | 'body'
  | 'back'
  | 'back_upper'
  | 'back_lower'
  | 'back_left_hamstring'
  | 'back_right_hamstring'
  | 'head'
  | 'upper_body'
  | 'abdomen'
  | 'left_arm'
  | 'right_arm'
  | 'left_hand'
  | 'right_hand'
  | 'lower_body'
  | 'left_leg'
  | 'right_leg'
  | 'feet';

export type ZoneSelection = {
  type: 'zone';
  zoneId: string;
  label: string;
  side?: 'left' | 'right' | 'bilateral';
};

export type FreehandSelection = {
  type: 'freehand';
  label: string;
  points: [number, number][];
  drillLevel: DrillLevel;
};

export type RadiusSelection = {
  type: 'radius';
  label: string;
  center: [number, number];
  radius: number;
  drillLevel: DrillLevel;
};

export type SelectionItem = ZoneSelection | FreehandSelection | RadiusSelection;

export type IBDOutput = {
  selections: SelectionItem[];
  svgSnapshot: string;
  json: string;
};

export type Mode = 'zone' | 'draw' | 'radius';

export type Layer = 'surface' | 'skeleton';
