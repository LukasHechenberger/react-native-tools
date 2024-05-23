import { Type, type Static } from '@sinclair/typebox';

export const PathPattern = Type.String({
  pattern: '^(\\./|\\../|/)[^*]*\\.xcstrings',
  title: 'Path to xcstrings files',
  description:
    'Specify the pathPattern to locate language files in your repository. It must end with `.xcstrings`.',
  examples: ['./Localizable.xcstrings', './ios/MyApp/Localizable.xcstrings'],
});

export const PluginSettings = Type.Object({
  pathPattern: Type.Union([
    PathPattern,
    Type.Record(
      Type.String({
        pattern: '^[^.]+$',
        description: 'Dots are not allowed ',
        examples: ['myapp', 'watch'],
      }),
      PathPattern,
    ),
  ]),
});

export type PluginSettings = Static<typeof PluginSettings>;
