import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { FileItem } from '../types';
import { FOLDERS } from '../constants/theme';

const APP_ROOT = `${FileSystem.documentDirectory}DevSnippets/`;

export async function initFileSystem(): Promise<void> {
  const rootInfo = await FileSystem.getInfoAsync(APP_ROOT);
  if (!rootInfo.exists) {
    await FileSystem.makeDirectoryAsync(APP_ROOT, { intermediates: true });
  }
  for (const folder of FOLDERS) {
    const folderPath = `${APP_ROOT}${folder}/`;
    const info = await FileSystem.getInfoAsync(folderPath);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
    }
  }
}

export function getFolderPath(folder: string): string {
  return `${APP_ROOT}${folder}/`;
}

export function getAppRoot(): string {
  return APP_ROOT;
}

export async function readFolder(folder: string): Promise<FileItem[]> {
  try {
    const folderPath = getFolderPath(folder);
    await ensureFolder(folderPath);
    const names = await FileSystem.readDirectoryAsync(folderPath);
    const items: FileItem[] = [];
    for (const name of names) {
      const uri = `${folderPath}${name}`;
      const info = await FileSystem.getInfoAsync(uri);
      items.push({
        name,
        uri,
        isDirectory: (info as any).isDirectory ?? false,
        size: (info as any).size,
        modificationTime: (info as any).modificationTime,
        folder,
      });
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function saveFile(
  folder: string,
  fileName: string,
  content: string
): Promise<string> {
  await initFileSystem();
  const path = `${getFolderPath(folder)}${fileName}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return path;
}

export async function readFile(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

export async function deleteFile(uri: string): Promise<void> {
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

export async function moveFile(fromUri: string, toFolder: string, fileName: string): Promise<string> {
  const toUri = `${getFolderPath(toFolder)}${fileName}`;
  await FileSystem.moveAsync({ from: fromUri, to: toUri });
  return toUri;
}

export async function copyFile(fromUri: string, toFolder: string, fileName: string): Promise<string> {
  const toUri = `${getFolderPath(toFolder)}${fileName}`;
  await FileSystem.copyAsync({ from: fromUri, to: toUri });
  return toUri;
}

export async function shareFile(uri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri);
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

export async function getFolderSize(folder: string): Promise<number> {
  try {
    const files = await readFolder(folder);
    let total = 0;
    for (const f of files) {
      total += f.size ?? 0;
    }
    return total;
  } catch {
    return 0;
  }
}

export async function getAllFilesSize(): Promise<string> {
  let total = 0;
  for (const folder of FOLDERS) {
    total += await getFolderSize(folder);
  }
  const mb = (total / (1024 * 1024)).toFixed(2);
  return `${mb} MB`;
}

export async function getFolderCount(folder: string): Promise<number> {
  try {
    const files = await readFolder(folder);
    return files.length;
  } catch {
    return 0;
  }
}

async function ensureFolder(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileType(name: string): 'image' | 'code' | 'text' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'go', 'java', 'swift', 'kt', 'html', 'css', 'json', 'sql', 'sh'].includes(ext)) return 'code';
  if (['txt', 'md', 'csv', 'xml', 'yaml', 'yml'].includes(ext)) return 'text';
  return 'other';
}
