export function captureSnapshot(svgEl: SVGSVGElement | null): string {
  if (!svgEl) return '';
  try {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgEl);
  } catch {
    return '';
  }
}
