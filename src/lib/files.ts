// app-private photo storage (documentDirectory/mochicam/) and the device "MochiCam" album
import { Directory, File, Paths } from 'expo-file-system';
import { Album, Asset } from 'expo-media-library';

const ALBUM = 'MochiCam';

export function mochiFile(name: string) {
  const dir = new Directory(Paths.document, 'mochicam');
  if (!dir.exists) dir.create({ intermediates: true });
  return new File(dir, name);
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** best effort: deletes a file we no longer need (camera temp shots etc.) */
export function removeFile(uri: string) {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // already gone
  }
}

/**
 * copies a photo into the device "MochiCam" album. returns the asset id, or null when the
 * library isn't available (web preview, permission revoked, expo go limits) — the in-app copy still exists.
 */
export async function saveToAlbum(fileUri: string): Promise<string | null> {
  try {
    const album = await Album.get(ALBUM);
    if (album) return (await Asset.create(fileUri, album)).id;
    const asset = await Asset.create(fileUri);
    await Album.create(ALBUM, [asset], true);
    return asset.id;
  } catch (e) {
    console.warn('[mochicam] could not save to the album', e);
    return null;
  }
}
