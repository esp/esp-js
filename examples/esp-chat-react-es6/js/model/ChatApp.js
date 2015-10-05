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
        this.threadSection.initialise();
        this.messageSection.initialise();
        this._observeInitEvent();
        this._observeThreadSelected();
    }
    preProcess() {
        this.messageSection.preProcess();
        this.threadSection.preProcess();
    }
    _observeInitEvent() {
        this.addDisposable(
            this._router.getEventObservable('InitEvent').observe((model, event, context) => {
                this._observeRawMessageStream();
            })
        );
    }
    _observeThreadSelected() {
        this.addDisposable(
            this._router.getEventObservable('ThreadSelected').observe((model, event, context) => {
                this.selectedThreadId = event.threadId;
                context.commit();
            })
        );
    }
    _observeRawMessageStream() {
        this._messageService.getMessagesStream()
            .subscribe(results => {
                // Push the results onto the routers dispatch loop.
                // This will ensures that the router knows about changes to state.
                // It will allow the router to run pre-processors, any actions, post-processors, any subsequently raised events (as below), and finally dispatch the model to model observers.
                this._router.runAction(() => {
                    for (var i = 0; i < results.rawMessages.length; i++) {
                        var rawMessage = results.rawMessages[i];
                        var threadRawMessages = this.rawMessagesByThreadId[rawMessage.threadId] || [];
                        threadRawMessages.push(rawMessage);
                        this.rawMessagesByThreadId[rawMessage.threadId] = threadRawMessages;
                    }
                    if (this.selectedThreadId === null && results.rawMessages.length > 0) {
                        this.selectedThreadId = results.rawMessages[0].threadId;
                    }

                    this._router.publishEvent("MessagesReceived", { rawMessages: results.rawMessages });
                });
            });
    }
}
