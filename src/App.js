import React, { useState, useCallback, useEffect } from 'react';
import * as babel from './utils/babel';
import { getQueryParams, useQueryParams } from './utils/url';
import ASTreeViewer, { useTreeSettings } from './components/ASTreeViewer';
import BabelSettings, { useBabelSettings } from './components/BabelSettings';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import styles from './App.scss';
import { Spin } from 'antd';
import 'antd/dist/antd.css';

// TODO: should be `useEffect(..., [])` to get query params
const urlState = getQueryParams();
const initialBabelSettings = urlState.babelSettings || { version: '7.4.5' };
const initialCode = urlState.code || '';
const initialTreeSettings = urlState.treeSettings || '';
const EMPTY_AST = {};

function App() {
  const [babelSettings, updateBabelSettings] = useBabelSettings(
    initialBabelSettings
  );
  const [treeSettings, toggleTreeSettings] = useTreeSettings(
    initialTreeSettings
  );
  const [code, ast, error, onCodeChange] = useBabel(initialCode, babelSettings);
  const [marker, setMarker] = useMarker();
  const [selectedNode, selectedNodePath, onCursorChange] = useCursor(ast);

  useQueryParams({
    babelSettings,
    treeSettings,
    code,
  });

  return (
    <div className={styles.App}>
      <div className={styles.codeContainer}>
        <div className={styles.codeToolbar}>
          <BabelSettings
            settings={babelSettings}
            onChangeSettings={updateBabelSettings}
          />
        </div>
        <AceEditor
          mode="javascript"
          theme="github"
          width="100%"
          height="100%"
          onChange={onCodeChange}
          name="code"
          value={code}
          showPrintMargin={false}
          editorProps={{ $blockScrolling: true }}
          setOptions={{ useWorker: false }}
          markers={marker}
          onCursorChange={onCursorChange}
        />
      </div>
      <div className={styles.astContainer}>
        {error ? (
          <pre>{error.toString()}</pre>
        ) : ast === EMPTY_AST ? (
          <Spin />
        ) : (
          <ASTreeViewer
            data={ast}
            selectedNode={selectedNode}
            selectedNodePath={selectedNodePath}
            setMarker={setMarker}
            treeSettings={treeSettings}
            toggleTreeSettings={toggleTreeSettings}
          />
        )}
      </div>
    </div>
  );
}

function useBabel(initialCode, babelOptions) {
  const [value, setValue] = useState(initialCode);
  const [error, setError] = useState(null);
  const [ast, setAst] = useState(EMPTY_AST);
  const onCodeChange = useCallback(value => setValue(value), [setValue]);
  const debouncedValue = useDebounce(value, 500);
  const debouncedOptions = useDebounce(babelOptions, 500);

  useEffect(() => {
    let cancel = false;
    setAst(EMPTY_AST);

    babel
      .parse(debouncedValue, debouncedOptions, debouncedOptions.version)
      .then(ast => {
        if (!cancel) {
          setAst(ast);
          setError(null);
        }
      })
      .catch(e => {
        setError(e);
      });
    return () => {
      cancel = true;
    };
  }, [debouncedValue, debouncedOptions, setAst, setError]);

  return [value, ast, error, onCodeChange];
}

export default App;

function useDebounce(value, delay) {
  const [debounceValue, setDebounceValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, setDebounceValue]);
  return debounceValue;
}

function useMarker() {
  const [marker, setMarker] = useState(undefined);
  const setMarkerAt = useCallback(
    location => {
      if (location) {
        const { start, end } = location;
        setMarker([
          {
            startRow: start.line - 1,
            startCol: start.column,
            endRow: end.line - 1,
            endCol: end.column,
            className: 'highlight-marker',
            type: 'background',
          },
        ]);
      } else {
        setMarker([]);
      }
    },
    [setMarker]
  );

  return [marker, setMarkerAt];
}

function useCursor(ast) {
  const [cursor, setCursor] = useState([0, 0]);
  const [selectedAst, setSelectedAst] = useState(null);
  const [selectedAstPath, setSelectedAstPath] = useState(null);
  const onCursorChange = useCallback(
    selection => {
      setCursor([
        selection.selectionLead.row + 1,
        selection.selectionLead.column,
      ]);
    },
    [setCursor]
  );

  useEffect(() => {
    const { node, nodePath } = search(cursor, ast);
    setSelectedAst(node);
    setSelectedAstPath(nodePath);
  }, [cursor, ast, setSelectedAst]);

  return [selectedAst, selectedAstPath, onCursorChange];
}

function isNode(node) {
  return node && node.type && node.loc;
}

function isInRange(cursor, location) {
  if (!location) return false;
  const [row, column] = cursor;
  const { start, end } = location;
  return (
    (start.line < row || (start.line === row && start.column <= column)) &&
    (end.line > row || (end.line === row && end.column >= column))
  );
}

function search(cursor, ast) {
  const stack = [ast];
  const nodePath = [{ node: ast }];
  let keyPathSoFar = '';
  while (stack.length) {
    const node = stack.pop();
    for (const key in node) {
      if (isNode(node[key]) && isInRange(cursor, node[key].loc)) {
        stack.push(node[key]);
        keyPathSoFar = keyPathSoFar ? `${keyPathSoFar}.${key}` : key;
        nodePath.push({ key, keyPath: keyPathSoFar, node: node[key] });
      }
      if (Array.isArray(node[key])) {
        for (const item of node[key]) {
          if (isNode(item) && isInRange(cursor, item.loc)) {
            stack.push(item);
            keyPathSoFar = keyPathSoFar ? `${keyPathSoFar}.${key}` : key;
            nodePath.push({ key, keyPath: keyPathSoFar, node: item });
          }
        }
      }
    }
    if (stack.length === 0) {
      return { node, nodePath };
    }
  }
  return { node: null, nodePath: null };
}
