import { bodyFront } from '../data/bodyFront';
import { pointInPolygon } from './pointInPolygon';

function parseSvgPathPoints(d: string): [number, number][] {
  const points: [number, number][] = [];
  const tokens =
    d.match(/[MmLlCcQqAaSsTtHhVvZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g) ?? [];

  let i = 0;
  let cmd = 'M';
  let cx = 0;
  let cy = 0;
  let pathStartX = 0;
  let pathStartY = 0;

  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[MmLlCcQqAaSsTtHhVvZz]$/.test(t)) {
      cmd = t;
      i++;
      continue;
    }

    const abs = cmd === cmd.toUpperCase();

    const num = () => {
      const v = parseFloat(tokens[i++] ?? '0');
      return isNaN(v) ? 0 : v;
    };

    switch (cmd.toUpperCase()) {
      case 'M': {
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        pathStartX = cx;
        pathStartY = cy;
        points.push([cx, cy]);
        cmd = abs ? 'L' : 'l';
        break;
      }
      case 'L': {
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'H': {
        const x = num();
        cx = abs ? x : cx + x;
        points.push([cx, cy]);
        break;
      }
      case 'V': {
        const y = num();
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'C': {
        num(); num(); // x1, y1
        num(); num(); // x2, y2
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'S': {
        num(); num(); // x2, y2
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'Q': {
        num(); num(); // x1, y1
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'T': {
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'A': {
        num(); num(); num(); num(); num(); // rx, ry, rot, large-arc, sweep
        const x = num();
        const y = num();
        cx = abs ? x : cx + x;
        cy = abs ? y : cy + y;
        points.push([cx, cy]);
        break;
      }
      case 'Z': {
        cx = pathStartX;
        cy = pathStartY;
        break;
      }
      default:
        i++;
        break;
    }
  }

  return points;
}

function getZonePolygon(paths: string[]): [number, number][] {
  const all: [number, number][] = [];
  for (const d of paths) {
    all.push(...parseSvgPathPoints(d));
  }
  return all;
}

export function matchLabelFromPoint(point: [number, number]): string {
  for (const zone of bodyFront) {
    const allPaths = [
      ...(zone.path.common ?? []),
      ...(zone.path.left ?? []),
      ...(zone.path.right ?? []),
    ];
    const polygon = getZonePolygon(allPaths);
    if (pointInPolygon(point, polygon)) {
      return zone.slug;
    }
  }
  return '';
}

export function centroidOf(points: [number, number][]): [number, number] {
  if (points.length === 0) return [0, 0];
  const sumX = points.reduce((s, p) => s + p[0], 0);
  const sumY = points.reduce((s, p) => s + p[1], 0);
  return [sumX / points.length, sumY / points.length];
}
