/* eslint-disable no-new-func */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsText(file, 'utf-8');
  });
}

export async function getExportsFromFile(file) {
  let content = await readFile(file);
  const _exports = {};
  new Function('exports', content)(_exports);
  content = null;
  _exports.name = file.name;
  return _exports;
}
