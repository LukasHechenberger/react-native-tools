import { Builtins, Cli } from 'clipanion';
import { version, name } from '../../package.json';
import { commands } from './commands';

const cli = Cli.from([...commands, Builtins.HelpCommand, Builtins.VersionCommand], {
  binaryLabel: name,
  binaryName: `npx ${name}`,
  binaryVersion: version,
});

export default cli;
