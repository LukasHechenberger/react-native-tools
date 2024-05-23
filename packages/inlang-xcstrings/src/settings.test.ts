import { expect, test } from 'vitest';
import { plugin } from './plugin.js';
import { Value } from '@sinclair/typebox/value';
import { PathPattern } from './settings.js';

test('valid path patterns', async () => {
  const validPathPatterns = PathPattern.examples;

  for (const file of validPathPatterns) {
    const isValid = Value.Check(plugin.settingsSchema!, {
      file,
    });
    expect(isValid).toBe(true);
  }
});

test('it should fail if the path pattern does not start as a ralaitve path with a /,./ or ../', async () => {
  const file = 'Localizable.xcstrings';

  const isValid = Value.Check(plugin.settingsSchema!, { file });

  expect(isValid).toBe(false);
});

test('if path patte end with .xcstrings', async () => {
  const file = './Localizable.';

  const isValid = Value.Check(plugin.settingsSchema!, { file });

  expect(isValid).toBe(false);
});

test('if file with namespaces include the correct pathpattern schema', async () => {
  const file = {
    app: './app/Localizable.xcstrings',
    watch: '../watch/Localizable.xcstrings',
  };

  const isValid = Value.Check(plugin.settingsSchema!, { file });

  expect(isValid).toBe(true);
});

test('if file with namespaces include a incorrect pathpattern ', async () => {
  const file = {
    app: './folder/file.',
  };

  const isValid = Value.Check(plugin.settingsSchema!, { file });

  expect(isValid).toBe(false);
});
