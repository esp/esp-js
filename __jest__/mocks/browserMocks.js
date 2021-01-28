const nodeCrypto = require('crypto');

const cryptoMock = {
    getRandomValues: function(buffer) { return nodeCrypto.randomFillSync(buffer);}
}
Object.defineProperty(window, 'crypto', {
    value: cryptoMock
})