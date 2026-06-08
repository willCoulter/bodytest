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
};

export type RadiusSelection = {
  type: 'radius';
  label: string;
  center: [number, number];
  radius: number;
};

export type SelectionItem = ZoneSelection | FreehandSelection | RadiusSelection;

export type IBDOutput = {
  selections: SelectionItem[];
  svgSnapshot: string;
  json: string;
};

export type Mode = 'zone' | 'draw' | 'radius';
export type DrillLevel =
  | 'body'
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
