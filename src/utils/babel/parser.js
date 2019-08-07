/* eslint-disable import/no-webpack-loader-syntax, no-new-func */

export function parse(code, pluginOptions = [], version = '7.5.5') {
  return getBabel(version).then(
    babel =>
      babel.transform(code, {
        ast: true,
        plugins: [
          function() {
            return {
              manipulateOptions(opts, parserOpts) {
                for (const parserOption in pluginOptions) {
                  const option = pluginOptions[parserOption];
                  if (option.enabled) {
                    if (option.options) {
                      parserOpts.plugins.push([parserOption, option.options]);
                    } else {
                      parserOpts.plugins.push(parserOption);
                    }
                  }
                }
              },
            };
          },
        ],
      }).ast
  );
}

const babel = {};
const babelScripts = require('./versions/versions');
async function getBabel(version) {
  if (babel[version] !== undefined) {
    return babel[version];
  }
  const babelScriptsUrl = babelScripts[version];
  let response = await fetch(babelScriptsUrl);
  let script = await response.text();
  const exports = {};
  new Function('exports', script)(exports);
  // clean up
  script = undefined;
  response = undefined;
  return (babel[version] = exports.Babel);
}
