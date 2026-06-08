'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import styles from './IBD.module.css';
import { BodyDiagram } from './diagrams/BodyDiagram';
import { HeadDiagram } from './diagrams/HeadDiagram';
import { RegionDiagram } from './diagrams/RegionDiagram';
import { useSelections } from './hooks/useSelections';
import { useDrillDown } from './hooks/useDrillDown';
import { useDrawMode } from './hooks/useDrawMode';
import { useRadiusMode } from './hooks/useRadiusMode';
import { captureSnapshot } from './utils/svgSnapshot';
import { matchLabelFromPoint, centroidOf } from './utils/labelMatcher';
import { zoneLabels } from './data/zoneLabels';
import { REGION_CONFIGS, getRegionForZone } from './data/regionConfig';
import type { IBDOutput, Mode, ZoneSelection, FreehandSelection, RadiusSelection } from './types';

// ─── Icon components ────────────────────────────────────────────────────────

function IconCursor() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l14 9-7 1-4 7z" />
    </svg>
  );
}
function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  );
}
function IconCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function IconUndo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function selectionColor(type: string) {
  if (type === 'zone') return '#2AB5A3';
  if (type === 'freehand') return '#F59E0B';
  return '#818CF8';
}

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  onChange: (output: IBDOutput) => void;
  initialValue?: IBDOutput;
  readOnly?: boolean;
  height?: number;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function IBD({ onChange, initialValue, readOnly = false, height = 600 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { drillLevel, drillInto, drillOut } = useDrillDown();
  const { selections, dispatch } = useSelections(initialValue);

  const [mode, setMode] = React.useState<Mode>('zone');

  const drawModeData = useDrawMode(
    svgRef,
    useCallback(
      (points: [number, number][]) => {
        const centroid = centroidOf(points);
        const matchedSlug = matchLabelFromPoint(centroid);
        const label = matchedSlug ? zoneLabels[matchedSlug] ?? matchedSlug : 'Custom area';
        const sel: FreehandSelection = { type: 'freehand', label, points, drillLevel };
        dispatch({ type: 'ADD_FREEHAND', payload: sel });
      },
      [dispatch, drillLevel]
    )
  );

  const radiusModeData = useRadiusMode(
    svgRef,
    useCallback(
      (center: [number, number], radius: number) => {
        const matchedSlug = matchLabelFromPoint(center);
        const label = matchedSlug ? zoneLabels[matchedSlug] ?? matchedSlug : 'Custom area';
        const sel: RadiusSelection = { type: 'radius', label, center, radius, drillLevel };
        dispatch({ type: 'ADD_RADIUS', payload: sel });
      },
      [dispatch, drillLevel]
    )
  );

  const handleSetMode = (m: Mode) => {
    drawModeData.reset();
    radiusModeData.reset();
    setMode(m);
  };

  // Body-view click: navigate into the appropriate region
  const handleBodyZoneClick = useCallback(
    (slug: string, side: 'left' | 'right' | 'common') => {
      const region = getRegionForZone(slug, side);
      if (region) drillInto(region);
    },
    [drillInto]
  );

  // Drill-down zone click: toggle zone selection directly
  const handleRegionZoneClick = useCallback(
    (selectionId: string) => {
      const label = zoneLabels[selectionId] ?? selectionId;
      const sel: ZoneSelection = { type: 'zone', zoneId: selectionId, label };
      dispatch({ type: 'TOGGLE_ZONE', payload: sel });
    },
    [dispatch]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (mode === 'draw') drawModeData.onPointerDown(e);
      else if (mode === 'radius') radiusModeData.onPointerDown(e);
    },
    [mode, drawModeData, radiusModeData]
  );
  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (mode === 'draw') drawModeData.onPointerMove(e);
      else if (mode === 'radius') radiusModeData.onPointerMove(e);
    },
    [mode, drawModeData, radiusModeData]
  );
  const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (mode === 'draw') drawModeData.onPointerUp(e);
      else if (mode === 'radius') radiusModeData.onPointerUp(e);
    },
    [mode, drawModeData, radiusModeData]
  );

  useEffect(() => {
    const snapshot = captureSnapshot(svgRef.current);
    onChange({ selections, svgSnapshot: snapshot, json: JSON.stringify(selections) });
  }, [selections]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedZoneIds = selections
    .filter((s): s is ZoneSelection => s.type === 'zone')
    .map((s) => s.zoneId);

  const freehandSels = selections.filter(
    (s): s is FreehandSelection => s.type === 'freehand' && s.drillLevel === drillLevel
  );
  const radiusSels = selections.filter(
    (s): s is RadiusSelection => s.type === 'radius' && s.drillLevel === drillLevel
  );

  const activeDrawPoints = drawModeData.drawState.points;
  const activeRadius =
    radiusModeData.radiusState.isDragging && radiusModeData.radiusState.center
      ? { center: radiusModeData.radiusState.center, radius: radiusModeData.radiusState.currentRadius }
      : null;

  const sharedDiagramProps = {
    mode,
    selectedZones: selectedZoneIds,
    freehandSelections: freehandSels,
    radiusSelections: radiusSels,
    activeDrawPoints,
    activeRadius,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    height,
    readOnly,
  };

  // Resolve current region config (null for body and head)
  const currentRegionConfig =
    drillLevel !== 'body' && drillLevel !== 'head'
      ? REGION_CONFIGS.find((c) => c.id === drillLevel) ?? null
      : null;

  // Breadcrumb label
  const drillLabel =
    drillLevel === 'head'
      ? 'Head'
      : currentRegionConfig?.label ?? null;

  return (
    <div className={styles.wrapper}>
      {/* ─── Diagram column ─── */}
      <div className={styles.diagramColumn}>
        {/* Breadcrumb */}
        {drillLevel !== 'body' && (
          <div className={styles.breadcrumb}>
            <button className={styles.breadcrumbLink} onClick={drillOut}>
              Body
            </button>
            <span className={styles.breadcrumbSep}>›</span>
            <span>{drillLabel}</span>
          </div>
        )}

        {/* Mode toolbar */}
        {!readOnly && (
          <div className={styles.toolbar}>
            <button
              className={`${styles.toolBtn} ${mode === 'zone' ? styles.toolBtnActive : ''}`}
              title="Zone Select"
              onClick={() => handleSetMode('zone')}
            >
              <IconCursor />
            </button>
            <button
              className={`${styles.toolBtn} ${mode === 'draw' ? styles.toolBtnActive : ''}`}
              title="Freehand Draw"
              onClick={() => handleSetMode('draw')}
            >
              <IconPencil />
            </button>
            <button
              className={`${styles.toolBtn} ${mode === 'radius' ? styles.toolBtnActive : ''}`}
              title="Radius Select"
              onClick={() => handleSetMode('radius')}
            >
              <IconCircle />
            </button>
            <div className={styles.toolDivider} />
            <button
              className={styles.toolBtn}
              title="Undo"
              onClick={() => dispatch({ type: 'UNDO' })}
            >
              <IconUndo />
            </button>
            <button
              className={`${styles.toolBtn} ${styles.toolBtnDanger}`}
              title="Clear All"
              onClick={() => dispatch({ type: 'CLEAR' })}
            >
              <IconTrash />
            </button>
          </div>
        )}

        {/* Diagrams */}
        {drillLevel === 'body' && (
          <BodyDiagram
            ref={svgRef}
            {...sharedDiagramProps}
            onZoneClick={handleBodyZoneClick}
          />
        )}
        {drillLevel === 'head' && (
          <HeadDiagram
            ref={svgRef}
            {...sharedDiagramProps}
            onZoneClick={handleRegionZoneClick}
          />
        )}
        {currentRegionConfig && (
          <RegionDiagram
            ref={svgRef}
            {...sharedDiagramProps}
            viewBox={currentRegionConfig.viewBox}
            zones={currentRegionConfig.zones}
            onZoneClick={handleRegionZoneClick}
          />
        )}
      </div>

      {/* ─── Summary panel ─── */}
      <div className={styles.summaryPanel}>
        <div className={styles.summaryHeader}>Selections</div>
        {selections.length === 0 ? (
          <div className={styles.summaryEmpty}>No areas selected</div>
        ) : (
          selections.map((sel, i) => (
            <div className={styles.summaryItem} key={i}>
              <span
                className={styles.swatch}
                style={{ background: selectionColor(sel.type) }}
              />
              <input
                className={styles.summaryLabelInput}
                value={sel.label}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_LABEL', index: i, label: e.target.value })
                }
                readOnly={readOnly}
                aria-label="Selection label"
              />
              {!readOnly && (
                <button
                  className={styles.removeBtn}
                  title="Remove"
                  onClick={() => dispatch({ type: 'REMOVE', index: i })}
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
