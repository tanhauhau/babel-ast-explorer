import React, { useState, useCallback, useReducer } from 'react';
import { BABEL_CONFIG_MAP, getOptionSettings } from './utils';
import { Select, Checkbox, Drawer, Button } from 'antd';
import Tags from './components/Tags';
import DrawerFooter from './components/DrawerFooter';
import styles from './style.module.scss';

const BABEL_VERSIONS = [
  '7.0.0',
  '7.1.0',
  '7.2.0',
  '7.2.2',
  '7.2.3',
  '7.2.4',
  '7.2.5',
  '7.3.0',
  '7.3.1',
  '7.3.2',
  '7.3.3',
  '7.3.4',
  '7.4.0',
  '7.4.1',
  '7.4.2',
  '7.4.3',
  '7.4.4',
  '7.4.5',
];

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
        Babel version <Select
          value={settings.version}
          onChange={version =>
            onChangeSettings({ type: 'setVersion', version })
          }
        >
          {BABEL_VERSIONS.map(value => (
            <Select.Option value={value} key={value}>
              {value}
            </Select.Option>
          ))}
        </Select>
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
                    const selectedValue =
                      settings[value] &&
                      settings[value].options &&
                      settings[value].options[option.key];

                    switch (option.type) {
                      case 'boolean':
                        return (
                          <div key={option.key}>
                            <Checkbox
                              disabled={!enabled}
                              checked={selectedValue}
                              onChange={event =>
                                onChangeSettings({
                                  type: 'setOption',
                                  value,
                                  option: option.key,
                                  optionValue: event.target.checked,
                                })
                              }
                            >
                              {option.key}
                            </Checkbox>
                          </div>
                        );
                      case 'enum': {
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
        <DrawerFooter />
      </Drawer>
    </>
  );
}

function babelSettingsReducer(state, action) {
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
          switch (option.type) {
            case 'enum':
              updatedOption.options[option.key] = option.value[0];
              break;
            case 'boolean':
              updatedOption.options[option.key] = !!updatedOption.options[
                option.key
              ];
              break;
            default:
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
    case 'setVersion':
      return {
        ...state,
        version: action.version,
      };
    default:
      return state;
  }
}

export function useBabelSettings(defaultSettings) {
  return useReducer(babelSettingsReducer, defaultSettings);
}

export default React.memo(BabelSettings);
