import { Option } from 'clipanion';
import * as t from 'typanion';
import { previewPackageRelease } from '../..';
import { CommandWithPackage } from '../../lib/clipanion';

const allowedProperties = ['newVersion', 'oldVersion', 'type'] as const;

export default class VersionCommand extends CommandWithPackage {
  static paths = [this.Default];

  static usage = this.Usage({
    description: 'Preview the version that will be published',
    examples: [
      ['Preview the version that will be published for the current package', '$0'],
      ['Preview the type of version bump that will be published', '$0 --property type'],
    ],
  });

  private property = Option.String('--property', 'newVersion', {
    description: `Property to return (One of ${allowedProperties
      .map((p) => `\`${p}\``)
      .join(', ')}, defaults to \`newVersion\`)`,
    validator: t.isEnum(allowedProperties),
  });

  async execute() {
    const preview = await previewPackageRelease({
      package: this.packageOption,
    });

    this.context.stdout.write(`${preview[this.property]}\n`);
  }
}
