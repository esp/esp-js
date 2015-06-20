export default class Status {
    static get Idle() { return 'idle'; }
    static get PreEventProcessing() { return 'preEventProcessorDispatch'; }
    static get EventProcessorDispatch() { return 'eventProcessorDispatch'; }
    static get EventExecution() { return 'eventProcessorExecution'; }
    static get PostProcessing () { return 'postEventProcessorDispatch'; }
    static get DispatchModelUpdates() { return 'dispatchModelUpdates'; }
    static get Halted() { return 'halted'; }
}