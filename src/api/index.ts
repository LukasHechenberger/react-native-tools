import {
  updateAndroidVersion,
  type AndroidProjectOptions,
  updateAndroidBuildNumber,
} from './android';
import { updateXcodeBuildNumber, updateXcodeVersion, type XcodeProjectOptions } from './xcode';

export type CombinedOptions = XcodeProjectOptions & AndroidProjectOptions;

export async function updateVersion(version: string, options?: CombinedOptions) {
  await updateXcodeVersion(version, options);
  await updateAndroidVersion(version, options);
}

export async function updateBuildNumber(buildNumber: number, options?: CombinedOptions) {
  await updateXcodeBuildNumber(buildNumber, options);
  await updateAndroidBuildNumber(buildNumber, options);
}

export { updateAndroidVersion, updateXcodeVersion };
