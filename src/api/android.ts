import { readFile, writeFile } from 'fs/promises';
import { updateFile } from '../lib/fs';

const versionCodeRegex = /versionCode (\d+)/;
const versionNameRegex = /versionName "(.+)"/;

export type AndroidProjectOptions = {
  gradlePath?: string;
};

export async function updateAndroidVersion(
  version: string,
  { gradlePath = 'android/app/build.gradle' }: AndroidProjectOptions = {}
) {
  await updateFile(gradlePath, (contents) =>
    contents.replace(versionNameRegex, `versionName "${version}"`)
  );
}

export async function updateAndroidBuildNumber(
  buildNumber: number,
  { gradlePath = 'android/app/build.gradle' }: AndroidProjectOptions = {}
) {
  await updateFile(gradlePath, (contents) =>
    contents.replace(versionCodeRegex, `versionCode ${buildNumber}`)
  );
}
