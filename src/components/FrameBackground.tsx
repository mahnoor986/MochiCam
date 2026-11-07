// the six strip frame fills, matching the css patterns in design/mochicam.html.
// `k` scales the pattern tiles (1 = the prototype's pixel size).
import { useId, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';

import { CLOUD_P, HEART_P, SPARK_P } from '@/components/shapes';
import type { FrameId } from '@/lib/frames';
import { color } from '@/theme';

export function FrameBackground({ frame, k = 1 }: { frame: FrameId; k?: number }) {
  // unique per instance: chips, the strip and its export copy can all be on screen at once
  const id = `fp${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  let base: ReactNode;
  let tile: ReactNode = null;

  switch (frame) {
    case 'hearts':
      base = <Rect width="100%" height="100%" fill={color.pink} />;
      tile = (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={22 * k} height={22 * k} viewBox="0 0 24 24">
          <Path d={HEART_P} transform="translate(4 4) scale(0.66)" fill={color.white} fillOpacity={0.65} />
        </Pattern>
      );
      break;
    case 'clouds':
      base = (
        <>
          <Defs>
            <LinearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color.lavender} />
              <Stop offset="1" stopColor="#C8F2E0" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}-g)`} />
        </>
      );
      tile = (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={46 * k} height={36 * k} viewBox="0 0 64 50">
          <Path d={CLOUD_P} fill={color.white} fillOpacity={0.85} />
        </Pattern>
      );
      break;
    case 'checker':
      base = <Rect width="100%" height="100%" fill={color.cream} />;
      tile = (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={16 * k} height={16 * k} viewBox="0 0 16 16">
          <Rect x="8" y="0" width="8" height="8" fill={color.pink} />
          <Rect x="0" y="8" width="8" height="8" fill={color.pink} />
        </Pattern>
      );
      break;
    case 'stars':
      base = <Rect width="100%" height="100%" fill={color.butter} />;
      tile = (
        <Pattern id={id} patternUnits="userSpaceOnUse" width={24 * k} height={24 * k} viewBox="0 0 26 26">
          <Path d={SPARK_P} transform="translate(2 2) scale(0.55)" fill={color.white} />
          <Circle cx="20" cy="20" r="2" fill={color.pink} />
        </Pattern>
      );
      break;
    case 'bunny':
      base = <Rect width="100%" height="100%" fill={color.cream} />;
      break;
    case 'plain':
      base = <Rect width="100%" height="100%" fill={color.white} />;
      break;
  }

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      {base}
      {tile && (
        <>
          <Defs>{tile}</Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </>
      )}
    </Svg>
  );
}
