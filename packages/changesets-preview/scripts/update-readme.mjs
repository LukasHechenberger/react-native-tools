import Template from '@ls-age/update-section';
import { execSync } from 'child_process';

async function updateReadme() {
  await Template.updateSection(
    'README.md',
    'cli-usage',
    `\`\`\`
${execSync(`node out/bin.mjs --help`, { env: { NO_COLOR: '1' } })
  .toString()
  .trim()}
\`\`\``,
  );
  console.log('README.md updated');
}

updateReadme().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
