import type { Plugin } from '@inlang/sdk';
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

const id = 'plugin.lsage.xcstrings';

if (id !== manifestId) throw new Error('Plugin ID does not match');

function* iteratePatterns(pathPattern: PluginSettings['pathPattern']) {
  const patterns =
    pathPattern instanceof Object
      ? Object.entries(pathPattern).map(([key, pattern]) => ({ key: [key], pattern }))
      : [{ key: [], pattern: pathPattern }];

  yield* patterns;
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

    for (const { key: fileKey, pattern } of iteratePatterns(pathPattern)) {
      const catalog = JSON.parse(
        await nodeishFs.readFile(pattern, { encoding: 'utf-8' }),
      ) as StringsCatalog;

      if (catalog.sourceLanguage !== settings.sourceLanguageTag) {
        throw new Error(
          `Source language '${catalog.sourceLanguage}' inside ${pathPattern} does not match project settings ('${settings.sourceLanguageTag}')`,
        );
      }

      for (const [messageKey, { localizations }] of Object.entries(catalog.strings)) {
        const key = [...fileKey, messageKey].join(':');

        messages.push(
          createMessage(
            key,
            Object.fromEntries([
              // Source language
              ...(useBaseInternationalization ? [[catalog.sourceLanguage, messageKey]] : []),

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
  saveMessages: (args) => {
    console.info('saveMessages called with ', args.messages);
    throw new Error('Not implemented');
  },
};
