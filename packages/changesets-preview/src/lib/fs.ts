import { readFile } from 'fs/promises';

export async function readJson(path: string) {
  return JSON.parse(await readFile(path, 'utf-8'));
}
