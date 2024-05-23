import type { NodeishFilesystemSubset, Plugin, Text } from '@inlang/sdk';
import { id as manifestId, displayName, description } from '../marketplace-manifest.json';
import { createMessage } from '@inlang/sdk/test-utilities';
import { PluginSettings } from './settings.js';

type StringsCatalog = {
  sourceLanguage: string;
  strings: Record<
    string,
    { localizations: Record<string, { stringUnit: { state: string; value: string } }> }
  >;
};

export const id = 'plugin.lsage.xcstrings';

if (id !== manifestId) throw new Error('Plugin ID does not match');

function* iteratePatterns(pathPattern: PluginSettings['pathPattern']) {
  const patterns =
    pathPattern instanceof Object
      ? Object.entries(pathPattern).map(([key, pattern]) => ({ key, pattern }))
      : [{ key: undefined, pattern: pathPattern }];

  yield* patterns;
}

async function* iterateCatalogs(
  nodeishFs: NodeishFilesystemSubset,
  pathPattern: PluginSettings['pathPattern'],
) {
  for (const { key, pattern } of iteratePatterns(pathPattern)) {
    const catalog = JSON.parse(
      await nodeishFs.readFile(pattern, { encoding: 'utf-8' }),
    ) as StringsCatalog;

    yield { key, pattern, catalog, path: pattern };
  }
}

export const plugin: Plugin<{
  [id]: PluginSettings;
}> = {
  id: id,
  displayName,
  description,
  settingsSchema: PluginSettings,
  loadMessages: async ({ settings, nodeishFs }) => {
    const { pathPattern, useBaseInternationalization = true } = settings[id] ?? {};

    const messages = [];

    for await (const { key: fileKey, catalog } of iterateCatalogs(nodeishFs, pathPattern)) {
      if (catalog.sourceLanguage !== settings.sourceLanguageTag) {
        throw new Error(
          `Source language '${catalog.sourceLanguage}' inside ${pathPattern} does not match project settings ('${settings.sourceLanguageTag}')`,
        );
      }

      for (const [messageKey, { localizations }] of Object.entries(catalog.strings)) {
        const key = [...(fileKey ? [fileKey] : []), messageKey].join(':');

        messages.push(
          createMessage(
            key,
            Object.fromEntries([
              // // Source language
              // ...(useBaseInternationalization ? [[catalog.sourceLanguage, messageKey]] : []),

              // Translations
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
    const { pathPattern } = settings[id] ?? {};

    for await (const { key: fileKey, catalog, path } of iterateCatalogs(nodeishFs, pathPattern)) {
      const prefix = fileKey ? `${fileKey}:` : '';

      for (const message of messages) {
        if (message.id.startsWith(prefix)) {
          const key = message.id.slice(prefix.length);
          // Reset message for this key
          catalog.strings[key] ??= { localizations: {} };
          catalog.strings[key].localizations ??= {};

          for (const variant of message.variants) {
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
