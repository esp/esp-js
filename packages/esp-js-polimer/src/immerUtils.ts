// import produce from 'immer';
// import {PolimerHandlerMap} from './eventHandlers';
// import {EventContext} from 'esp-js';
//
// type FunctionProducerHandler<TState, TEvent, TStore> = (currentState: TState, event: TEvent, store: TStore, eventContext: EventContext) => TState;
// // TODO: delete this in favour of an 'if' statement
// type ComposedProducerHandler<TState, TEvent, TStore> = {
//     success?: FunctionProducerHandler<TState, TEvent, TStore>;
//     error?: FunctionProducerHandler<TState, TEvent, TStore>;
// };
//
// export type ProducerMap<TState, TEvent, TStore> = {
//     [index: string]: ComposedProducerHandler<TState, TEvent, TStore> | FunctionProducerHandler<TState, TEvent, TStore>
// };
//
// export const applyImmerToHandlers = <TState, TStore>(map: PolimerHandlerMap<TState, TStore>): ProducerMap<TState, any, TStore> => {
//     return Object.keys(map)
//         .reduce((aggregator, handlerKey) => {
//             const handler = map[handlerKey];
//
//             if (typeof handler === 'function') {
//                 // A note on the produce() overload we use, from https://github.com/mweststrate/immer:
//                 //
//                 // Passing a function as the first argument to produce is intended to be used for currying.
//                 // This means that you get a pre-bound producer that only needs a state to produce the value from.
//                 // The producer function gets passed in the draft, and any further arguments that were passed to the curried function.
//                 aggregator[handlerKey] = produce(handler);
//             } else if (typeof handler === 'object') {
//                 // This means it's a synthetic handler that has success and error fork
//                 aggregator[handlerKey] = {
//                     success: handler.success && produce(handler.success),
//                     error: handler.error && produce(handler.error)
//                 };
//             }
//
//             return aggregator;
//         }, {});
// };
