import { Command, Option, UsageError } from 'clipanion';
import { isNumber } from 'typanion';
import { getBuildNumber, updateBuildNumber } from '../..';

export default class BuildNumberCommand extends Command {
  static paths = [['build'], ['update-build']];

  static usage = {
    description: 'Update the build number of your app',
  };

  private buildNumberOption = Option.String('--to', {
    description: 'The build number to update to',
    validator: isNumber(),
  });

  private incrementOption = Option.Boolean('--increment', false, {});

  async execute() {
    if (
      (this.incrementOption && this.buildNumberOption) ||
      (!this.incrementOption && !this.buildNumberOption)
    ) {
      throw new UsageError('You must either specify a build number or use the --increment flag');
    }

    let buildNumber = this.buildNumberOption;

    if (this.incrementOption) {
      buildNumber = (await getBuildNumber()) + 1;
    }

    console.info(`Updating build number to ${buildNumber}`);
    await updateBuildNumber(buildNumber);
  }
}
