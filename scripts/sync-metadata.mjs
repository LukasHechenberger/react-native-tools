import Template from '@ls-age/update-section';
import { getPackages } from '@manypkg/get-packages';
import { writeFile } from 'fs/promises';

function writeJson(path, contents) {
  return writeFile(path, JSON.stringify(contents, null, 2) + '\n');
}

async function syncMetadata() {
  const { packages, rootPackage } = await getPackages(process.cwd());

  for (const { packageJson, relativeDir } of packages) {
    const adapted = structuredClone(packageJson);
    adapted.repository = rootPackage.packageJson.repository;
    adapted.repository.directory = relativeDir;
    adapted.bugs = rootPackage.packageJson.bugs;

    const [url, search] = rootPackage.packageJson.homepage.split('#');
    adapted.homepage = [`${url}/tree/main/${relativeDir}`, search].join('#');

    await writeJson(`${relativeDir}/package.json`, adapted);
  }
}

syncMetadata().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
