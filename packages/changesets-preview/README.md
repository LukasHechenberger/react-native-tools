# changesets-preview

Preview releases in a changesets project

> NOTE: This currently does not take into accounts releases of depending workspace packages

## CLI

<!-- BEGIN cli-usage -->
<!-- This section is generated, do not edit it! -->

```
Preview the version that will be published

Usage

$ npx changesets-preview

Options

  --package #0     Package to operate on (defaults to the package in the current directory)
  --property #0    Property to return (One of `newVersion`, `oldVersion`, `type`, defaults to `newVersion`)

Examples

Preview the version that will be published for the current package
  $ npx changesets-preview

Preview the type of version bump that will be published
  $ npx changesets-preview --property type

For the `--package` option you can pass a package name...
  $ npx changesets-preview --package my-package ...

...or a path to a package directory
  $ npx changesets-preview --package ../path/to/my-package ...
```

<!-- END cli-usage -->
