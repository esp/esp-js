let defaults = require('../../__jest__/jest.config');
module.exports = {
    ...defaults,
    "setupFiles": [
        "<rootDir>/../../__jest__/configureEspLogging.ts"
    ]
};
