import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, { namespace } from './states';
import CustomThemeOverrides from './CustomThemeOverrides.js';

const PLUGIN_NAME = 'FfcDemoUiPlugin';
const axios = require('axios');

const infoPanelContent = `
  <h1>Conversation Info</h1>

  <h2>Channel</h2>
  <p>{{task.channelType}}</p>
  <h2>Created at</h2>
  <p>{{task.dateCreated}}</p>
  <h2>Status</h2>
  <p>{{task.status}}</p>
`;

const anonymousText = "Anonymous";

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

    flex.Actions.replaceAction("AcceptTask", (payload, original) => {
      original(payload).then(() => {
        this.anonymizeFriendlyName(manager);
      })
    });

    // Send a follow-up survey
    flex.Actions.addListener("afterWrapupTask", (payload) => {
      this.sendPostConversationSurvey(payload, manager);
    });

    // Update the styling of the page to use the right colors
    manager.updateConfig(CustomThemeOverrides);
    // Change the Logo
    flex.MainHeader.defaultProps.logoUrl = "https://sinopia-penguin-7201.twil.io/assets/hope-for-tomorrow-logo.svg"; 

    // Templated UI
    manager.strings.TaskHeaderLine = anonymousText;
    manager.strings.SupervisorTaskHeaderLine = anonymousText;
    manager.strings.SupervisorTaskCardHeader = anonymousText;
    manager.strings.CallParticipantCustomerName = anonymousText;
    manager.strings.LiveCommsOngoingCallMessage = anonymousText;
    manager.strings.SupervisorTaskViewContentHeader = `{{worker.fullName}}, ${anonymousText}`;

    manager.strings.NoTasks = "Nothing in your queue";
    manager.strings.NoTasksHintAvailable = "Awaiting an incoming conversation"

    manager.strings.PredefinedChatMessageAuthorName = "Hope For Tomorrow Chatbot";
    manager.strings.PredefinedChatMessageBody = "Thank you for contacting Hope For Tomorrow's crisis hotline. We want you to know that you are not alone, and we are here to listen.";
    

    manager.strings.ChatWelcomeText = "Conversation started";
    manager.strings.WelcomeMessage = "Welcome to Hope For Tomorrow's 24/7 Crisis Hotline";
    manager.strings.TaskHeaderEndChat = "END CONVERSATION";
    
    manager.strings.TaskInfoPanelContent = infoPanelContent;
    manager.strings.SupervisorTaskInfoPanelContent = infoPanelContent;

    // Chat UI

    flex.MessagingCanvas.defaultProps.memberDisplayOptions = {
      yourDefaultName: 'You',
      yourFriendlyNameOverride: false
    };

    flex.MessageListItem.defaultProps.useFriendlyName = true;

    flex.MessagingCanvas.defaultProps.messageStyle = "Squared";


    flex.MessagingCanvas.defaultProps.avatarCallback = (identity) => {
      // This is the identity if the message comes from Studio. Change the icon to be a robot
      if(identity.startsWith('Hope for Tomorrow')) {
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
/**
 * Anonymizes the phone number of the person contacting the hotline
 * by changing the Friendly Name used by the Webchat Chat Client
 * NOTE: This is a shabby way of doing this using setTimeout(). There
 * must be a better way, but I can't figure it out right now due to the limited
 * events that I can tap into. 
 * @param manager { Flex.Manager }
 */
  anonymizeFriendlyName(manager) {
    setTimeout(() => {
      manager.chatClient.getSubscribedUsers().then((users) => {
        users.forEach((user) => {
          if (user && user.identity.startsWith('sms_')) {
            user.updateFriendlyName(anonymousText);
            window.clearInterval();
          }
        });
      });
    }, 1500);
  }
  /**
   * Triggers a call to the Studio Flow to send a post conversation survey
   * Note! this currently is just set up to work with SMS. Should be configured to not blow up for use with Voice and Webchat
   * @param payload { Payload of the action }
   * @param manager { Flex.Manager }
   */
  sendPostConversationSurvey(payload, manager) {
    // Figure out what channel was just impacted
    manager.chatClient.getChannelBySid(payload.task.attributes.channelSid).then((channel) => {

      // This is no bueno — these should be moved into an environment variable if possible
      const FromPhoneNumber = "+12054311364";
      const TwilioAccountSid = "AC338a0043a65a2b237b282106bd95f0f5";
      const TwilioAuthToken = "756312e198faa001007973e003451695";
      const studioFlowId = "FWce8f29cac98eca262d75285eeac6e4af"

      // The To Phone Number is set as the channel's friendly name
      const ToPhoneNumber = channel.friendlyName;

      axios({
        method: "post",
        url: `https://studio.twilio.com/v1/Flows/${studioFlowId}/Executions`,
        auth: {
          username: TwilioAccountSid,
          password: TwilioAuthToken
        },
        data: `To=${ToPhoneNumber}&From=+${FromPhoneNumber}`
      }).then(() => {
        console.log("successfully sent post-conversation survey");
      })
      .catch((error) => {
        console.error(error);
      });
    });
  }
}

