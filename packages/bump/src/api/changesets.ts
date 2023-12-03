import { mkdir, readFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join, relative } from 'path';
import { execa } from 'execa';
import { AppError } from '../lib/error';

export async function getChangesetStatus({ rootDir }: { rootDir: string }) {
  const statusFilename = '.changeset-status.json';
  const statusPath = join(rootDir, statusFilename);

  try {
    if (!existsSync(rootDir)) {
      throw new AppError(`Workspace folder ${rootDir} does not exist`);
    }

    await execa('npx', ['changeset', 'status', '--output', statusFilename], { cwd: rootDir });

    const status = JSON.parse(await readFile(statusPath, 'utf8')) as {
      changesets: {
        releases: [{ name: string; type: 'major' | 'minor' | 'patch' }];
        summary: string;
        id: string;
      }[];
      releases: {
        name: string;
        type: string;
        oldVersion: string;
        changesets: string[];
        newVersion: string;
      }[];
    };

    await rm(statusPath);

    return status;
  } catch (error) {
    if ((error as Error).message.match(/no changesets were found/i))
      return { changesets: [], releases: [] };
    if ((error as Error).message.match(/There is no .changeset folder/i))
      throw new AppError(`No changeset folder found in the workspace ${rootDir}`);

    throw error;
  }
}

async function readPackageManifest(dir: string) {
  return JSON.parse(await readFile(join(dir, 'package.json'), 'utf8')) as { name: string };
}

/** Predict the next release version by checking changesets */
export async function getNextVersion({
  packageName,
  rootDir = process.cwd(),
}: {
  packageName?: string;
  rootDir?: string;
}) {
  const status = await getChangesetStatus({ rootDir });

  if (!packageName) {
    packageName = (await readPackageManifest(rootDir)).name;
  }

  const nextRelease = status.releases.find((r) => r.name === packageName);
  return nextRelease?.newVersion;
}
