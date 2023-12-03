import pl, { type PlistValue } from 'plist';

export function parsePlist(xml: string) {
  return pl.parse(xml);
}

export function buildPlist(value: PlistValue) {
  // (almost) matches the default Xcode formatting
  return (
    pl
      .build(value, { indent: '\t' })
      .replace(/^\t/gm, '')
      .replaceAll('<string/>', '<string></string>') + '\n'
  );
}
