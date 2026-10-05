const MAX_AVATAR_FILE_SIZE = 8 * 1024 * 1024;
const AVATAR_SIZE = 320;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function prepareAvatarImage(file: File): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error('The selected image must be smaller than 8 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('The selected image could not be opened.'));
      element.src = objectUrl;
    });

    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - cropSize) / 2;
    const sourceY = (image.naturalHeight - cropSize) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is not supported in this browser.');
    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE
    );
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
