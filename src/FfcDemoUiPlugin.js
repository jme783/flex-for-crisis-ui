import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, { namespace } from './states';
import CustomThemeOverrides from './CustomThemeOverrides.js';

const PLUGIN_NAME = 'FfcDemoUiPlugin';

const infoPanelContent = `
  <h1>Conversation Info</h1>

  <h2>Channel</h2>
  <p>{{task.channelType}}</p>
  <h2>Created at</h2>
  <p>{{task.dateCreated}}</p>
  <h2>Status</h2>
  <p>{{task.status}}</p>
`;

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
    // Change the Logo
    flex.MainHeader.defaultProps.logoUrl = "https://sinopia-penguin-7201.twil.io/assets/hope-for-tomorrow-logo.svg"; 

    // Templated UI
    flex.Manager.getInstance().strings.TaskHeaderLine = "Anonymous";
    flex.Manager.getInstance().strings.SupervisorTaskHeaderLine = "Anonymous";
    flex.Manager.getInstance().strings.SupervisorTaskCardHeader = "Anonymous";

    flex.Manager.getInstance().strings.PredefinedChatMessageAuthorName = "Hope For Tomorrow Chatbot";
    flex.Manager.getInstance().strings.PredefinedChatMessageBody = "Thank you for contacting Hope For Tomorrow's crisis hotline. We want you to know that you are not alone, and we are here to listen.";
    

    flex.Manager.getInstance().strings.ChatWelcomeText = "Conversation started";
    flex.Manager.getInstance().strings.WelcomeMessage = "Welcome to Hope For Tomorrow's 24/7 Crisis Hotline";
    flex.Manager.getInstance().strings.TaskHeaderEndChat = "END CONVERSATION";
    
    manager.strings.TaskInfoPanelContent = infoPanelContent;
    manager.strings.SupervisorTaskInfoPanelContent = infoPanelContent;

    // Chat UI

    flex.MessagingCanvas.defaultProps.memberDisplayOptions = {
      yourDefaultName: 'You',
      theirDefaultName: 'Anonymous Person',
      yourFriendlyNameOverride: false,
      theirFriendlyNameOverride: false
    };

    flex.MessageListItem.defaultProps.authorName = "Foo";
    flex.MessageListItem.defaultProps.useFriendlyName = true;

    flex.MessagingCanvas.defaultProps.avatarCallback = (identity) => {
      // This is the identity if the message comes from Studio. Change the icon to be a robot
      if(identity.startsWith('CH')) {
        return "https://brand.twilio.com/assets/icons/product/product-icon-autopilot.svg"
      }
    }
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

