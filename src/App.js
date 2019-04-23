import React, { useState, useCallback, useReducer, useEffect } from 'react';
import * as babel from './utils/babel';
import { getQueryParams, useQueryParams } from './utils/url';
import ASTreeViewer from './components/ASTreeViewer';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import styles from './App.scss';
import { Checkbox } from 'antd';

// TODO: should be `useEffect(..., [])` to get query params
const urlState = getQueryParams();

const initialBabelState = Object.assign(
  {
    jsx: false,
    flow: false,
    typescript: false,
    objectRestSpread: false,
    pipelineOperator: false,
    throwExpressions: false,
    optionalChaining: false,
    nullishCoalescingOperator: false,
    exportDefaultFrom: false,
    dynamicImport: false
  },
  urlState.babel
);
const babelStateReducer = (state, action) => {
  return {
    ...state,
    [action]: !state[action]
  };
};
const initialCode = urlState.code || '';

function App() {
  const [babelState, toggleBabelState] = useReducer(
    babelStateReducer,
    initialBabelState
  );
  const [code, ast, error, onCodeChange] = useBabel(initialCode, babelState);
  const [marker, setMarker] = useMarker();
  const [selectedNode, onCursorChange] = useCursor(ast);

  useQueryParams({
    babel: babelState,
    code
  });

  return (
    <div className={styles.App}>
      <div className={styles.codeContainer}>
        <div className={styles.codeToolbar}>
          {Object.keys(babelState).map(key => {
            return (
              <Checkbox
                key={key}
                onChange={() => toggleBabelState(key)}
                checked={babelState[key]}
              >
                {toSentenceCase(key)}
              </Checkbox>
            );
          })}
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
          />
        )}
      </div>
      {/* <Drawer
          title="Settings"
          placement="left"
          closable={true}
          onClose={onClose}
          visible={this.state.visible}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer> */}
    </div>
  );
}

function useBabel(initialCode, babelOptions) {
  const [value, setValue] = useState(initialCode);
  const [error, setError] = useState(null);
  const [ast, setAst] = useState({});
  const onCodeChange = useCallback(value => setValue(value), [setValue]);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    let cancel = false;
    babel
      .parse(debouncedValue, babelOptions)
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
  }, [debouncedValue, babelOptions, setAst, setError]);

  return [value, ast, error, onCodeChange];
}

export default App;

function toSentenceCase(str) {
  return str
    .split(/(?=[A-Z])/)
    .map(part => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

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
            type: 'background'
          }
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
        selection.selectionLead.column
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
