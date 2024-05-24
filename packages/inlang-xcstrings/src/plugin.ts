import type { Message, NodeishFilesystemSubset, Pattern, Plugin, Text } from '@inlang/sdk';
import { displayName } from '../marketplace-manifest.template.json';
import { description } from '../package.json';
import { PluginSettings } from './settings.js';
import { readJson } from './lib/fs.js';

// NOTE: Taken from @inlang/sdk/test-utilities
const createMessage = (id: string, patterns: Record<string, Pattern | string>) =>
  ({
    id,
    alias: {},
    selectors: [],
    variants: Object.entries(patterns).map(([languageTag, patterns]) => ({
      languageTag,
      match: [],
      pattern: typeof patterns === 'string' ? [{ type: 'Text', value: patterns }] : patterns,
    })),
  }) satisfies Message;

export type StringsCatalog = {
  sourceLanguage: string;
  strings: Record<
    string,
    { localizations: Record<string, { stringUnit: { state: string; value: string } }> }
  >;
};

export const id = 'plugin.hechenbros.xcstrings';

function* iteratePatterns(file: PluginSettings['file']) {
  const patterns =
    file instanceof Object
      ? Object.entries(file).map(([key, pattern]) => ({ key, pattern }))
      : [{ key: undefined, pattern: file }];

  yield* patterns;
}

async function* iterateCatalogs(nodeishFs: NodeishFilesystemSubset, file: PluginSettings['file']) {
  for (const { key, pattern } of iteratePatterns(file)) {
    const catalog = await readJson<StringsCatalog>(pattern, nodeishFs);

    yield { key, pattern, catalog, path: pattern };
  }
}

export const usingBasePostfix = ' [using base]';

export const plugin: Plugin<{
  [id]: PluginSettings;
}> = {
  id: id,
  displayName,
  description,
  settingsSchema: PluginSettings,
  loadMessages: async ({ settings, nodeishFs }) => {
    const { file } = settings[id] ?? {};

    // NOTE: This should not happen as long as the settings schema is validated before...
    if (!file) throw new Error(`Missing 'file' property in settings for plugin ${id}`);

    const messages = [];

    for await (const { key: fileKey, catalog } of iterateCatalogs(nodeishFs, file)) {
      if (catalog.sourceLanguage !== settings.sourceLanguageTag) {
        throw new Error(
          `Source language '${catalog.sourceLanguage}' inside ${file} does not match project settings ('${settings.sourceLanguageTag}')`,
        );
      }

      for (const [messageKey, { localizations }] of Object.entries(catalog.strings)) {
        const key = [...(fileKey ? [fileKey] : []), messageKey].join(':');

        messages.push(
          createMessage(
            key,
            Object.fromEntries([
              // Add base localization
              [settings.sourceLanguageTag, `${messageKey}${usingBasePostfix}`],

              // Actual translations
              ...Object.entries(localizations).map(([lang, { stringUnit }]) => [
                lang,
                stringUnit.value,
              ]),
            ]),
          ),
        );
      }
    }

    return messages;
  },
  saveMessages: async ({ messages, settings, nodeishFs }) => {
    const { file } = settings[id] ?? {};

    for await (const { key: fileKey, catalog, path } of iterateCatalogs(nodeishFs, file)) {
      const prefix = fileKey ? `${fileKey}:` : '';

      for (const message of messages) {
        if (message.id.startsWith(prefix)) {
          const key = message.id.slice(prefix.length);

          // Ensure there is an entry for this key
          catalog.strings[key] ??= { localizations: {} };
          catalog.strings[key].localizations ??= {};

          for (const variant of message.variants) {
            const value = (variant.pattern as Text[]).map((text) => text.value).join('');

            if (
              variant.languageTag === settings.sourceLanguageTag &&
              value === `${key}${usingBasePostfix}`
            ) {
              console.log(`Skipping base localization for ${key}`);
              continue;
            }

            catalog.strings[key].localizations[variant.languageTag] = {
              stringUnit: {
                state: 'translated',
                value: (variant.pattern as Text[]).map((text) => text.value).join(''),
              },
            };
          }
        }
      }

      await nodeishFs.writeFile(
        path,
        JSON.stringify(catalog, null, 2)
          // Match Xcode formatting
          .replaceAll(/": /g, '" : '),
      );
    }
  },
};
