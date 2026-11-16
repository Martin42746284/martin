import { BUCKET, getSupabase } from '../lib/supabase';

/** Vrai pour un chemin du bucket Supabase (et non une URL ou un fichier local du site). */
export function isBucketPath(path?: string | null): path is string {
  return !!path && !/^(https?:)?\/\//.test(path) && !path.startsWith('/');
}

/** Réduit une image (côté navigateur) avant l'envoi, et la convertit en WebP. */
export async function resizeImage(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Le navigateur ne peut pas traiter cette image.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Conversion de l’image impossible.'))),
      'image/webp',
      0.86,
    ),
  );
}

function safeName(base: string): string {
  return (
    base
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'fichier'
  );
}

async function send(path: string, body: Blob | File, contentType: string): Promise<string> {
  const client = await getSupabase();
  if (!client) throw new Error('Supabase n’est pas configuré.');
  const { error } = await client.storage.from(BUCKET).upload(path, body, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

/** Envoie une image dans le bucket et renvoie son chemin. Le nom contient l'heure pour éviter les caches. */
export async function uploadImage(folder: string, base: string, file: File, maxSide: number): Promise<string> {
  const blob = await resizeImage(file, maxSide);
  const prefix = folder ? `${folder}/` : '';
  return send(`${prefix}${safeName(base)}-${Date.now()}.webp`, blob, 'image/webp');
}

/** Envoie un document (PDF) dans le bucket et renvoie son chemin. */
export async function uploadDocument(folder: string, base: string, file: File): Promise<string> {
  if (file.type !== 'application/pdf') throw new Error('Choisissez un fichier PDF.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Le PDF dépasse 10 Mo.');
  const prefix = folder ? `${folder}/` : '';
  return send(`${prefix}${safeName(base)}-${Date.now()}.pdf`, file, 'application/pdf');
}

/** Supprime un fichier du bucket. Sans conséquence si le fichier n'existe pas. */
export async function removeFile(path?: string | null): Promise<void> {
  const client = await getSupabase();
  if (!client || !isBucketPath(path)) return;
  await client.storage.from(BUCKET).remove([path]);
}
