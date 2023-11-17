import { Command, Option } from 'clipanion';
import { incrementBuildNumber, updateVersion } from '../..';

const runningHelp = process.argv.some((arg) => arg === '--help' || arg === '-h');

export default class VersionCommand extends Command {
  static paths = [['update-version'], ...(runningHelp ? Command.Default : [])];

  static usage = {
    description: 'Update the version of your app',
  };

  private versionOption = Option.String('--to', {
    description: 'The version to update to',
    required: true,
  });

  private incrementBuildOption = Option.Boolean('--increment-build', false, {
    description: 'Also increment the build number',
  });

  async execute() {
    await updateVersion(this.versionOption);

    if (this.incrementBuildOption) {
      await incrementBuildNumber();
    }
  }
}
