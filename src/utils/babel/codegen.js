import definitions from './definitions';

export function generateBabelTypeCode(node) {
  const parameters = definitions[node.type];
  const camelCaseType = node.type[0].toLowerCase() + node.type.slice(1);

  const args = [];
  for (const param of parameters) {
    const argValue = node[param];
    if (argValue !== undefined) {
      if (Array.isArray(argValue)) {
        args.push(
          '[' +
            argValue.map(item => generateBabelTypeCode(item)).join(', ') +
            ']'
        );
      } else if (isNodeType(argValue)) {
        args.push(generateBabelTypeCode(argValue));
      } else {
        args.push(JSON.stringify(argValue));
      }
    } else {
      break;
    }
  }

  return `t.${camelCaseType}(${args.join(', ')})`;
}

function isNodeType(node) {
  return node && typeof node.type === 'string';
}
