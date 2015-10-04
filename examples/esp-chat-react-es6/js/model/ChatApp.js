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
        this.addDisposable(this._router.observeEventsOn(this));
        this._threadSection.initialise();
        this._messageSection.initialise();
    }
    preProcess() {
        this._messageSection.hasChanges = false;
        this._threadSection.hasChanges = false;
    }
    _observe_InitEvent() {
        this._observeRawMessageStream();
    }
    _observe_ThreadSelected(model, event, eventContext) {
        this._selectedThreadId = event.threadId;
        eventContext.commit();
    }
    _observeRawMessageStream() {
        this.addDisposable(
            this._messageService.getMessagesStream()
                .subscribe(rawMessages => {
                    // Push the results onto the routers dispatch loop.
                    // This will ensures that the router knows about changes to state.
                    // It will allow the router to run pre-processors, any actions, post-processors, any subsequently raised events (as below), and finally dispatch the model to model observers.
                    this._router.runAction(() => {
                        for (var i = 0; i < rawMessages.length; i++) {
                            var rawMessage = rawMessages[i];
                            var threadRawMessages = this._rawMessagesByThreadId[rawMessage.threadId] || [];
                            threadRawMessages.push(rawMessage);
                            this._rawMessagesByThreadId[rawMessage.threadId] = threadRawMessages;
                        }
                        if (this._selectedThreadId === null && rawMessages.length > 0) {
                            this._selectedThreadId = rawMessages[0].threadId;
                        }
                        this._router.publishEvent("messagesReceived", { rawMessages: [ rawMessage ] });
                    });
                })
        );
    }
}
