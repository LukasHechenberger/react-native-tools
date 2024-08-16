import Template from '@ls-age/update-section';
import { getPackages } from '@manypkg/get-packages';
import { markdownTable } from 'markdown-table';

async function updateReadme() {
  const { packages } = await getPackages(process.cwd());

  await Template.updateSection(
    'README.md',
    'packages',
    markdownTable([
      ['Package', 'Description', 'Links'],
      ...packages
        .sort((a, b) => a.packageJson.name.localeCompare(b.packageJson.name))
        .map(({ packageJson, relativeDir }) => [
          `[\`${packageJson.name}\`](${relativeDir})`,
          packageJson.description,
          `[![NPM Version](https://img.shields.io/npm/v/${packageJson.name})](https://www.npmjs.com/package/${packageJson.name})`,
        ]),
    ]),
  );
}

updateReadme().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
