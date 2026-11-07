// laptop web preview only: no snapshotting, the gallery draws strips from their shots instead
import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';

export async function exportStripImage(
  _ref: RefObject<ComponentRef<typeof View> | null>,
  _id: string,
): Promise<string> {
  return '';
}
