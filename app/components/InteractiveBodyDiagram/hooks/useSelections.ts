'use client';

import { useReducer } from 'react';
import type { SelectionItem, IBDOutput, ZoneSelection, FreehandSelection, RadiusSelection } from '../types';

type State = {
  selections: SelectionItem[];
  past: SelectionItem[][];
};

type Action =
  | { type: 'TOGGLE_ZONE'; payload: ZoneSelection }
  | { type: 'ADD_FREEHAND'; payload: FreehandSelection }
  | { type: 'ADD_RADIUS'; payload: RadiusSelection }
  | { type: 'REMOVE'; index: number }
  | { type: 'UPDATE_LABEL'; index: number; label: string }
  | { type: 'UNDO' }
  | { type: 'CLEAR' }
  | { type: 'RESTORE'; payload: IBDOutput };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_ZONE': {
      const existingIdx = state.selections.findIndex(
        (s) => s.type === 'zone' && s.zoneId === action.payload.zoneId
      );
      const next =
        existingIdx >= 0
          ? state.selections.filter((_, i) => i !== existingIdx)
          : [...state.selections, action.payload];
      return { selections: next, past: [...state.past, state.selections] };
    }
    case 'ADD_FREEHAND':
    case 'ADD_RADIUS': {
      return {
        selections: [...state.selections, action.payload],
        past: [...state.past, state.selections],
      };
    }
    case 'REMOVE': {
      return {
        selections: state.selections.filter((_, i) => i !== action.index),
        past: [...state.past, state.selections],
      };
    }
    case 'UPDATE_LABEL': {
      const updated = state.selections.map((s, i) =>
        i === action.index ? { ...s, label: action.label } : s
      );
      return { selections: updated, past: state.past };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return { selections: prev, past: state.past.slice(0, -1) };
    }
    case 'CLEAR': {
      if (state.selections.length === 0) return state;
      return { selections: [], past: [...state.past, state.selections] };
    }
    case 'RESTORE': {
      return { selections: action.payload.selections, past: [] };
    }
    default:
      return state;
  }
}

export function useSelections(initialValue?: IBDOutput) {
  const [state, dispatch] = useReducer(reducer, {
    selections: initialValue?.selections ?? [],
    past: [],
  });

  return { selections: state.selections, dispatch };
}
