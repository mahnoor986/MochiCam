import * as Sharing from 'expo-sharing';

/** opens the android share sheet for one of our jpegs. false when sharing isn't possible. */
export async function shareImage(uri: string, what: 'photo' | 'strip'): Promise<boolean> {
  if (!uri || !(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: `share your ${what} ♡` });
  return true;
}
