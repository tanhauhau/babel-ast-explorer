import React, { useState, useCallback, useEffect } from 'react';
import * as babel from './utils/babel';
import { getQueryParams, useQueryParams } from './utils/url';
import ASTreeViewer, { useTreeSettings } from './components/ASTreeViewer';
import BabelSettings, { useBabelSettings } from './components/BabelSettings';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import styles from './App.scss';
import 'antd/dist/antd.css';

// TODO: should be `useEffect(..., [])` to get query params
const urlState = getQueryParams();
const initialBabelSettings = urlState.babelSettings || {};
const initialCode = urlState.code || '';
const initialTreeSettings = urlState.treeSettings || '';

function App() {
  const [babelSettings, updateBabelSettings] = useBabelSettings(initialBabelSettings);
  const [treeSettings, toggleTreeSettings] = useTreeSettings(initialTreeSettings);
  const [code, ast, error, onCodeChange] = useBabel(initialCode, babelSettings);
  const [marker, setMarker] = useMarker();
  const [selectedNode, onCursorChange] = useCursor(ast);

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
        ) : (
          <ASTreeViewer
            data={ast}
            selectedNode={selectedNode}
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
  const [ast, setAst] = useState({});
  const onCodeChange = useCallback(value => setValue(value), [setValue]);
  const debouncedValue = useDebounce(value, 500);
  const debouncedOptions = useDebounce(babelOptions, 500);

  useEffect(() => {
    let cancel = false;
    babel
      .parse(debouncedValue, debouncedOptions)
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
    setSelectedAst(search(cursor, ast));
  }, [cursor, ast, setSelectedAst]);

  return [selectedAst, onCursorChange];
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
  while (stack.length) {
    const node = stack.pop();
    for (const key in node) {
      if (isNode(node[key]) && isInRange(cursor, node[key].loc)) {
        stack.push(node[key]);
      }
      if (Array.isArray(node[key])) {
        for (const item of node[key]) {
          if (isNode(item) && isInRange(cursor, item.loc)) {
            stack.push(item);
          }
        }
      }
    }
    if (stack.length === 0) {
      return node;
    }
  }
  return null;
}
