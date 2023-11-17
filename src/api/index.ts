import {
  updateAndroidVersion,
  type AndroidProjectOptions,
  updateAndroidBuildNumber,
  getAndroidBuildNumber,
} from './android';
import {
  getXcodeBuildBumber,
  updateXcodeBuildNumber,
  updateXcodeVersion,
  type XcodeProjectOptions,
} from './xcode';

export type CombinedOptions = XcodeProjectOptions & AndroidProjectOptions;

export async function updateVersion(version: string, options?: CombinedOptions) {
  await updateXcodeVersion(version, options);
  await updateAndroidVersion(version, options);
}

export async function updateBuildNumber(buildNumber: number, options?: CombinedOptions) {
  await updateXcodeBuildNumber(buildNumber, options);
  await updateAndroidBuildNumber(buildNumber, options);
}

export async function getBuildNumber(options?: CombinedOptions) {
  const versions = await Promise.all([
    getXcodeBuildBumber(options),
    getAndroidBuildNumber(options),
  ]);

  return versions.reduce((a, b) => Math.max(a, b));
}

export async function incrementBuildNumber(options?: CombinedOptions) {
  const buildNumber = await getBuildNumber(options);

  return updateBuildNumber(buildNumber + 1, options);
}

export * from './xcode';
export * from './android';
export * from './changesets';
