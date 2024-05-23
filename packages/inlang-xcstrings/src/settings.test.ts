import { expect, test } from 'vitest';
import { plugin } from './plugin.js';
import { Value } from '@sinclair/typebox/value';
import { PathPattern } from './settings.js';

test('valid path patterns', async () => {
  const validPathPatterns = PathPattern.examples;

  for (const pathPattern of validPathPatterns) {
    const isValid = Value.Check(plugin.settingsSchema!, {
      pathPattern,
    });
    expect(isValid).toBe(true);
  }
});

test('it should fail if the path pattern does not start as a ralaitve path with a /,./ or ../', async () => {
  const pathPattern = 'Localizable.xcstrings';

  const isValid = Value.Check(plugin.settingsSchema!, { pathPattern });

  expect(isValid).toBe(false);
});

test('if path patte end with .xcstrings', async () => {
  const pathPattern = './Localizable.';

  const isValid = Value.Check(plugin.settingsSchema!, { pathPattern });

  expect(isValid).toBe(false);
});

test('if pathPattern with namespaces include the correct pathpattern schema', async () => {
  const pathPattern = {
    app: './app/Localizable.xcstrings',
    watch: '../watch/Localizable.xcstrings',
  };

  const isValid = Value.Check(plugin.settingsSchema!, { pathPattern });

  expect(isValid).toBe(true);
});

test('if pathPattern with namespaces include a incorrect pathpattern ', async () => {
  const pathPattern = {
    app: './folder/file.',
  };

  const isValid = Value.Check(plugin.settingsSchema!, { pathPattern });

  expect(isValid).toBe(false);
});
