import * as Sharing from 'expo-sharing';
import { saveFile, shareFile } from './FileService';
import { recordExport } from '../database/SQLiteService';
import type { Snippet, ExportFormat } from '../types';

function buildContent(snippet: Snippet, format: ExportFormat): string {
  switch (format) {
    case 'txt':
      return [
        `// ${snippet.title}`,
        `// Language: ${snippet.language}`,
        `// Tags: ${snippet.tags}`,
        `// Created: ${snippet.created_at}`,
        '',
        snippet.code,
      ].join('\n');

    case 'js':
      return [
        `/**`,
        ` * ${snippet.title}`,
        ` * Language: ${snippet.language}`,
        ` * Tags: ${snippet.tags}`,
        ` * Created: ${snippet.created_at}`,
        ` */`,
        '',
        snippet.code,
      ].join('\n');

    case 'json':
      return JSON.stringify(
        {
          id: snippet.id,
          title: snippet.title,
          language: snippet.language,
          tags: snippet.tags ? snippet.tags.split(',') : [],
          code: snippet.code,
          created_at: snippet.created_at,
          updated_at: snippet.updated_at,
        },
        null,
        2
      );
  }
}

function getExtension(format: ExportFormat): string {
  return format; // txt, js, json
}

function sanitizeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function exportSnippet(
  snippet: Snippet,
  format: ExportFormat,
  shouldShare = false
): Promise<string> {
  const content = buildContent(snippet, format);
  const fileName = `${sanitizeFileName(snippet.title)}.${getExtension(format)}`;
  const filePath = await saveFile('Exports', fileName, content);

  await recordExport(snippet.id, filePath, format);

  if (shouldShare) {
    await shareFile(filePath);
  }

  return filePath;
}

export async function shareSnippetText(snippet: Snippet): Promise<void> {
  const content = buildContent(snippet, 'txt');
  const fileName = `${sanitizeFileName(snippet.title)}.txt`;
  const filePath = await saveFile('Exports', fileName, content);
  await shareFile(filePath);
}
