export const BABEL_CONFIG_MAP = [
  { value: 'jsx' },
  { value: 'flow' },
  { value: 'typescript' },
  {
    value: 'classProperties',
    options: [{ key: 'loose', type: 'boolean' }],
  },
  {
    value: 'classPrivateProperties',
    options: [{ key: 'loose', type: 'boolean' }],
  },
  {
    value: 'classPrivateMethods',
    options: [{ key: 'loose', type: 'boolean' }],
  },
  {
    value: 'decorators-legacy',
    options: [{ key: 'decoratorsBeforeExport', type: 'boolean' }],
  },
  {
    value: 'decorators',
  },
  {
    value: 'doExpressions',
  },
  {
    value: 'dynamicImport',
  },
  { value: 'exportDefaultFrom' },
  { value: 'nullishCoalescingOperator' },
  { value: 'numericSeparator' },
  { value: 'objectRestSpread' },
  { value: 'optionalChaining' },
  { value: 'optionalCatchBinding' },
  {
    value: 'partialApplication',
  },
  {
    value: 'pipelineOperator',
    options: [
      { key: 'proposal', type: 'enum', value: ['minimal', 'smart', 'fsharp'] },
    ],
  },
  { value: 'throwExpressions' },
];

const hasOptionsMap = BABEL_CONFIG_MAP.reduce((map, value) => {
  map[value.value] = value.options;
  return map;
}, {});

export const getOptionSettings = key => hasOptionsMap[key];
