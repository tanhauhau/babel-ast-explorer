import { useEffect } from 'react';

export function getQueryParams() {
  return parseQueryParams(document.location.hash);
}

export function useQueryParams(state) {
  useEffect(() => {
    window.history.replaceState({}, '', '#' + toQueryParams(state));
  }, Object.values(state));
}

function parseQueryParams(query) {
  try {
    return JSON.parse(
      decodeURIComponent(escape(window.atob(query.replace('#?', ''))))
    );
  } catch (e) {
    return {};
  }
}

function toQueryParams(obj) {
  return '?' + window.btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
