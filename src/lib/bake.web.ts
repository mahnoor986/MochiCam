// laptop web preview only: no skia/canvaskit here, so the photo is kept as captured
export async function bakePhoto(srcUri: string, _filterId: string, _id: string): Promise<string> {
  return srcUri;
}
