# Microthemer (WordPress.org) – readable source

The [Microthemer plugin on WordPress.org](https://wordpress.org/plugins/microthemer/) ships its
JavaScript and CSS minified. This repository holds the human-readable source of those files, one
commit and tag per released version (e.g. `7.5.5.0`). It is published from the release build, so
it always matches what is in the plugin package.

| In the plugin | Readable source here |
| --- | --- |
| `js-min/deps.js` | `js/deps.js` (the plugin's libraries and modules, concatenated in load order before minifying) |
| `js-min/<name>.js` | `js/page/`, `js/mod/`, `js/worker/` or `js/data/<name>.js` |
| `js-min/ace/…` | `js/lib/ace/…` (Ace editor, with Microthemer's customisations – see `customisations.txt`) |
| `css/<name>.min.css` | `css/<name>.css` |

The minified files are produced with [terser](https://github.com/terser/terser) (JavaScript) and
[clean-css](https://github.com/clean-css/clean-css) (CSS), without other transformations.

## Third-party files included as distributed upstream

These are shipped as their authors publish them, so their source is upstream:

- `js-min/sass/` – [sass.js](https://github.com/medialize/sass.js) v0.11.1 (libsass 3.6.2)
- `js-min/beautify-html.min.js` – [js-beautify](https://github.com/beautify-web/js-beautify)
- `css/animate.min.css` – [animate.css](https://github.com/animate-css/animate.css) (the unminified copy ships in the plugin as `includes/animation/animate.css`)
- `css/jquery-ui-1.12.1.min.css` – [jQuery UI](https://github.com/jquery/jquery-ui) 1.12.1 base theme

## License

GPLv2 or later, the same as the plugin. See `LICENSE`.
