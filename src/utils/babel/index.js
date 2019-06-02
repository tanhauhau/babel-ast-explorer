import * as babel from '@babel/core';

export function parse(code, pluginOptions = []) {
  return babel.parseAsync(code, {
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
  });
}
