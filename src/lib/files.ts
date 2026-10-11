import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { API_BASE_URL } from '@/lib/config';
import { useSession } from '@/store/session';

/**
 * Downloads a binary document exposed by the API (template, PDF, export) into the app cache with the session's Bearer
 * token, and returns the local file.
 */
export async function downloadToCache(path: string, fileName: string): Promise<File> {
  const directory = new Directory(Paths.cache, 'downloads');
  directory.create({ intermediates: true, idempotent: true });

  const target = new File(directory, fileName);

  if (target.exists) {
    target.delete();
  }

  const { accessToken } = useSession.getState();
  const task = File.createDownloadTask(`${API_BASE_URL}${path}`, target, {
    headers: { Accept: '*/*', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
  });

  const file = await task.downloadAsync();

  if (!file) {
    throw new Error('The download did not finish.');
  }

  return file;
}

/** Opens the native share sheet for a local file. */
export async function shareFile(file: File, mimeType?: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: file.name });
}

/** Download, then hand the file to the share sheet. */
export async function downloadAndShare(path: string, fileName: string, mimeType?: string): Promise<void> {
  await shareFile(await downloadToCache(path, fileName), mimeType);
}
