import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export type FastlaneProjectOptions = {
  /** Defaults to './fastlane' */
  fastlaneDir?: string;
};

export async function updateFastlaneVersion(
  version: string,
  { fastlaneDir = './fastlane' }: FastlaneProjectOptions = {},
) {
  const deliverfilePath = join(fastlaneDir, '/Deliverfile');

  try {
    const deliverfile = await readFile(deliverfilePath, 'utf8');
    const replaced = deliverfile.replace(/^app_version.+$/m, `app_version '${version}'`);

    await writeFile(deliverfilePath, replaced);
  } catch (error) {
    if ((error as { code: string }).code === 'ENOENT') {
      return console.warn(`No Deliverfile detected (tried ${deliverfilePath})`);
    }

    throw error;
  }
}
