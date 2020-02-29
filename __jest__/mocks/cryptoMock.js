const nodeCrypto = require('crypto');
// https://github.com/jsdom/jsdom/issues/1612#issuecomment-454040272
global.crypto = {
    getRandomValues: function(buffer) { return nodeCrypto.randomFillSync(buffer);}
};