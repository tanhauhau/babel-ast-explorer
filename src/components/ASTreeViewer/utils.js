export function generateBabelTypeCode(node) {
  const camelCaseType = node.type[0].toLowerCase() + node.type.slice(1);
  switch (node.type) {
    case 'Program':
      // prettier-ignore
      return `t.${camelCaseType}([${node.body.map(body => generateBabelTypeCode(body)).join(', ')}])`
    case 'ExpressionStatement':
      return `t.${camelCaseType}(${generateBabelTypeCode(node.expression)})`;
    case 'CallExpression':
      // prettier-ignore
      return `t.${camelCaseType}(${generateBabelTypeCode(node.callee)}, [${node.arguments.map(arg => generateBabelTypeCode(arg)).join(', ')}])`;
    case 'MemberExpression':
      // prettier-ignore
      return `t.${camelCaseType}(${generateBabelTypeCode(node.object)}, ${generateBabelTypeCode(node.property)}, ${toString(node.computed)}, ${toString(node.optional)})`;
    case 'AssignmentExpression':
      // prettier-ignore
      return `t.${camelCaseType}(${toString(node.operator)}, ${generateBabelTypeCode(node.left)}, ${generateBabelTypeCode(node.right)})`;
    case 'Identifier':
      return `t.${camelCaseType}('${node.name}')`;
    case 'BooleanLiteral':
    case 'NumericLiteral':
    case 'StringLiteral':
      return `t.${camelCaseType}(${toString(node.value)})`;
    case 'NullLiteral':
      return `t.${camelCaseType}()`;
    default:
      return '';
  }
}

function toString(value) {
  return JSON.stringify(value);
}
