import type { NodeishFilesystemSubset } from '@inlang/sdk';

export async function readJson<T = unknown>(
  path: string,
  nodeishFs: NodeishFilesystemSubset,
): Promise<T> {
  return JSON.parse(await nodeishFs.readFile(path, { encoding: 'utf-8' })) as T;
}
