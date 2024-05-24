import { loadProject } from '@inlang/sdk';
import { createMessage } from '@inlang/sdk/test-utilities';
import { mockRepo } from '@lix-js/client';
import { describe, expect, it } from 'vitest';
import { readJson } from './lib/fs.js';
import { plugin, id as pluginId, usingBasePostfix, type StringsCatalog } from './plugin.js';
import type { PluginSettings } from './settings.js';

const projectSettings = {
  sourceLanguageTag: 'en',
  modules: ['./plugin.js'],
  languageTags: ['en', 'de'],
};

async function setup(pluginSettings: PluginSettings) {
  const repo = await mockRepo();
  const fs = repo.nodeishFs;

  // creating a project file
  const settings = {
    ...projectSettings,
    [pluginId]: pluginSettings,
  };

  // writing the project file to the virtual filesystem
  await fs.mkdir('/project.inlang', { recursive: true });
  await fs.writeFile('/project.inlang/settings.json', JSON.stringify(settings));

  return {
    repo,
    fs,
    async loadProject(checkErrors = true) {
      const project = await loadProject({
        repo,
        projectPath: '/project.inlang',
        // simulate the import function that the SDK uses
        // to inject the plugin into the project
        _import: async () => import('./index.js'),
      });

      if (checkErrors) {
        expect(project.errors()).toEqual([]);
        expect(project.installed.plugins()[0]?.id).toBe(pluginId);
      }

      return project;
    },
  };
}

describe('loadMessage', () => {
  it('should throw with invalid catalog source language', async () => {
    const { loadProject, fs } = await setup({ file: './Localizable.xcstrings' });

    await fs.writeFile(
      './Localizable.xcstrings',
      JSON.stringify({
        sourceLanguage: 'de',
        strings: {},
      }),
    );

    const project = await loadProject(false);
    const errors = project.errors() as Error[];

    expect(errors[0].message).toMatch(/Source language 'de'/);
  });

  it('should return messages defined in single file', async () => {
    const { loadProject, fs } = await setup({ file: './Localizable.xcstrings' });

    await fs.writeFile(
      './Localizable.xcstrings',
      JSON.stringify({
        sourceLanguage: 'en',
        strings: {
          MyMessage: {
            localizations: {
              de: {
                stringUnit: {
                  state: 'translated',
                  value: 'Karte',
                },
              },
            },
          },
        },
      }),
    );

    const project = await loadProject();
    const allMessages = project.query.messages.getAll();

    expect(allMessages).toMatchObject([{ id: 'MyMessage' }]);
  });

  it('should inherit base translations', async () => {
    const { loadProject, fs } = await setup({ file: './Localizable.xcstrings' });

    await fs.writeFile(
      './Localizable.xcstrings',
      JSON.stringify({
        sourceLanguage: 'en',
        strings: {
          MyMessage: {
            localizations: {
              de: {
                stringUnit: {
                  state: 'translated',
                  value: 'Karte',
                },
              },
            },
          },
        },
      }),
    );

    const project = await loadProject();
    const allMessages = project.query.messages.getAll();

    expect(allMessages).toMatchObject([
      createMessage('MyMessage', { de: 'Karte', en: `MyMessage${usingBasePostfix}` }),
    ]);
  });
});

describe('saveMessage', () => {
  it('should save simple messages', async () => {
    const { loadProject, fs } = await setup({ file: './Localizable.xcstrings' });

    fs.writeFile('./Localizable.xcstrings', JSON.stringify({ sourceLanguage: 'en', strings: {} }));

    const messages = [createMessage('MyMessage', { en: 'My Message', de: 'Meine Nachricht' })];

    const settings = {
      ...projectSettings,
      [pluginId]: {
        file: './Localizable.xcstrings',
      },
    };

    await plugin.saveMessages!({ messages, nodeishFs: fs, settings });

    const contents = await readJson<StringsCatalog>('./Localizable.xcstrings', fs);
    expect(contents).toMatchObject({
      sourceLanguage: 'en',
      strings: {
        MyMessage: {
          localizations: {
            de: {
              stringUnit: {
                state: 'translated',
                value: 'Meine Nachricht',
              },
            },
            en: {
              stringUnit: {
                state: 'translated',
                value: 'My Message',
              },
            },
          },
        },
      },
    });

    const project = await loadProject();
    const allMessages = project.query.messages.getAll();

    expect(allMessages).toMatchObject([
      {
        id: 'MyMessage',
        variants: [
          { languageTag: 'de', pattern: [{ type: 'Text', value: 'Meine Nachricht' }] },
          { languageTag: 'en', pattern: [{ type: 'Text', value: 'My Message' }] },
        ],
      },
    ]);
  });

  it('should ignore unchanged base translations', async () => {
    const { loadProject, fs } = await setup({ file: './Localizable.xcstrings' });

    fs.writeFile('./Localizable.xcstrings', JSON.stringify({ sourceLanguage: 'en', strings: {} }));

    const messages = [
      createMessage('My Message', { de: 'Meine Nachricht', en: `My Message${usingBasePostfix}` }),
    ];

    const settings = {
      ...projectSettings,
      [pluginId]: {
        file: './Localizable.xcstrings',
      },
    };

    await plugin.saveMessages!({ messages, nodeishFs: fs, settings });

    const contents = await readJson<StringsCatalog>('./Localizable.xcstrings', fs);
    expect(contents).toMatchObject({
      sourceLanguage: 'en',
      strings: {
        'My Message': {
          localizations: {
            de: {
              stringUnit: {
                state: 'translated',
                value: 'Meine Nachricht',
              },
            },
          },
        },
      },
    });

    const project = await loadProject();
    const allMessages = project.query.messages.getAll();

    expect(allMessages).toMatchObject(messages);
  });
});
