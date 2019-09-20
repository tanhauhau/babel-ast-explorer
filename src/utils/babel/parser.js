/* eslint-disable import/no-webpack-loader-syntax, no-new-func */

export function parse(
  code,
  { customParser, pluginOptions = [], version = '7.4.5' }
) {
  if (customParser && typeof customParser.parse === 'function') {
    return Promise.resolve(
      customParser.parse(code, {
        plugins: pushToPlugins([], pluginOptions),
      })
    );
  }

  return getBabel(version).then(
    babel =>
      babel.transform(code, {
        ast: true,
        plugins: [
          function() {
            return {
              manipulateOptions(opts, parserOpts) {
                pushToPlugins(parserOpts.plugins, pluginOptions);
              },
            };
          },
        ],
      }).ast
  );
}

function pushToPlugins(plugins, pluginOptions) {
  for (const parserOption in pluginOptions) {
    const option = pluginOptions[parserOption];
    if (option && option.enabled) {
      if (option.options) {
        plugins.push([parserOption, option.options]);
      } else {
        plugins.push(parserOption);
      }
    }
  }
  return plugins;
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
