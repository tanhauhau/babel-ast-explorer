import { useEffect } from 'react';

export function getQueryParams() {
  return parseQueryParams(document.location.hash);
}

export function useQueryParams(state) {
  useEffect(() => {
    document.location.hash = toQueryParams(state);
  }, Object.values(state));
}

function parseQueryParams(query) {
  try {
    return JSON.parse(decodeURIComponent(query.replace('#?', '')));
  } catch (e) {
    return {};
  }
}

function toQueryParams(obj) {
  return '?' + encodeURIComponent(JSON.stringify(obj));
}
