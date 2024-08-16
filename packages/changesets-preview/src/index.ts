import getReleasePlan from '@changesets/get-release-plan';
import type { ComprehensiveRelease } from '@changesets/types';
import { getPackages, type Package } from '@manypkg/get-packages';
import { join } from 'path';

export function getCurrentRelease(pkg: Package): ComprehensiveRelease {
  return {
    name: pkg.packageJson.name,
    type: 'none',
    newVersion: pkg.packageJson.version,
    oldVersion: pkg.packageJson.version,
    changesets: [],
  };
}

function isPath(input: string) {
  return input.startsWith('.');
}

function resolvePackage({
  cwd,
  input,
  packages,
}: {
  cwd: string;
  input: string;
  packages: Package[];
}): Package {
  if (!isPath(input)) return packages.find((p) => p.packageJson.name === input);

  const pkg = packages.find((pkg) =>
    isPath(input) ? pkg.dir === join(cwd, input) : pkg.packageJson.name === input,
  );

  if (!pkg) {
    throw new Error(
      `Could not find package ${isPath(input) ? `at ${input}` : `'${input}'`} in directory ${cwd}`,
    );
  }

  return pkg;
}

export async function previewPackageRelease({
  package: packageInput = '.',
  cwd = process.cwd(),
}: {
  package?: string;
  cwd?: string;
}): Promise<ComprehensiveRelease> {
  const { rootDir, packages } = await getPackages(cwd);

  const pkg = resolvePackage({ cwd, input: packageInput, packages });
  const plan = await getReleasePlan(rootDir);

  return (
    plan.releases.find((release) => release.name === pkg.packageJson.name) ?? getCurrentRelease(pkg)
  );
}
