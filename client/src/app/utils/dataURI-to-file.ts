import * as fileType from 'file-type/browser';

export async function dataURItoFile(
  dataURI: string
): Promise<{ file: File; extension: string; mimeType: string }> {
  const arr = dataURI.split(',');
  const mime = /:(.*?);/.exec(arr[0])![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const file = new File([u8arr], 'image.png', { type: mime });
  const { extension, mimeType } = await fileType
    .fromBuffer(u8arr)
    .then((type) => ({ extension: type!.ext, mimeType: type!.mime }));
  return { file, extension, mimeType };
}
