import * as babel from '@babel/core';

export function parse(code, options = {}) {
  const pluginOptions = Object.keys(options).filter(opts => options[opts]);
  return babel.parseAsync(code, {
    plugins: [
      function() {
        return {
          manipulateOptions(opts, parserOpts) {
            /*
             add to parserOpts.plugins to enable the syntax
             eg: 
              jsx, flow, typescript, objectRestSpread, pipelineOperator, 
              throwExpressions, optionalChaining, nullishCoalescingOperator, 
              exportDefaultFrom, dynamicImport, ...
            */
            parserOpts.plugins.push(...pluginOptions);
          }
        };
      }
    ]
  });
}
