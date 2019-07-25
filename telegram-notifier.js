const TelegramBot = require('node-telegram-bot-api');

const {
  Constants,
  Notifier,
  Outlet,
} = require('gateway-addon');

const config = {
    token: null,
    chatid: null,
  };

function createBot() {
    return new TelegramBot(config.token, {polling: false});
  }
  
  function getBotOptions() {
    return {
      token: config.token,
      chatid: config.chatid,
    };
  }
  
  function sendNotification(text) {
    const bot = createBot();
    const options = getBotOptions();
    return new Promise(function(resolve, reject) {
        bot.sendMessage(options.chatid, text);
      });


  }

  /**
 * An telegram sending outlet
 */
class TelegramSenderOutlet extends Outlet {
    /**
     * @param {TelegramSenderNotifier} notifier
     * @param {string} id - A globally unique identifier
     */
    constructor(notifier, id) {
      super(notifier, id);
      this.name = 'Telegram Sender';
    }
  
    async notify(title, message, level) {
      console.log(
        `Sending Telegram with message "${message}", and level "${level}"`
      );
  
      switch (level) {
        case Constants.NotificationLevel.LOW:
        case Constants.NotificationLevel.NORMAL:
            message = `(NOTICE) ${message}`;
          break;
        case Constants.NotificationLevel.HIGH:
            message = `(ALERT) ${message}`;
          break;
      }
  
      await sendNotification(message);
    }
  }

  /**
 * Email Sender Notifier
 * Instantiates one email sender outlet
 */
class TelegramNotifier extends Notifier {
    constructor(addonManager, manifest) {
      super(addonManager, 'telegram-sender', manifest.name);
  
      addonManager.addNotifier(this);
  
      Object.assign(config, manifest.moziot.config);
  
      if (!this.outlets['telegram-sender-0']) {
        this.handleOutletAdded(new TelegramSenderOutlet(this, 'telegram-sender-0'));
      }
    }
  }
  
  module.exports = TelegramNotifier;