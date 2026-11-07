import * as MediaLibrary from 'expo-media-library';

/** photos only (android 13+ granular permission); read access is needed later to delete from the album */
export const usePhotoPermissions = () => MediaLibrary.usePermissions({ granularPermissions: ['photo'] });
