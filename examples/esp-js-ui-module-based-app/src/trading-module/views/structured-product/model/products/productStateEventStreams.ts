import {Router} from 'esp-js';
import {eventTransformFor, InputEvent, InputEventStream, ModelMapState, OutputEvent, OutputEventStream} from 'esp-js-polimer';
import {map, switchAll} from 'rxjs/operators';
import {of} from 'rxjs';
import {StructuredProductEvents} from '../../events';
import {ProductStateHandler} from './productStateHandlers';
import {StructureProductTileModel} from '../structureProductTileModel';
import {Product} from './product';

export class AddNewProductEventStream {

    constructor(private _modelId: string, private _router: Router) {
    }

    @eventTransformFor(StructuredProductEvents.Products.addProduct_requested)
    _addProduct(inputEventStream: InputEventStream<StructureProductTileModel, StructuredProductEvents.Products.AddProductRequestedEvent>): OutputEventStream<StructuredProductEvents.Products.AddProductConfiguredEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<StructureProductTileModel, StructuredProductEvents.Products.AddProductRequestedEvent>) => {

                    let { model, event } = inputEvent;

                    const newStateId = this._getNextId(model.products);

                    let productStateHandler = new ProductStateHandler();

                    this._router
                        .modelUpdater(this._modelId)
                        .withStateHandlerForModelMap('modelMapState', newStateId, productStateHandler)
                        .updateRegistrationsWithRouter();

                    let outputEvent: OutputEvent<StructuredProductEvents.Products.AddProductConfiguredEvent> = {
                        eventType: StructuredProductEvents.Products.addProduct_configured,
                        modelId: this._modelId,
                        event: {
                            newStateId: newStateId,
                            productType: event.productType
                        }
                    };
                    return of(outputEvent);
                }),
                switchAll()
            );
    }

    private _getNextId = (state: ModelMapState<Product>) => {
        // figure out what our next ID will be.
        // In real apps this could come in on the event or just be a GUID of sorts
        const lastId = state.items.length > 0
            ? Number(state.items[state.items.length - 1].espEntityId) + 1
            : 1;
        return lastId.toString();
    }
}