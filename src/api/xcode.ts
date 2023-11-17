import fg, { type Pattern } from 'fast-glob';
import { type PlistObject } from 'plist';
import { AppError } from '../lib/error';
import { buildPlist, parsePlist } from '../lib/plist';
import { updateFile } from '../lib/fs';

const xcodePbxGlob = '**/*.xcodeproj/project.pbxproj';
const xcodeInfoPlistGlob = ['**/Info.plist', '!**/Pods/**'];
const xcodeCurrentVersionGlob = /CURRENT_PROJECT_VERSION = ([0-9.]+)/g;

export type XcodeProjectOptions = {
  infoPlists?: string[];
};

async function find(glob: Pattern | Pattern[], errorMessage = `No such file ${glob}`) {
  const results = await fg.async(glob);
  if (results.length === 0) {
    throw new AppError(errorMessage);
  }

  return results;
}

export function updateInfoPlist(path: string, update: PlistObject) {
  return updateFile(path, (contents) => {
    const info = parsePlist(contents);

    if (typeof info !== 'object') {
      throw new AppError(`Invalid Info.plist at ${path}`);
    }

    return buildPlist(Object.assign(info, update));
  });
}

function findPlistFiles() {
  return find(xcodeInfoPlistGlob, 'No Info.plist found');
}

export async function updateXcodeVersion(version: string, options: XcodeProjectOptions = {}) {
  const infoPlists = options.infoPlists || (await findPlistFiles());

  for (const path of infoPlists) {
    await updateInfoPlist(path, { CFBundleShortVersionString: version });
  }
}

async function updateProjectFile(path: string, { buildNumber }: { buildNumber: number }) {
  await updateFile(path, (contents) =>
    contents.replace(xcodeCurrentVersionGlob, `CURRENT_PROJECT_VERSION = ${buildNumber}`)
  );
}

export async function updateXcodeBuildNumber(
  buildNumber: number,
  options: XcodeProjectOptions = {}
) {
  const infoPlists = options.infoPlists || (await findPlistFiles());

  for (const path of infoPlists) {
    await updateInfoPlist(path, { CFBundleVersion: buildNumber });
  }

  // Update project.pbxproj
  const [projectFile] = await find(xcodePbxGlob, 'No project.pbxproj found');
  await updateProjectFile(projectFile, { buildNumber });
}
