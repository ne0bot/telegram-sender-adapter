/**
 * index.js - Loads the telegram sender adapter
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const TelegramSenderAdapter = require('./telegram-sender-adapter');

module.exports = function(adapterManager, manifest) {
  new TelegramSenderAdapter(adapterManager, manifest.name);
};
