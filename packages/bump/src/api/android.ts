import { readFile } from 'fs/promises';
import { updateFile } from '../lib/fs';
import { AppError } from '../lib/error';

const versionCodeRegex = /versionCode (\d+)/;
const versionNameRegex = /versionName "(.+)"/;
const defaultGradlePath = 'android/app/build.gradle';

export type AndroidProjectOptions = {
  gradlePath?: string;
};

export async function updateAndroidVersion(
  version: string,
  { gradlePath = defaultGradlePath }: AndroidProjectOptions = {},
) {
  await updateFile(gradlePath, (contents) =>
    contents.replace(versionNameRegex, `versionName "${version}"`),
  );
}

export async function updateAndroidBuildNumber(
  buildNumber: number,
  { gradlePath = defaultGradlePath }: AndroidProjectOptions = {},
) {
  await updateFile(gradlePath, (contents) =>
    contents.replace(versionCodeRegex, `versionCode ${buildNumber}`),
  );
}

export async function getAndroidBuildNumber({
  gradlePath = defaultGradlePath,
}: AndroidProjectOptions = {}) {
  const contents = await readFile(gradlePath, 'utf-8');
  const [_, versionString] = contents.match(versionCodeRegex) || [];

  if (!versionString) {
    throw new Error(`No versionCode found inside ${gradlePath}`);
  }

  const version = parseFloat(versionString);
  if (isNaN(version)) {
    throw new AppError(`Invalid build number found in ${gradlePath}: ${versionString}`);
  }

  return version;
}
