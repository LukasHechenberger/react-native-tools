import { Command, Option } from 'clipanion';
import { isNumber } from 'typanion';
import { updateBuildNumber } from '../..';

export default class BuildNumberCommand extends Command {
  static paths = [['update-build']];

  static usage = {
    description: 'Update the build number of your app',
  };

  private buildNumberOption = Option.String('--to', {
    description: 'The build number to update to',
    required: true,
    validator: isNumber(),
  });

  async execute() {
    await updateBuildNumber(this.buildNumberOption);
  }
}
