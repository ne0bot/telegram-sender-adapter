process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');

const {
  Adapter,
  Database,
  Device,
} = require('gateway-addon');

const config = {
  token: null,
  chatid: null
};

function createBot() {
  return new TelegramBot(config.token, { polling: false });
}

function getBotOptions() {
  return {
    token: config.token,
    chatid: config.chatid
  };
}

function sendNotification(text) {
  const bot = createBot();
  const options = getBotOptions();
  bot.sendMessage(options.chatid, text);
}

const telegramSenderThing = {
  type: 'thing',
  '@context': 'https://iot.mozilla.org/schemas',
  '@type': [],
  name: 'Telegram Sender',
  properties: [],
  actions: [
    {
      name: 'sendNotification',
      metadata: {
        label: 'Send Notification',
        description: 'Send a notification to yourself',
        input: {
          type: 'object',
          properties: {
            resp: {
              type: 'string',
            },
          },
        },
      },
    }
  ],
  events: [],
};


/**
 * An telegram sending device
 */
class TelegramSenderDevice extends Device {
  /**
   * @param {TelegramSenderAdapter} adapter
   * @param {String} id - A globally unique identifier
   * @param {Object} template - the virtual thing to represent
   */
  constructor(adapter, id, template) {
    super(adapter, id);

    this.name = template.name;

    this.type = template.type;
    this['@context'] = template['@context'];
    this['@type'] = template['@type'];

    this.pinRequired = false;
    this.pinPattern = false;

    for (const action of template.actions) {
      this.addAction(action.name, action.metadata);
    }

    for (const event of template.events) {
      this.addEvent(event.name, event.metadata);
    }

    this.adapter.handleDeviceAdded(this);
  }

  async performAction(action) {
    console.log(`Performing action "${action.name}" with input:`, action.input);

    action.start();

    if (action.name === 'sendNotification') {
      sendNotification(action.input.resp);
    }

    action.finish();
  }
}

  /**
 * Telegram Sender adapter
 * Instantiates one telegram sender device
 */
class TelegramSenderAdapter extends Adapter {
  constructor(adapterManager, manifestName) {
    super(adapterManager, 'telegram-sender', manifestName);

    adapterManager.addAdapter(this);
    this.addAllThings();
  }

  startPairing() {
    this.addAllThings();
  }

  async loadConfig() {
    const db = new Database(this.packageName);
    await db.open();
    const dbConfig = await db.loadConfig();
    Object.assign(config, dbConfig);
  }

  addAllThings() {
    this.loadConfig().catch(function (err) {
      console.warn('Error updating config', err);
    });

    if (!this.devices['telegram-sender-0']) {
      new TelegramSenderDevice(this, 'telegram-sender-0', telegramSenderThing);
    }
  }
}

module.exports = TelegramSenderAdapter;