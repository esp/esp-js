import esp from 'esp-js';
import MessageSection from './MessageSection';
import ThreadSection from './ThreadSection';

export default class ChatApp extends esp.model.DisposableBase {
    constructor(messageService, router) {
        super();
        this._messageService = messageService;
        this._router = router;
        this._rawMessagesByThreadId = {};
        this._selectedThreadId = null;
        this._threadSection = new ThreadSection(router);
        this.addDisposable(this._threadSection);
        this._messageSection = new MessageSection(router);
        this.addDisposable(this._threadSection);
    }
    get rawMessagesByThreadId() {
        return this._rawMessagesByThreadId;
    }
    get selectedThreadId() {
        return this._selectedThreadId;
    }
    get threadSection() {
        return this._threadSection;
    }
    get messageSection() {
        return this._messageSection;
    }
    initialise() {
        this._threadSection.initialise();
        this._messageSection.initialise();
        this._observeInitEvent();
        this._observeThreadSelected();
    }
    preProcess() {
        this._messageSection.preProcess();
        this._threadSection.preProcess();
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
                this._selectedThreadId = event.threadId;
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
                        var threadRawMessages = this._rawMessagesByThreadId[rawMessage.threadId] || [];
                        threadRawMessages.push(rawMessage);
                        this._rawMessagesByThreadId[rawMessage.threadId] = threadRawMessages;
                    }
                    if (this._selectedThreadId === null && results.rawMessages.length > 0) {
                        this._selectedThreadId = results.rawMessages[0].threadId;
                    }

                    this._router.publishEvent("MessagesReceived", { rawMessages: results.rawMessages });
                });
            });
    }
}
