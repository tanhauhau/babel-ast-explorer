
let babelCodeFrame = null;

export async function getBabelCodeFrame() {
  if (babelCodeFrame === null) {
    babelCodeFrame = await import('@babel/code-frame')
  }
  return babelCodeFrame;
}