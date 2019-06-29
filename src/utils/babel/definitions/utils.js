// @flow
export const BUILDER_KEYS: { [string]: Array<string> } = {};

export function validate() {}
export function typeIs() {}
export function validateType() {}
export function validateOptional() {}
export function validateOptionalType() {}
export function arrayOf() {}
export function arrayOfType() {}
export function validateArrayOfType() {}
export function assertEach() {}
export function assertOneOf() {}
export function assertNodeType() {}
export function assertNodeOrValueType() {}
export function assertValueType() {}
export function chain() {}

export default function defineType(
  type: string,
  opts: {
    visitor?: Array<string>,
    builder?: Array<string>,
    inherits?: string,
  } = {}
) {
  const inherits = (opts.inherits && store[opts.inherits]) || {};
  const builder: Array<string> =
    opts.builder || inherits.builder || opts.visitor || [];

  BUILDER_KEYS[type] = opts.builder = builder;
  store[type] = opts;
}

const store = {};
