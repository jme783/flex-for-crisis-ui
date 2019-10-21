import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, { namespace } from './states';
import CustomThemeOverrides from './CustomThemeOverrides.js';

const PLUGIN_NAME = 'FfcDemoUiPlugin';

export default class FfcDemoUiPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    // Update the styling of the page to use the right colors
    manager.updateConfig(CustomThemeOverrides);

    flex.MainHeader.defaultProps.logoUrl = "https://sinopia-penguin-7201.twil.io/assets/hope-for-tomorrow-logo.svg"; 
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}

