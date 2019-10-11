process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const manifest = require('./manifest.json');
const {
  Constants,
  Database,
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
  return bot.sendMessage(options.chatid, text);
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
  constructor(addonManager) {
    super(addonManager, 'telegram-sender', manifest.id);

    addonManager.addNotifier(this);

    const db = new Database(manifest.id);
    db.open().then(() => {
      return db.loadConfig();
    }).then((dbConfig) => {
      Object.assign(config, dbConfig);

      if (!this.outlets['telegram-sender-0']) {
        this.handleOutletAdded(
          new TelegramSenderOutlet(this, 'telegram-sender-0')
        );
      }
    }).catch(console.error);
  }
}

module.exports = TelegramNotifier;
