import React from 'react';
import { Button } from 'antd';

const META_TYPE = 'text/json';

function generateHref(ast) {
  const data = JSON.stringify(ast, null, 2);
  let href;
  if (Blob) {
    const dataBlob = new Blob([data], { type: META_TYPE });
    if (window.webkitURL) {
      href = window.webkitURL.createObjectURL(dataBlob);
    } else {
      href = window.URL.createObjectURL(dataBlob);
    }
  } else {
    href = `data:${META_TYPE};charset=utf-8,${encodeURIComponent(data)}`;
  }
  return href;
}

function simulateLink(href) {
  const link = document.createElement('a');
  link.href = href;
  link.download = 'data.json';
  link.click();
}

export default function DownloadButton({ ast }) {
  const onClick = React.useCallback(() => simulateLink(generateHref(ast)), [ast])

  return (
    <Button onClick={onClick}>Download AST</Button>
  );
}
