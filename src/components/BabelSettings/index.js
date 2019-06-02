import React, { useState, useCallback, useReducer } from 'react';
import { BABEL_CONFIG_MAP, getOptionSettings } from './utils';
import { Select, Checkbox, Drawer, Button } from 'antd';
import Tags from './components/Tags';
import styles from './style.module.scss';

function BabelSettings({ settings, onChangeSettings }) {
  const [opened, setOpened] = useState(false);
  const closeDrawer = useCallback(() => setOpened(false), [setOpened]);
  const openDrawer = useCallback(() => setOpened(true), [setOpened]);
  return (
    <>
      <div className={styles.topbar}>
        <Button
          type="primary"
          shape="circle"
          icon="setting"
          size="default"
          onClick={openDrawer}
        />
        <Tags settings={settings} onClick={openDrawer} />
      </div>
      <Drawer
        title="Babel Settings"
        placement="left"
        closable={false}
        onClose={closeDrawer}
        visible={opened}
        width={400}
        className={styles.drawer}
      >
        {BABEL_CONFIG_MAP.map(({ value, options }) => {
          const enabled = settings[value] && settings[value].enabled;
          return (
            <React.Fragment key={value}>
              <Checkbox
                checked={enabled}
                onChange={event => {
                  onChangeSettings({
                    type: event.target.checked ? 'toggleOn' : 'toggleOff',
                    value,
                  });
                }}
              >
                {value}
              </Checkbox>

              {options ? (
                <div className={styles.options}>
                  {options.map(option => {
                    switch (option.type) {
                      case 'boolean':
                        return (
                          <div key={option.key}>
                            <Checkbox disabled={!enabled}>
                              {option.key}
                            </Checkbox>
                          </div>
                        );
                      case 'enum': {
                        const selectedValue =
                          settings[value] &&
                          settings[value].options &&
                          settings[value].options[option.key];

                        return (
                          <Select
                            key={option.key}
                            value={selectedValue || option.value[0]}
                            disabled={!enabled}
                            onChange={optionValue =>
                              onChangeSettings({
                                type: 'setOption',
                                value,
                                option: option.key,
                                optionValue,
                              })
                            }
                          >
                            {option.value.map(value => (
                              <Select.Option value={value} key={value}>
                                {value}
                              </Select.Option>
                            ))}
                          </Select>
                        );
                      }
                      default:
                        return null;
                    }
                  })}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </Drawer>
    </>
  );
}

function babelSettingsReducer(state, action) {
  console.log('action', action);
  switch (action.type) {
    case 'toggleOn':
      const options = getOptionSettings(action.value);
      const updatedOption = {
        options: {},
        ...state[action.value],
        enabled: true,
      };
      if (!!options) {
        options.forEach(option => {
          if (option.type === 'enum') {
            updatedOption.options[option.key] = option.value[0];
          }
        });
      }
      return {
        ...state,
        [action.value]: updatedOption,
      };

    case 'toggleOff':
      return {
        ...state,
        [action.value]: {
          ...state[action.value],
          enabled: false,
        },
      };

    case 'setOption':
      return {
        ...state,
        [action.value]: {
          ...state[action.value],
          options: {
            ...state[action.value].options,
            [action.option]: action.optionValue,
          },
        },
      };
    default:
      return state;
  }
}

export function useBabelSettings(defaultSettings) {
  return useReducer(babelSettingsReducer, defaultSettings);
}

export default React.memo(BabelSettings);
