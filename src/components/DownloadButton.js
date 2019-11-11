import React from 'react';
import { Button } from 'antd';

const META_TYPE = 'text/json';

function ExportButton({ ast }) {
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

  return (
    <a href={href} download="data.json">
      <Button>Download AST</Button>
    </a>
  );
}
export default React.memo(ExportButton);