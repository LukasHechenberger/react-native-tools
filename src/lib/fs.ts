import { readFile, writeFile } from 'fs/promises';

export async function updateFile(path: string, update: (contents: string) => string) {
  const contents = await readFile(path, 'utf-8');
  const updated = update(contents);

  await writeFile(path, updated);
}
