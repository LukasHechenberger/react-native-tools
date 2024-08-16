import { Command, Option, type Usage } from 'clipanion';

type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type AppUsage = MakeRequired<Usage, 'description'>;

export abstract class AppCommand extends Command {
  static Usage(usage: AppUsage): AppUsage {
    return usage;
  }

  static usage: AppUsage;
}

export abstract class CommandWithPackage extends AppCommand {
  static Usage(usage: AppUsage): AppUsage {
    return {
      ...usage,
      examples: [
        ...(usage.examples ?? []),
        [
          'For the `--package` option you can pass a package name...',
          `$0 --package my-package ...`,
        ],
        ['...or a path to a package directory', `$0 --package ../path/to/my-package ...`],
      ],
    };
  }

  protected packageOption = Option.String('--package', '.', {
    description: 'Package to operate on (defaults to the package in the current directory)',
  });
}
