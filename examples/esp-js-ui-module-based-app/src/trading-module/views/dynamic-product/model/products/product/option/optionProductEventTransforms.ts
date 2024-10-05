import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream} from 'esp-js-polimer';
import {DynamicProductEvents} from '../../../../events';
import {map, switchAll} from 'rxjs/operators';
import {of} from 'rxjs';
import {Product} from '../../product';
import {DynamicProductTileModel} from '../../../dynamicProductTileModel';

export class OptionProductEventTransforms {
    @eventTransformFor(DynamicProductEvents.Products.CommonProductEvents.ccyPair_changed)
    _ccyPairChanged(inputEventStream: InputEventStream<DynamicProductTileModel, DynamicProductEvents.Products.CommonProductEvents.CcyPairChangedEvent, Product>): OutputEventStream<DynamicProductEvents.Products.Option.CutsLoadedEvent> {
        return inputEventStream
            .pipe(
                map(({event, model, context}: InputEvent<DynamicProductTileModel, DynamicProductEvents.Products.CommonProductEvents.CcyPairChangedEvent, Product>) => {
                    const entity = model.products.get(context.entityKey);
                    const cuts = [];
                    // mock up some ccy-pair-specific cuts:
                    if (entity.ccyPairField.ccyPair === 'EURUSD') {
                        cuts.push('EURUSD Cuts', 'NY 10:00', 'NY 18:00');
                    } else if (entity.ccyPairField.ccyPair === 'USDJPY') {
                        cuts.push('USDJPY Cuts', 'TOK 15:00', 'NY 10:00');
                    } else if (entity.ccyPairField.ccyPair === 'GBPAUD') {
                        cuts.push('GBPAUD Cuts', 'SY 10:00', 'LND 09:00');
                    } else {
                        cuts.push('Unknown Cuts');
                    }
                    let addProductConfiguredEvent: OutputEvent<DynamicProductEvents.Products.Option.CutsLoadedEvent> = {
                        eventType: DynamicProductEvents.Products.Option.cuts_loaded,
                        address: {
                            entityKey: context.entityKey
                        },
                        event: {
                            cuts: cuts
                        }
                    };
                    return of(addProductConfiguredEvent);
                }),
                switchAll(),
            );
    }
}