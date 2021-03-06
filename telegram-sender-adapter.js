process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const manifest = require('./manifest.json');
const {
  Adapter,
  Database,
  Device,
  // Property,
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

const telegramSenderThing = {
  type: 'thing',
  '@context': 'https://iot.mozilla.org/schemas',
  '@type': [],
  name: 'Telegram Sender',
  /*
  properties:
  {
    text: {

      label: 'Text',
      name: 'text',
      type: 'string',
      value: 'false',
    },
  },
  */
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
    },
  ],
  events: [],
};

/*
class TelegramProperty extends Property {
  constructor(device, name, propertyDescription) {
    super(device, name, propertyDescription);
    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);
  }

  /**
   * Set the value of the property.
   *
   * @param {*} value The new value to set
   * @returns a promise which resolves to the updated value.
   *
   * @note it is possible that the updated value doesn't match
   * the value passed in.
   * /
  setValue(value) {
    return new Promise((resolve, reject) => {
      super.setValue(value).then((updatedValue) => {
        sendNotification(updatedValue);
        resolve(updatedValue);
        this.device.notifyPropertyChanged(this);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
*/
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
    /*
    for (const propertyName in template.properties) {
      const propertyDescription = template.properties[propertyName];
      const property = new TelegramProperty(this, propertyName,
                                            propertyDescription);
      this.properties.set(propertyName, property);
    }
    */
    this.adapter.handleDeviceAdded(this);
  }

  async performAction(action) {
    console.log(`Performing action "${action.name}" with input:`, action.input);

    action.start();

    if (action.name === 'sendNotification') {
      await sendNotification(action.input.resp);
    }

    action.finish();
  }
}

/**
* Telegram Sender adapter
* Instantiates one telegram sender device
*/
class TelegramSenderAdapter extends Adapter {
  constructor(addonManager) {
    super(addonManager, 'telegram-sender', manifest.id);

    addonManager.addAdapter(this);

    const db = new Database(manifest.id);
    db.open().then(() => {
      return db.loadConfig();
    }).then((dbConfig) => {
      Object.assign(config, dbConfig);

      this.startPairing();
    }).catch(console.error);
  }

  startPairing() {
    if (!this.devices['telegram-sender-0']) {
      new TelegramSenderDevice(this, 'telegram-sender-0', telegramSenderThing);
    }
  }
}

module.exports = TelegramSenderAdapter;
