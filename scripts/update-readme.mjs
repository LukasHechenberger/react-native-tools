import Template from '@ls-age/update-section';
import { getPackages } from '@manypkg/get-packages';

async function updateReadme() {
  const { packages } = await getPackages(process.cwd());

  await Template.updateSection(
    'README.md',
    'packages',
    packages
      .map(
        ({ packageJson, relativeDir }) =>
          `- [\`${packageJson.name}\`](${relativeDir}): ${packageJson.description}`,
      )
      .join('\n'),
  );
}

updateReadme().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
