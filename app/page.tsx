'use client';

import { InteractiveBodyDiagram } from './components/InteractiveBodyDiagram';
import type { IBDOutput } from './components/InteractiveBodyDiagram';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <h1 className="text-2xl font-semibold mb-6 text-zinc-900">
        IBD — Interactive Body Diagram
      </h1>
      <InteractiveBodyDiagram
        onChange={(output: IBDOutput) => {
          console.log('IBD output:', output.json);
        }}
        height={600}
      />
    </div>
  );
}
