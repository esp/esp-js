import { logging } from '../system';

var _log = logging.Logger.create('DispatchLoopDiagnostic');

export class DispatchLoopDiagnosticNoop {

    addModel(modelId){
        if(window && window.__espAnalyticsMonitor) {
            window.__espAnalyticsMonitor.modelAdded(modelId);
        }
    }
    getSummary() {
        return 'Enable router.enableDiagnostics() to enable diagnostics';
    }
    publishEvent(modelId, eventType) {
        if(window && window.__espAnalyticsMonitor) {
            window.__espAnalyticsMonitor.eventPublished(modelId, eventType);
        }
    }
    broadcastEvent() {
    }
    executingEvent() {
    }
    runAction() {
    }
    eventEnqueued() {
    }
    eventIgnored() {
    }
    dispatchLoopStart() {
    }
    startingModelEventLoop() {
    }
    preProcessingModel() {
    }
    dispatchingEvents() {
    }
    dispatchingAction() {
    }
    dispatchingEvent() {
    }
    dispatchingViaDirective() {
    }
    dispatchingViaConvention() {
    }
    finishDispatchingEvent() {
    }
    postProcessingModel() {
    }
    endingModelEventLoop() {
    }
    dispatchingModelUpdates() {
    }
    dispatchLoopEnd() {
    }
    halted() {
    }
}

export class DispatchLoopDiagnostic {
    constructor() {
        this._currentDepth = -1;
        this._steps = [];
    }
    getSummary() {
        return this._steps.join('\r\n');
    }
    publishEvent(modelId, eventType) {
        this._pushStep(`[PublishEvent]:${modelId}:${eventType}`);
    }
    broadcastEvent(eventType) {
        this._pushStep(`[BroadcastEvent]:${eventType}`);
    }
    executingEvent(eventType) {
        this._pushStep(`[ExecutingEvent]:${eventType}`);
    }
    runAction(modelId) {
        this._pushStep(`[RunAction]:${modelId}`);
    }
    eventEnqueued(modelId, eventType) {
        this._incrementDepth();
        this._pushStep(`[EventEnqueued]:${modelId}:${eventType}`);
        this._decrementDepth();
    }
    eventIgnored(modelId, eventType) {
        this._incrementDepth();
        this._pushStep(`[EventIgnored(no observers)]:${modelId}:${eventType}`);
        this._decrementDepth();
    }
    dispatchLoopStart() {
        this._incrementDepth();
        this._pushStep(`[DispatchLoopStart]`);
    }
    startingModelEventLoop(modelId, initiatingEventType) {
        this._incrementDepth();
        this._pushStep(`[StartingModelEventLoop]${modelId}, InitialEvent: ${initiatingEventType}`);
    }
    preProcessingModel() {
        this._incrementDepth();
        this._pushStep(`[PreProcessingModel]`);
    }
    dispatchingEvents() {
        this._incrementDepth();
        this._pushStep(`[DispatchingEvents]`);
        this._incrementDepth();
    }
    dispatchingAction() {
        this._pushStep(`[DispatchingAction]`);
    }
    dispatchingEvent(eventType, stage) {
        this._pushStep(`[DispatchingEvent] ${eventType} ${stage}`);
    }
    dispatchingViaDirective(functionName) {
        this._incrementDepth();
        this._pushStep(`[DispatchingViaDirective] Handler Function: ${functionName}`);
        this._decrementDepth();
    }
    dispatchingViaConvention(functionName) {
        this._incrementDepth();
        this._pushStep(`[DispatchingViaConvention] Handler Function: ${functionName}`);
        this._decrementDepth();
    }
    finishDispatchingEvent() {
        this._decrementDepth();
        this._pushStep(`[FinishDispatchingEvent]`);
        this._decrementDepth();
    }
    postProcessingModel() {
        this._pushStep(`[PostProcessingModel]`);
        this._decrementDepth();
    }
    endingModelEventLoop() {
        this._pushStep(`[EndingModelEventLoop]`);
        this._decrementDepth();
    }
    dispatchingModelUpdates(modelId) {
        this._pushStep(`[DispatchingModelUpdates] ${modelId}`);
    }
    dispatchLoopEnd() {
        this._decrementDepth();
        this._pushStep(`[DispatchLoopEnd]`);
    }
    halted(err) {
        this._pushStep(`[Halted]`);
        this._pushStep(err);
        _log.error('\r\n' + this.getSummary());
    }
    _incrementDepth() {
        this._currentDepth++;
        if(this._currentDepth === 0) {
            this._steps = []; // reset
        }
    }
    _decrementDepth() {
        this._currentDepth--;
    }
    _pushStep(stepMessage) {
        this._steps.push(this._padSpaces(this._currentDepth) + stepMessage);
    }
    _padSpaces(length) {
        var spaces = ' ', i;
        for(i = 0; i < length; i++) {
            spaces += '  ';
        }
        return spaces;
    }
}