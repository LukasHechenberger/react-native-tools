import { Command, Option, UsageError } from 'clipanion';
import { incrementBuildNumber, updateVersion, getNextVersion } from '../..';

export default class VersionCommand extends Command {
  static paths = [['version'], ['update-version']];

  static usage = Command.Usage({
    description: 'Update the version of your app',
    examples: [
      [
        'Update the version to 1.2.3 and increment the build number',
        '$0 version --to 1.2.3 --increment-build',
      ],
      ['Predict the next version based on changesets', '$0 version --predict'],
    ],
  });

  private versionOption = Option.String('--to', {
    description: 'The version to update to',
  });

  private predictOption = Option.String('--predict', {
    description: 'Predict the next version based on changesets for the given package',
    tolerateBoolean: true,
  });

  private workspaceDirOption = Option.String('--workspace,', {
    description: 'Path to the root of the workspace',
  });

  private incrementBuildOption = Option.Boolean('--increment-build', false, {
    description: 'Also increment the build number',
  });

  async execute() {
    if (
      (!this.versionOption && !this.predictOption) ||
      (this.versionOption && this.predictOption)
    ) {
      throw new UsageError('You must specify either --to or --predict');
    }

    let version = this.versionOption;
    if (!version) {
      version = await getNextVersion({
        ...(typeof this.predictOption === 'string' ? { packageName: this.predictOption } : {}),
        rootDir: this.workspaceDirOption,
      });
    }

    if (version) {
      console.info(`Updating version to ${version}`);
      await updateVersion(version);
    } else {
      console.info('Version did not change');
    }

    if (this.incrementBuildOption) {
      console.info('Incrementing build number');
      await incrementBuildNumber();
    }
  }
}
