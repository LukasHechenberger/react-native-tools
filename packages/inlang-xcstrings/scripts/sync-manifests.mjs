import { readFile, writeFile } from 'fs/promises';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function syncManifests() {
  const npmManifest = await readJson('./package.json');
  const inlangManifest = await readJson('./marketplace-manifest.template.json');
  const { id } = (await import(`../${npmManifest.module}`)).default;

  const jsdelivrLink = (path) =>
    new URL(path, `https://cdn.jsdelivr.net/npm/${npmManifest.name}@latest/`);

  inlangManifest.id = id;
  inlangManifest.description = { en: npmManifest.description };
  inlangManifest.keywords = npmManifest.keywords;
  inlangManifest.license = npmManifest.license;
  inlangManifest.module = jsdelivrLink(npmManifest.module);
  inlangManifest.readme = jsdelivrLink('README.md');
  inlangManifest.publisherName = npmManifest.author.split('<')[0].trim();

  await writeFile('./marketplace-manifest.json', `${JSON.stringify(inlangManifest, null, 2)}\n`);
}

syncManifests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
