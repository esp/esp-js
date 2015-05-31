export default class Status {
    static get Idle() { return 'idle'; }
    static get PreEventProcessing() { return 'preEventProcessorDispatch'; }
    static get EventDispatch() { return 'eventProcessorDispatch'; }
    static get EventExecution() { return 'eventProcessorExecution'; }
    static get PostProcessing () { return 'postEventProcessorDispatch'; }
    static get UpdateDispatch() { return 'updateDispatch'; }
    static get Halted() { return 'halted'; }
}