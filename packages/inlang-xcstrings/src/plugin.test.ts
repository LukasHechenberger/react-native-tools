import { it, expect, describe } from 'vitest';
import { ProjectSettings, loadProject } from '@inlang/sdk';
import { id as pluginId } from '../marketplace-manifest.json';
import { createNodeishMemoryFs, mockRepo } from '@lix-js/client';
import type { PluginSettings } from './settings.js';
import { createMessage } from '@inlang/sdk/test-utilities';

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
    const { loadProject, fs } = await setup({ pathPattern: './Localizable.xcstrings' });

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

  it('should return messages defined in single pathPattern', async () => {
    const { loadProject, fs } = await setup({ pathPattern: './Localizable.xcstrings' });

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
});

describe('saveMessage', () => {
  it('should save simple messages', () => {
    const fs = createNodeishMemoryFs();
    fs.writeFile('./Localizable.xcstrings', JSON.stringify({ sourceLanguage: 'en', strings: {} }));

    const messages = [createMessage('MyMessage', { en: 'My Message', de: 'Meine Nachricht' })];
  });
});
