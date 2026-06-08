'use client';

import { useRef, useCallback, useState } from 'react';

type RadiusState = {
  isDragging: boolean;
  center: [number, number] | null;
  currentRadius: number;
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

export function useRadiusMode(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onCommit: (center: [number, number], radius: number) => void
) {
  const [radiusState, setRadiusState] = useState<RadiusState>({
    isDragging: false,
    center: null,
    currentRadius: 0,
  });
  const pointerId = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = getSvgPoint(e, svg);
      pointerId.current = e.pointerId;
      svg.setPointerCapture(e.pointerId);
      setRadiusState({ isDragging: true, center: pt, currentRadius: 0 });
    },
    [svgRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!radiusState.isDragging || !radiusState.center) return;
      if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = getSvgPoint(e, svg);
      const r = Math.hypot(pt[0] - radiusState.center[0], pt[1] - radiusState.center[1]);
      setRadiusState((s) => ({ ...s, currentRadius: r }));
    },
    [svgRef, radiusState]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!radiusState.isDragging || !radiusState.center) return;
      if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = getSvgPoint(e, svg);
      const r = Math.max(
        1,
        Math.hypot(pt[0] - radiusState.center[0], pt[1] - radiusState.center[1])
      );
      onCommit(radiusState.center, r);
      setRadiusState({ isDragging: false, center: null, currentRadius: 0 });
      pointerId.current = null;
    },
    [svgRef, radiusState, onCommit]
  );

  const reset = useCallback(() => {
    setRadiusState({ isDragging: false, center: null, currentRadius: 0 });
    pointerId.current = null;
  }, []);

  return {
    radiusState,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  };
}
