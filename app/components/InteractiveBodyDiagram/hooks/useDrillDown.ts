'use client';

import { useState } from 'react';
import type { DrillLevel } from '../types';

export function useDrillDown() {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('body');

  return {
    drillLevel,
    drillInto: (level: DrillLevel) => setDrillLevel(level),
    drillOut: () => setDrillLevel('body'),
  };
}
