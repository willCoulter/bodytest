'use client';

import { useRef, useCallback, useState } from 'react';

const CLOSE_THRESHOLD = 12;
const MIN_POINTS = 3;

type DrawState = {
  isDrawing: boolean;
  points: [number, number][];
};

function getSvgPoint(
  e: React.PointerEvent<SVGSVGElement>,
  svg: SVGSVGElement
): [number, number] {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return [e.clientX, e.clientY];
  const svgP = pt.matrixTransform(ctm.inverse());
  return [svgP.x, svgP.y];
}

export function useDrawMode(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onCommit: (points: [number, number][]) => void
) {
  const [drawState, setDrawState] = useState<DrawState>({ isDrawing: false, points: [] });
  const lastTapRef = useRef<number>(0);
  const pointerId = useRef<number | null>(null);

  const closePath = useCallback(
    (points: [number, number][]) => {
      if (points.length >= MIN_POINTS) {
        onCommit(points);
      }
      setDrawState({ isDrawing: false, points: [] });
      pointerId.current = null;
    },
    [onCommit]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      // Double-tap/double-click to close
      const now = Date.now();
      if (now - lastTapRef.current < 300 && drawState.isDrawing) {
        lastTapRef.current = 0;
        closePath(drawState.points);
        return;
      }
      lastTapRef.current = now;

      const pt = getSvgPoint(e, svg);

      if (!drawState.isDrawing) {
        pointerId.current = e.pointerId;
        svg.setPointerCapture(e.pointerId);
        setDrawState({ isDrawing: true, points: [pt] });
      } else {
        // Check close proximity
        const start = drawState.points[0];
        if (
          drawState.points.length >= MIN_POINTS &&
          Math.hypot(start[0] - pt[0], start[1] - pt[1]) < CLOSE_THRESHOLD
        ) {
          closePath(drawState.points);
        } else {
          setDrawState((s) => ({ ...s, points: [...s.points, pt] }));
        }
      }
    },
    [svgRef, drawState, closePath]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawState.isDrawing) return;
      if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = getSvgPoint(e, svg);
      setDrawState((s) => ({ ...s, points: [...s.points, pt] }));
    },
    [svgRef, drawState.isDrawing]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawState.isDrawing) return;
      if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = getSvgPoint(e, svg);

      // Auto-close check on pointer-up
      const start = drawState.points[0];
      if (
        drawState.points.length >= MIN_POINTS &&
        Math.hypot(start[0] - pt[0], start[1] - pt[1]) < CLOSE_THRESHOLD
      ) {
        closePath(drawState.points);
      }
      // Otherwise continue — user is still drawing (pointer move adds points)
    },
    [svgRef, drawState, closePath]
  );

  const reset = useCallback(() => {
    setDrawState({ isDrawing: false, points: [] });
    pointerId.current = null;
  }, []);

  return {
    drawState,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  };
}
