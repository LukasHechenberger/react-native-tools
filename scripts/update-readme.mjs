import Template from '@ls-age/update-section';
import { getPackages } from '@manypkg/get-packages';

async function updateReadme() {
  const { packages } = await getPackages(process.cwd());

  await Template.updateSection(
    'README.md',
    'packages',
    packages
      .sort((a, b) => a.packageJson.name.localeCompare(b.packageJson.name))
      .map(
        ({ packageJson, relativeDir }) =>
          `- [\`${packageJson.name}\`](${relativeDir}): [![NPM Version](https://img.shields.io/npm/v/${packageJson.name})](https://www.npmjs.com/package/${packageJson.name}) ${packageJson.description}`,
      )
      .join('\n'),
  );
}

updateReadme().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
