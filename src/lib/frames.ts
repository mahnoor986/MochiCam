export type FrameId = 'hearts' | 'clouds' | 'bunny' | 'checker' | 'stars' | 'plain';

export const FRAMES: { id: FrameId; name: string }[] = [
  { id: 'hearts', name: 'pink hearts' },
  { id: 'clouds', name: 'clouds' },
  { id: 'bunny', name: 'bunny' },
  { id: 'checker', name: 'checkered' },
  { id: 'stars', name: 'stars' },
  { id: 'plain', name: 'plain white' },
];

export const asFrame = (id: string | null | undefined): FrameId =>
  FRAMES.some((f) => f.id === id) ? (id as FrameId) : 'hearts';

export const frameName = (id: string | null | undefined) => FRAMES.find((f) => f.id === id)?.name ?? 'pink hearts';
