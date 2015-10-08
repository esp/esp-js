import esp from 'esp-js';
import MessageSection from './MessageSection';
import ThreadSection from './ThreadSection';

export default class ChatApp extends esp.model.DisposableBase {
    constructor(messageService, router) {
        super();
        this._messageService = messageService;
        this._router = router;
        this.rawMessagesByThreadId = {};
        this.selectedThreadId = null;
        this.threadSection = new ThreadSection(router);
        this.addDisposable(this.threadSection);
        this.messageSection = new MessageSection(router, messageService);
        this.addDisposable(this.threadSection);
    }
    initialise() {
        this.addDisposable(this._router.observeEventsOn(this));
        this.threadSection.initialise();
        this.messageSection.initialise();
    }
    preProcess() {
        this.messageSection.preProcess();
        this.threadSection.preProcess();
    }
    @esp.observeEvent('InitEvent')
    _observeInitEvent() {
        this._observeRawMessageStream();
    }
    @esp.observeEvent('ThreadSelected')
    _observeThreadSelected(event, context) {
        this.selectedThreadId = event.threadId;
        context.commit();
    }
    _observeRawMessageStream() {
        var _this = this;
        this._messageService.getMessagesStream()
            .subscribe(results => {
                // Push the results onto the routers dispatch loop.
                // This will ensures that the router knows about changes to state.
                // It will allow the router to run pre-processors, any actions, post-processors, any subsequently raised events (as below), and finally dispatch the model to model observers.
                _this._router.runAction(() => {
                    for (var i = 0; i < results.rawMessages.length; i++) {
                        var rawMessage = results.rawMessages[i];
                        var threadRawMessages = _this.rawMessagesByThreadId[rawMessage.threadId] || [];
                        threadRawMessages.push(rawMessage);
                        _this.rawMessagesByThreadId[rawMessage.threadId] = threadRawMessages;
                    }
                    if (_this.selectedThreadId === null && results.rawMessages.length > 0) {
                        _this.selectedThreadId = results.rawMessages[0].threadId;
                    }
                    _this._router.publishEvent("MessagesReceived", { rawMessages: results.rawMessages });
                });
            });
    }
}
