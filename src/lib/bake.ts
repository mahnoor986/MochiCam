// bakes a filter into a captured photo with skia (color matrix + tint), writes a jpeg to
// documentDirectory/mochicam/ and returns its uri. web uses bake.web.ts instead.
import { ImageFormat, Skia, TileMode } from '@shopify/react-native-skia';

import { filterById } from '@/lib/filters';
import { mochiFile } from '@/lib/files';

const MAX_EDGE = 2048;

/** css-style gradient line for `angle` across a w×h box */
function gradientPoints(angle: number, w: number, h: number) {
  const a = (angle * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  return {
    start: { x: w / 2 - dx * half, y: h / 2 - dy * half },
    end: { x: w / 2 + dx * half, y: h / 2 + dy * half },
  };
}

export async function bakePhoto(srcUri: string, filterId: string, id: string): Promise<string> {
  const filter = filterById(filterId);
  const img = Skia.Image.MakeImageFromEncoded(await Skia.Data.fromURI(srcUri));
  if (!img) throw new Error('could not read the photo');

  const k = Math.min(1, MAX_EDGE / Math.max(img.width(), img.height()));
  const w = Math.round(img.width() * k);
  const h = Math.round(img.height() * k);
  const surface = Skia.Surface.Make(w, h);
  if (!surface) throw new Error('could not make a canvas');
  const canvas = surface.getCanvas();

  const paint = Skia.Paint();
  if (filter.matrix) paint.setColorFilter(Skia.ColorFilter.MakeMatrix(filter.matrix));
  canvas.drawImageRect(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(0, 0, w, h), paint);

  if (filter.tint) {
    const tint = Skia.Paint();
    if (typeof filter.tint === 'string') {
      tint.setColor(Skia.Color(filter.tint));
    } else {
      const { start, end } = gradientPoints(filter.tint.angle, w, h);
      tint.setShader(
        Skia.Shader.MakeLinearGradient(start, end, filter.tint.colors.map((c) => Skia.Color(c)), null, TileMode.Clamp),
      );
    }
    canvas.drawRect(Skia.XYWHRect(0, 0, w, h), tint);
  }

  surface.flush();
  const bytes = surface.makeImageSnapshot().encodeToBytes(ImageFormat.JPEG, 92);
  const out = mochiFile(`${id}.jpg`);
  out.write(bytes);
  return out.uri;
}
