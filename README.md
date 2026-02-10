# easelbone

A GUI engine combining [EaselJS](https://createjs.com/easeljs) and [Backbone.js](https://backbonejs.org/). Originally developed for use with Flash CC HTML5 output, but can be used with any EaselJS content.

## Features
- Navigatable views with keyboard and mouse support
- UI controls: sliders, checkboxes, selectboxes, and buttons
- Scrollable containers
- Text rendering with auto-sizing
- Alpha mask support
- Built on top of AMD modules (RequireJS)

## Installation
```bash
npm install easelbone
```

Or with Bower:
```bash
bower install easelbone
```

## Examples

Live examples are hosted on GitHub Pages:

- [Controls](https://catlabinteractive.github.io/easelbone/examples/controls.html) — Sliders, checkboxes, selectboxes, and buttons
- [Scrollable Areas](https://catlabinteractive.github.io/easelbone/examples/scroll.html) — Scrollable container demo
- [Float Layout](https://catlabinteractive.github.io/easelbone/examples/float.html) — Float layout demo
- [Alpha Mask](https://catlabinteractive.github.io/easelbone/examples/alphamask.html) — Alpha mask demo

Pull request previews are automatically deployed to `https://catlabinteractive.github.io/easelbone/pr/<PR_NUMBER>/examples/`.

## Development

```bash
# Install dependencies
npm install
npx bower install

# Build
npm run build

# Watch for changes
npx grunt watch
```

## License

[MIT](LICENSE)