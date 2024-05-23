# inlang-plugin-xcstrings

[![badge](https://cdn.jsdelivr.net/gh/opral/monorepo@main/inlang/assets/md-badges/inlang.svg)](https://inlang.com)

> An inlang plugin to handle Xcode String Catalogs

## Usage

Add the plugin and your settings to your _inlang.project/settings.json_:

```diff
 {
   "$schema": "https://inlang.com/schema/project-settings",
   "sourceLanguageTag": "en",
   "languageTags": ["en", "de"],
   "modules": [
     "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
     "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
     "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-without-source@latest/dist/index.js",
     "https://cdn.jsdelivr.net/npm/@inlang/plugin-t-function-matcher@latest/dist/index.js",
+    "https://cdn.jsdelivr.net/npm/inlang-plugin-xcstrings@latest/out/index.js"
   ],
+  "plugin.lsage.xcstrings": {
+    "pathPattern": "./Localizable.xcstrings"
+  }
 }

```
