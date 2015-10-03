import esp from 'esp-js';

var entities = require('./model/index');
var ChatAppPreEventProcessor = require('./eventProcessors/ChatAppPreEventProcessor');

var router = new esp.Router();
// given this app only uses one model we can configure that here
var model = new entities.ChatAppModel();
router.registerModel('chatAppModelId', model, { preEventProcessor: ChatAppPreEventProcessor });
//router.registerModel('chatAppModelId', model);
// we can expose a model specific version of the router which can be required elsewhere
// This negates the need to worry about model Ids.
// See https://github.com/esp/esp-js#model-specific-routers for more info
var modelRouter = router.createModelRouter('chatAppModelId');

module.exports = modelRouter;