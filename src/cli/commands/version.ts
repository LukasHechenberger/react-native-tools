import { Command, Option } from 'clipanion';
import { updateVersion } from '../..';

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

  async execute() {
    await updateVersion(this.versionOption);
  }
}
