import { Notify } from 'quasar';

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type ImageValidationResult =
  { valid: true; mimeType: string } | { valid: false; message: string };

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!(file instanceof File)) {
    return { valid: false, message: 'O arquivo selecionado não é uma imagem válida.' };
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return { valid: false, message: 'Formato inválido. Utilize JPEG, PNG, WebP ou GIF.' };
  }
  if (file.size <= 0) {
    return { valid: false, message: 'O arquivo de imagem está vazio.' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      message: `A imagem excede o limite de 10 MB por imagem (${formatFileSize(file.size)}).`,
    };
  }

  return { valid: true, mimeType: file.type };
}

export async function validateImageFileSignature(file: File): Promise<ImageValidationResult> {
  const basicValidation = validateImageFile(file);
  if (!basicValidation.valid) return basicValidation;

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  const gif =
    String.fromCharCode(...bytes.slice(0, 6)) === 'GIF87a' ||
    String.fromCharCode(...bytes.slice(0, 6)) === 'GIF89a';

  if (!jpeg && !png && !webp && !gif) {
    return { valid: false, message: 'O arquivo selecionado não é uma imagem válida.' };
  }
  return { valid: true, mimeType: file.type };
}

export function notifyInvalidImage(message: string): void {
  Notify.create({ type: 'negative', message });
}
