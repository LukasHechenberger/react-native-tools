import { previewPackageRelease } from 'changesets-preview';

/** Predict the next release version by checking changesets using `changesets-preview` */
export async function getNextVersion({
  packageName,
  rootDir = process.cwd(),
}: {
  packageName?: string;
  rootDir?: string;
}) {
  return (
    await previewPackageRelease({
      package: packageName,
      cwd: rootDir,
    })
  ).newVersion;
}
