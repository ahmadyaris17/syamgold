import { requireSupabase } from '../services/supabase';

/** Ukuran maksimal gambar original sebelum perlu kompresi agresif (8 MB) */
export const MAX_ORIGINAL_SIZE = 8 * 1024 * 1024;

/** Target ukuran hasil kompresi agar aman di-upload ke storage */
const MAX_STORED_SIZE = 900 * 1024;

/**
 * Memeriksa apakah file gambar melebihi batas ukuran maksimal.
 * @param {File} file
 * @returns {{ oversized: boolean, sizeMB: string }}
 */
export function checkImageSize(file) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  return {
    oversized: file.size > MAX_ORIGINAL_SIZE,
    sizeMB,
  };
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(source);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error('Format gambar tidak dapat dibuka.'));
    };
    image.src = source;
  });
}

function canvasToWebp(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gambar gagal dikompresi.'));
    }, 'image/webp', quality);
  });
}

/**
 * Mengompresi gambar banner.
 * Untuk gambar > 8 MB, kompresi lebih agresif di awal agar cepat menyusut.
 *
 * @param {File} file - File gambar original
 * @param {{ onProgress?: (message: string) => void }} [opts]
 * @returns {Promise<Blob>} Blob WebP hasil kompresi
 */
export async function compressBannerImage(file, opts = {}) {
  const { onProgress } = opts;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Gunakan gambar JPG, PNG, atau WebP.');
  }

  const isOversized = file.size > MAX_ORIGINAL_SIZE;
  if (isOversized && onProgress) {
    onProgress('Gambar besar terdeteksi, mengompresi...');
  }

  const image = await loadImageFile(file);

  // Untuk gambar > 8 MB: mulai dengan skala & kualitas lebih rendah
  // agar kompresi lebih agresif sejak awal
  const maxDim = isOversized ? 1400 : 1600;
  const startQuality = isOversized ? 0.72 : 0.82;
  const scaleDecay = isOversized ? 0.72 : 0.78;
  const qualityDecay = isOversized ? 0.09 : 0.07;
  const maxAttempts = isOversized ? 7 : 5;
  const minQuality = isOversized ? 0.45 : 0.58;

  let scale = Math.min(1, maxDim / image.width, (maxDim * 9 / 16) / image.height);
  let quality = startQuality;
  let result = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak mendukung kompresi gambar.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    result = await canvasToWebp(canvas, quality);

    if (result.size <= MAX_STORED_SIZE) {
      if (onProgress) {
        const pct = Math.round((1 - result.size / file.size) * 100);
        onProgress(`Terkompresi ${pct}% (${(result.size / 1024).toFixed(0)} KB)`);
      }
      return result;
    }

    scale *= scaleDecay;
    quality = Math.max(minQuality, quality - qualityDecay);
  }

  if (!result || result.size > MAX_STORED_SIZE) {
    throw new Error('Gambar masih terlalu besar setelah dikompresi. Coba gambar dengan ukuran lebih kecil.');
  }

  return result;
}

/**
 * Upload gambar banner ke Supabase Storage.
 * Gambar akan otomatis dikompresi sebelum di-upload.
 * Gambar > 8 MB akan dikompresi lebih agresif.
 *
 * @param {File} file - File gambar yang akan di-upload
 * @param {{ onProgress?: (message: string) => void }} [opts]
 * @returns {Promise<string>} Public URL gambar yang sudah di-upload
 */
export async function uploadBannerImage(file, opts = {}) {
  const compressedImage = await compressBannerImage(file, opts);
  const fileName = `banner-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
  const client = requireSupabase();
  const { error } = await client.storage.from('banners').upload(fileName, compressedImage, {
    cacheControl: '3600',
    contentType: 'image/webp',
    upsert: false,
  });
  if (error) throw new Error(`Gambar gagal di-upload: ${error.message}`);

  return client.storage.from('banners').getPublicUrl(fileName).data.publicUrl;
}
