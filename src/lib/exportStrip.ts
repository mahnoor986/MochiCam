// snapshots the (offscreen, full-size) strip view into a jpeg in documentDirectory/mochicam/
import { File } from 'expo-file-system';
import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { mochiFile } from '@/lib/files';

export async function exportStripImage(ref: RefObject<ComponentRef<typeof View> | null>, id: string): Promise<string> {
  const tmp = await captureRef(ref, { format: 'jpg', quality: 0.95, result: 'tmpfile' });
  // a fresh name each time, so <Image> never shows a cached older version
  const out = mochiFile(`${id}-${Date.now().toString(36)}.jpg`);
  await new File(tmp).move(out);
  return out.uri;
}
