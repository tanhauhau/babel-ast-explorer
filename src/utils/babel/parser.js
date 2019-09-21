/* eslint-disable import/no-webpack-loader-syntax, no-new-func */

import { getBabelCodeFrame } from './codeframe';

export function parse(
  code,
  { customParser, pluginOptions = [], version = '7.4.5' }
) {
  if (customParser && typeof customParser.parse === 'function') {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(
          customParser.parse(code, {
            plugins: pushToPlugins([], pluginOptions),
          })
        );
      } catch (error) {
        console.log(error);
        reject(await addCodeFrame(error, code));
      }
    });
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

const LINE_REGEX = /\((\d+)\:(\d+)\)\s*$/;
async function addCodeFrame(error, rawCode) {
  let message = error.message;
  const match = message.match(LINE_REGEX);
  if (match) {
    const [_, line, column] = match;
    const babelCodeFrame = await getBabelCodeFrame();
    message = `SyntaxError: ${message}\n\n${babelCodeFrame.default(
      rawCode,
      Number(line),
      Number(column)
    )}`;
  }
  return message;
}
