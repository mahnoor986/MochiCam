// everything mochicam keeps between launches lives in AsyncStorage under these keys
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BoothMode = 'single' | 'four';

export type GalleryItem = {
  id: string;
  type: 'photo' | 'strip';
  /** file in documentDirectory/mochicam/ */
  uri: string;
  /** id of the copy in the device "MochiCam" album, if saving there worked */
  assetId: string | null;
  filter: string;
  frame: string | null;
  caption: string;
  showDate: boolean;
  showCaption: boolean;
  createdAt: number;
  /** strips only: the 4 baked shots, kept so the strip can be re-exported with another frame */
  shots?: string[];
};

/** image to use for small thumbnails: a strip shows its first shot */
export const thumbOf = (item: GalleryItem) => (item.type === 'strip' ? (item.shots?.[0] ?? item.uri) : item.uri);

export type Stored = {
  name: string;
  firstLaunch: boolean;
  mode: BoothMode;
  gallery: GalleryItem[];
};

const KEY = {
  name: 'mochicam:name',
  firstLaunch: 'mochicam:firstLaunch',
  mode: 'mochicam:mode',
  gallery: 'mochicam:gallery',
} as const;

export async function loadAll(): Promise<Stored> {
  const rows = Object.fromEntries(await AsyncStorage.multiGet(Object.values(KEY)));
  let gallery: GalleryItem[] = [];
  try {
    gallery = JSON.parse(rows[KEY.gallery] ?? '[]');
  } catch {
    // a broken index should never brick the app; start fresh
  }
  return {
    name: rows[KEY.name] ?? '',
    firstLaunch: rows[KEY.firstLaunch] !== 'false',
    mode: rows[KEY.mode] === 'four' ? 'four' : 'single',
    gallery,
  };
}

export const saveName = (name: string) =>
  AsyncStorage.multiSet([
    [KEY.name, name],
    [KEY.firstLaunch, 'false'],
  ]);

export const saveMode = (mode: BoothMode) => AsyncStorage.setItem(KEY.mode, mode);

export const saveGallery = (items: GalleryItem[]) =>
  AsyncStorage.setItem(KEY.gallery, JSON.stringify(items));
